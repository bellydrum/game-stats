/**
 * RequestUtil.js
 * written by bellydrum to make requests even simpler
 * ------------------------------------------------------------------------------
 * @param requestType   <string> - type of request
 * @param url           <string> - url from which to request data
 * @param data          <object> - OPTIONAL: data required to make request
 * @returns
 *  - success: {Promise<*>}
 *  - failure: error
 *    - there was an error making the request to the given url
 *
 * @about - standardized wrapper for requests
 */
async function request(requestType, url, data=null) {
  const xhr = new XMLHttpRequest();
  if (requestType.toLowerCase() === 'get') {
    // perform a get request
    xhr.onreadystatechange = function() {
      if (this.readyState === 4 && this.status === 200) {
        console.log("Here's the response")
        console.log(xhr.responseText)
      }
    }
    // xhr.open(requestType, url + '/?t=' + Math.random(), true);
    xhr.open(requestType, url, true);
    xhr.send();
  }

  // axios.get('https://api.github.com/users/mapbox')
  //   .then(response => {
  //     console.log(response.data.created_at);
  //   });

  // try {
  //   return await $.ajax({
  //     url: url,
  //     type: requestType,
  //     data: data,
  //     success: result => { return result },
  //     error: error => { return error }
  //   })
  // } catch(error) {
  //   throw error
  // }
}

module.exports = {request}