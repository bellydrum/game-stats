/**
 * An all-purpose Javascript object for general and specific application functionality.
 *
 * The app object is intended to be defined only once and stored in the browser cache.
 *
 * @note        Documented using a variant of JSDoc standards.
 * @see         https://devdocs.io/jsdoc/
 * @see         https://devhints.io/jsdoc
 *
 * @version     1.1.0
 * @description Added getCookieWrapper method to INIT FUNCTIONS.
 *
 * @link        https://gist.github.com/bellydrum/b8d482c63f81615aa22a51904bd3d420
 * @author      David Maness  <maness.david.a@gmail.com>
 * @since       x.x.x
 */

import {request} from './utils/RequestUtil.es6'
import {getDateFromStoredDate} from './utils/DateTimeUtil.es6'
import * as charts from './charts.es6'
import * as components from './components.es6'

(() => {
  document.addEventListener( 'DOMContentLoaded', () => {
    const app = {

      /**
       * GLOBALS
       *
       * Variables referenced throughout the application object.
       */

      csrftoken: window.csrftoken,
      cookie: null,
      onDesktop: null,
      req: request,
      refreshFreq: 500,
      currentlyActive: false,
      currentlyActiveTime: 0,
      activityRefreshInterval: null,
      chartRefreshInterval: null,
      currentGameData: {},

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

      activateDataEndpoints: ( className, excludedClass=null ) => {
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
        Array.from( document.getElementsByClassName( className ) ).forEach(( element ) => {
          if ( !( element.classList.contains( excludedClass ) ) ) {
            element.addEventListener('click', () => {
              location.href = element.getAttribute('data-endpoint')
            })
          }
        })
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

      activateLinks: () => {
        /**
         * Activates specified DOM elements as hyperlinks.
         *
         * See the definition of activateDataEndpoints() to see how this works.
         */
        app.activateDataEndpoints('main-navbar-item', 'navbar-menu-parent')
        app.activateDataEndpoints('footer-link')
      },

      activateListeners: () => {
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
        (() => {

          // All standard event listeners go below.

          /*
           * Standard event listeners stop here.
           * Below is reserved for the listener fired upon page exit.
           */
          window.addEventListener('beforeunload', () => {
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

            return null
          })

        })()
      },

      createCookieWrapper: () => {
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

          getAsObject() {
            /**
             * Returns the document cookie as a Javascript object.
             *
             * @returns {Object.<string, string>}
             *  Object that contains the values of the document cookie at the time of execution.
             */
            let cookieObject = {}
            document.cookie.split( '; ' ).forEach( item => {
              cookieObject[ item.split( '=' )[0] ] = item.split( '=' )[1]
            })
            return cookieObject
          },

          hasKey( key ) {
            /**
             * Determines whether or not the cookie contains a given key.
             *
             * @param {string} key
             * @returns {bool}
             */
            const cookieObject = this.getAsObject()
            return Object.keys( cookieObject ).includes( key )
          },

          getObjectByKey( key ) {
            /**
             * Takes a key and returns it with its value according to the document cookie.
             *
             * @param {string} key
             *  Used to parse the document cookie for a value.
             * @returns {Object.<string, string>}
             */
            return { key: this.getValueByKey( key ) }
          },

          getValueByKey( key ) {
            /**
             * Takes a key and returns only its value according to the document cookie.
             *
             * @param {string} key
             *  Used to parse the document cookie for a value.
             * @returns {string}
             *  The value of the given key according to the document cookie.
             */
            return this.getAsObject()[ key ]
          },

          /*
           * Methods above do NOT alter the document cookie.
           * Methods below DO alter the document cookie.
           */

          addObject( object ) {
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
            Object.keys( object ).forEach( key => {
              document.cookie = `${ key }=${ object[ key ] };`
            })
          },

          deleteByKey( key ) {
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
            document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
          },

          flush() {
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
            Object.keys( this.getAsObject() ).forEach(key => {this.deleteByKey( key ) })
            return this.getAsObject()
          }
        }
      },

      /**
       * UTILITIES
       *
       * General tools for app functionality
       */
      getGamesData: async () => {
        return JSON.parse(await app.req('http://buttcentral.net/games'))
      },
      getCurrentGameData: async () => {
        return JSON.parse(await app.req('http://buttcentral.net/latest_activity'))
      },

      /**
       * ENTRY POINT
       *
       * The first and only function to be executed on page load.
       */

      activate: async () => {
        /**
         * Executes the following block in order to "activate" the application on page load.
         *
         * All functions executed below are defined in the INIT FUNCTIONS section.
         */
        app.cookie = app.createCookieWrapper()
        app.activateLinks()
        app.activateListeners()
        await app.start()

      },

      /**
       * PAGE LOAD
       *
       * Behavior for the initial page load.
       */
      start: async () => {

        // render header with latest activity data
        components.renderHeaderCard(await app.getCurrentGameData())

        // start an interval of refreshing the page
        app.activityRefreshInterval = setInterval(async () => {

          // get latest activity data
          const currentGameData = await app.getCurrentGameData()
          // update activity data
          components.renderHeaderCard(currentGameData)
          // store current status for logoff check
          const statusFlag = app.currentlyActive
          // save current activity state
          app.currentlyActive = Object.keys(currentGameData.current_game).length !== 0
          // logging off: update charts
          if(statusFlag && !app.currentlyActive) {
            charts.renderCharts(await app.getGamesData())
          }
          // update time active and add it to current game time_played_seconds
          if(app.currentlyActive) {
            if(Object.keys(currentGameData.current_game).length !== 0) {
              app.currentlyActiveTime = Date.now() - getDateFromStoredDate(currentGameData.current_game.time_started)
            }
          }
          // logging on: start chart refresh interval
          if(!statusFlag && app.currentlyActive) {
            app.currentGameData = currentGameData
            app.chartRefreshInterval = setInterval(async () => {
              const gamesData = await app.getGamesData()
              gamesData[app.currentGameData.current_game.name].play_time_seconds = parseInt(app.currentlyActiveTime / 1000)
              charts.renderCharts(gamesData)
              if(!app.currentlyActive) {
                clearInterval(app.chartRefreshInterval)
              }
            }, app.refreshFreq)
          }
        }, app.refreshFreq);

        charts.renderCharts(await app.getGamesData(), true)
      }
    }

    // Application entry point.
    app.activate().catch( console.error )

  })
})()