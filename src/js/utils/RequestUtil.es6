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
function request(url, method='GET', data={}, responseType='text', async=true) {
  return new Promise((resolve, reject) => {
    const xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function() {
      if (this.readyState === 4 && this.status === 200) {
        resolve(xhttp.responseText)
      }
    }
    xhttp.open(method, url, async);
    xhttp.send();
  }).catch( console.error )
}

module.exports = { request }