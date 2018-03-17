
var request = require('request');

module.exports = async function(configServerUrl) {
    return new Promise((resolve, reject) => {
        if (configServerUrl == undefined || configServerUrl == '') {
            resolve(this.config);
            return;
        }

        request.get(configServerUrl, (err, res, body) => {
            try {
              var configData = JSON.parse(body).propertySources[0].source;
              this.config = {
                FO_URL: configData["FO_URL"],
                oauth2: {
                  clientId: configData["oauth2.client_id"],
                  clientSecret: configData["oauth2.client_secret"],
                  redirectUri: configData["oauth2.redirect_uri"]
                }
              }
            } catch(e) {
                console.error("Error: Could not load configuration from server " + configServerUrl)
                console.error(e)
            }
            resolve(this.config)
        })
    })
}
