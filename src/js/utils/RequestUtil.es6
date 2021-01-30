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

  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest()
    if (requestType.toUpperCase() === 'GET') {
      xhr.onreadystatechange = function() {
        if (this.status === 200) {
          resolve(xhr.responseText)
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          })
        }
      }
      // xhr.open(requestType, url + '/?t=' + Math.random(), true);
      xhr.open(requestType, url, true)
      xhr.send()
    }
  })

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