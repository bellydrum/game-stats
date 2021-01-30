(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.app = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}],2:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _RequestUtil = require("./utils/RequestUtil.es6");

var charts = _interopRequireWildcard(require("./charts.es6"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var app = {
      /**
       * GLOBALS
       *
       * Variables referenced throughout the application object.
       */
      csrftoken: window.csrftoken,
      cookie: null,
      onDesktop: null,
      req: _RequestUtil.request,

      /**
       * DOM LISTENERS
       *
       * Functions that are triggered by user interaction with the DOM.
       *
       * Listeners need to be defined after their respective DOM elements have been rendered.
       * Adding a DOM element with an associated listener after initial page load requires the listener to be re-defined.
       * See the definition of activateListeners() for more information on this.
       *
       * Application functions used within these listeners are defined in the PRIVATE FUNCTIONS section.
       */

      /**
       * PRIVATE FUNCTIONS
       *
       * Reserved for internal use by this application.
       */
      activateDataEndpoints: function activateDataEndpoints(className) {
        var excludedClass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        /**
         * Turns DOM element(s) into active hyperlinks based on that elements data-endpoint attribute value.
         *
         * @usage
         *    target: <div class="className" data-endpoint="cool-website.com"> ... </div>
         *    example: activateDataEndpoints( "className" )
         *
         * @param {string} className
         *    the CSS class name that refers to 1 or more elements whose hyperlink needs activation.
         * @param {string} [excludedClass]
         *    the CSS class name that refers to 1 or more elements that this function will ignore.
         *
         * @note
         *    The target DOM elements data-endpoint attribute value must be a valid URL.
         *
         * @return {null} This function returns nothing.
         *
         */
        Array.from(document.getElementsByClassName(className)).forEach(function (element) {
          if (!element.classList.contains(excludedClass)) {
            element.addEventListener('click', function () {
              location.href = element.getAttribute('data-endpoint');
            });
          }
        });
      },

      /**
       * INIT FUNCTIONS
       *
       * Activate parts of the application and make them interactive.
       *
       * Executed on page load or wherever necessary.
       * No parameters are required for any of these functions.
       * Not to be confused with PRIVATE FUNCTIONS; while private, these are used only one time by activate().
       */
      activateLinks: function activateLinks() {
        /**
         * Activates specified DOM elements as hyperlinks.
         *
         * See the definition of activateDataEndpoints() to see how this works.
         */
        app.activateDataEndpoints('main-navbar-item', 'navbar-menu-parent');
        app.activateDataEndpoints('footer-link');
      },
      activateListeners: function activateListeners() {
        /**
         * Add listeners to their respective DOM elements.
         *
         * Everything is wrapped in an immediately-invoked function expression (IIFE).
         * At the end of this block is a listener that fires when the user leaves the page.
         *
         * @see   IIFE (immediately-invoked function expressions)
         * @link  https://developer.mozilla.org/en-US/docs/Glossary/IIFE
         *
         * @see   document.querySelector
         * @link  https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector#Syntax
         *
         * @see   target.addEventListener
         * @link  https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Syntax
         *
         */
        (function () {
          // All standard event listeners go below.

          /*
           * Standard event listeners stop here.
           * Below is reserved for the listener fired upon page exit.
           */
          window.addEventListener('beforeunload', function () {
            /**
             * This listener executes when the user leaves the page.
             *
             * @note
             *  Returning a non-empty string will prompt the user to confirm leaving the page.
             *
             * @see     BeforeUnloadEvent
             * @link    https://developer.mozilla.org/en-US/docs/Web/API/BeforeUnloadEvent
             *
             * @return  {null}
             */
            return null;
          });
        })();
      },
      createCookieWrapper: function createCookieWrapper() {
        /**
         * Creates and returns a tool for accessing and updating the document cookie.
         *
         * @note
         *  It may be more beneficial to create and use a custom ES6 CookieWrapper class instead.
         *
         * @see     Document.cookie
         * @link    https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
         *
         * @see     CookieHelper
         * @link    https://gist.github.com/bellydrum/cfc7869243b4d5c4e7ae710ea59edf67
         *
         * @returns {Object} CookieWrapper
         *  A Javascript object with methods that allow access to the document cookie.
         *
         */
        return {
          getAsObject: function getAsObject() {
            /**
             * Returns the document cookie as a Javascript object.
             *
             * @returns {Object.<string, string>}
             *  Object that contains the values of the document cookie at the time of execution.
             */
            var cookieObject = {};
            document.cookie.split('; ').forEach(function (item) {
              cookieObject[item.split('=')[0]] = item.split('=')[1];
            });
            return cookieObject;
          },
          hasKey: function hasKey(key) {
            /**
             * Determines whether or not the cookie contains a given key.
             *
             * @param {string} key
             * @returns {bool}
             */
            var cookieObject = this.getAsObject();
            return Object.keys(cookieObject).includes(key);
          },
          getObjectByKey: function getObjectByKey(key) {
            /**
             * Takes a key and returns it with its value according to the document cookie.
             *
             * @param {string} key
             *  Used to parse the document cookie for a value.
             * @returns {Object.<string, string>}
             */
            return {
              key: this.getValueByKey(key)
            };
          },
          getValueByKey: function getValueByKey(key) {
            /**
             * Takes a key and returns only its value according to the document cookie.
             *
             * @param {string} key
             *  Used to parse the document cookie for a value.
             * @returns {string}
             *  The value of the given key according to the document cookie.
             */
            return this.getAsObject()[key];
          },

          /*
           * Methods above do NOT alter the document cookie.
           * Methods below DO alter the document cookie.
           */
          addObject: function addObject(object) {
            /**
             * Updates the document cookie.
             *
             * @note
             *  Immediately alters the document cookie with all given {key:value} pairs.
             *
             * @param {Object.<string, string>} object
             *  Values to be added to the cookie.
             * @returns {null}
             */
            Object.keys(object).forEach(function (key) {
              document.cookie = "".concat(key, "=").concat(object[key], ";");
            });
          },
          deleteByKey: function deleteByKey(key) {
            /**
             * Takes a key and deletes its value in the document cookie.
             *
             * @note
             *  Immediately alters the document cookie.
             *
             * @see     How to delete a cookie.
             * @link    https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie#Notes
             *
             * @param {string} key
             *  Key of the {key:value} pair to delete from the document cookie.
             * @returns {null}
             */
            document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          },
          flush: function flush() {
            var _this = this;

            /**
             * Deletes the document cookie.
             *
             * @note
             *  Immediately alters the document cookie.
             *
             * @see this.deleteByKey()
             *
             * @returns {Object.<string, string>}
             *  Object that contains only the values of the document cookie unable to be deleted.
             */
            Object.keys(this.getAsObject()).forEach(function (key) {
              _this.deleteByKey(key);
            });
            return this.getAsObject();
          }
        };
      },

      /**
       * UTILITIES
       *
       * General tools for app functionality
       */
      getGamesData: function () {
        var _getGamesData = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.t0 = JSON;
                  _context.next = 3;
                  return app.req('http://buttcentral.net/games');

                case 3:
                  _context.t1 = _context.sent;
                  return _context.abrupt("return", _context.t0.parse.call(_context.t0, _context.t1));

                case 5:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        function getGamesData() {
          return _getGamesData.apply(this, arguments);
        }

        return getGamesData;
      }(),
      getCurrentGameData: function () {
        var _getCurrentGameData = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.t0 = JSON;
                  _context2.next = 3;
                  return app.req('http://buttcentral.net/latest_activity');

                case 3:
                  _context2.t1 = _context2.sent;
                  return _context2.abrupt("return", _context2.t0.parse.call(_context2.t0, _context2.t1));

                case 5:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }));

        function getCurrentGameData() {
          return _getCurrentGameData.apply(this, arguments);
        }

        return getCurrentGameData;
      }(),

      /**
       * ENTRY POINT
       *
       * The first and only function to be executed on page load.
       */
      activate: function () {
        var _activate = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  /**
                   * Executes the following block in order to "activate" the application on page load.
                   *
                   * All functions executed below are defined in the INIT FUNCTIONS section.
                   */
                  app.cookie = app.createCookieWrapper();
                  app.activateLinks();
                  app.activateListeners();
                  _context3.next = 5;
                  return app.start();

                case 5:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3);
        }));

        function activate() {
          return _activate.apply(this, arguments);
        }

        return activate;
      }(),

      /**
       * PAGE LOAD
       *
       * Behavior for the initial page load.
       */
      start: function () {
        var _start = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
          var games, currentGameData;
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.next = 2;
                  return app.getGamesData();

                case 2:
                  games = _context4.sent;
                  _context4.next = 5;
                  return app.getCurrentGameData();

                case 5:
                  currentGameData = _context4.sent;
                  charts.renderMostPlayedGames(games);

                case 7:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4);
        }));

        function start() {
          return _start.apply(this, arguments);
        }

        return start;
      }()
    }; // Application entry point.

    app.activate()["catch"](console.error);
  });
})();

},{"./charts.es6":3,"./utils/RequestUtil.es6":6}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderMostPlayedGames = renderMostPlayedGames;

function renderMostPlayedGames(games) {
  var gameTitlesSortedByTimePlayed = Object.entries(games).map(function (game) {
    return [game[1].name, game[1].play_time_seconds];
  }).sort(function (a, b) {
    return b[1] - a[1];
  });
  var tenMostPlayedGames = gameTitlesSortedByTimePlayed.slice(0, 10).map(function (name) {
    return games[name[0]];
  });
  tenMostPlayedGames.forEach(function (game) {
    return console.log(game);
  });
  var options = {
    series: [{
      data: tenMostPlayedGames.map(function (game) {
        return game.play_time_seconds;
      })
    }],
    chart: {
      type: 'bar',
      height: 380
    },
    plotOptions: {
      bar: {
        barHeight: '100%',
        distributed: true,
        horizontal: true,
        dataLabels: {
          position: 'bottom'
        }
      }
    },
    colors: ['#33b2df', '#546E7A', '#d4526e', '#13d8aa', '#A5978B', '#2b908f', '#f9a3a4', '#90ee7e', '#f48024', '#69d2e7'],
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: {
        colors: ['#444']
      },
      formatter: function formatter(val, opt) {
        return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val;
      },
      offsetX: 0,
      dropShadow: {
        enabled: false
      }
    },
    stroke: {
      width: 1,
      colors: ['#fff']
    },
    xaxis: {
      categories: tenMostPlayedGames.map(function (game) {
        return game.name;
      })
    },
    yaxis: {
      labels: {
        show: false
      }
    },
    title: {
      text: 'Top ten most-played games',
      align: 'center',
      floating: true
    },
    tooltip: {
      theme: 'dark',
      x: {
        show: false
      },
      y: {
        title: {
          formatter: function formatter() {
            return '';
          }
        }
      }
    }
  };
  var chart = new ApexCharts(document.querySelector("#gameplayTimeChart"), options);
  chart.render();
}

},{}],4:[function(require,module,exports){
"use strict";

},{}],5:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"dup":4}],6:[function(require,module,exports){
"use strict";

/**
 * RequestUtil.js
 * written by bellydrum to make requests even simpler
 * ------------------------------------------------------------------------------
 * @param url           <string>  - url from which to request data
 * @param method        <string>  - OPTIONAL: type of request
 * @param data          <object>  - OPTIONAL: data required to make request
 * @param responseType  <string>  - OPTIONAL: expected response type
 * @param async         <boolean> - OPTIONAL: whether or not to await this call
 * @returns
 *  - success: {Promise<*>}
 *  - failure: error
 *    - there was an error making the request to the given url
 *
 * @about - standardized wrapper for requests
 */
function request(url) {
  var method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'GET';
  var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var responseType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'text';
  var async = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
  return new Promise(function (resolve, reject) {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        resolve(xhttp.responseText);
      }
    };

    xhttp.open(method, url, async);
    xhttp.send();
  })["catch"](console.error);
}

module.exports = {
  request: request
};

},{}],7:[function(require,module,exports){
"use strict";

require("regenerator-runtime/runtime");

},{"regenerator-runtime/runtime":1}]},{},[2,4,5,6,7])(7)
});