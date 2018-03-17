var express = require('express');
var cors = require('cors');
var request = require('request');
var app = express();
var loadConfig = require('./config');
var cloudinary = require('cloudinary');

app.use(express.static('public'));
app.use(cors());

cloudinary.config({
  cloud_name: 'mbc-net',
  api_key: '875533594619936',
  api_secret: 'nbl3PHj2W2fsR53G7oZR47d_NlA'
});

function run(config) {
    console.log('loading config', config);
    const OAUTH2_AUTHORIZATION_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
    const OAUTH2_TOKEN_ENDPOINT =  "https://www.googleapis.com/oauth2/v4/token"
    const OAUTH2_SCOPE = "openid%20email%20profile"
    const CALLBACK_PATH = "/login/callback"
    const CLIENT_LOGIN_PATH = "/auth/login"

    const OAUTH2_CLIENT_ID = config.oauth2.clientId
    const OAUTH2_CLIENT_SECRET = config.oauth2.clientSecret
    const OAUTH2_REDIRECT_URI =  config.oauth2.redirectUri
    const PORT = process.env.SERVER_PORT || 8080
    const FO_URL = config.FO_URL;

    app.listen(PORT, function () {
        console.log('Back-Office App listening on port ' + PORT + '!')
    });

    app.get('/login', function(req, resp) {
        var state = "mbc" // TODO: generate session token to validate "code" request later
        resp.redirect(`${OAUTH2_AUTHORIZATION_ENDPOINT}?client_id=${OAUTH2_CLIENT_ID}&scope=${OAUTH2_SCOPE}&redirect_uri=${OAUTH2_REDIRECT_URI}&state=${state}&response_type=code`)
    });

    app.get(CALLBACK_PATH, function(req, resp) {
        var redirectUrl = CLIENT_LOGIN_PATH;
        var code = req.query.code;
        var state = req.query.state;
        if (code == undefined || code == '' || state != 'mbc') {
            resp.redirect(redirectUrl);
            return;
        }

        let options = {
            url: OAUTH2_TOKEN_ENDPOINT,
            form: {
                client_id: OAUTH2_CLIENT_ID,
                client_secret: OAUTH2_CLIENT_SECRET,
                code: code,
                redirect_uri: OAUTH2_REDIRECT_URI,
                grant_type: "authorization_code"
            }
        }

        request.post(options, function(err, res, body) {
            if (err == undefined) {
                let json = JSON.parse(body);
                redirectUrl += `?token=${json.id_token}`;
            }
            resp.redirect(redirectUrl);
        });
    });

    //TODO : redirect to FO for preview article and post
    app.get('/Pages/:pageId/:contentType/:entityId', function (req, resp) {
      let params = req.params;
      let redirectedUrl = FO_URL + '/Pages/' + params['pageId'] + '/'
        + params['contentType'] + '/' + params['entityId'] + '?preview=true';
      console.log('redirecting to FO : ', redirectedUrl);
      resp.redirect(redirectedUrl);
    });

    app.get('/cloudinary/search', function (req, resp) {
      cloudinary.api.search(req.query, function(result){
        resp.send(result)
      });
    });

    app.all("*", function(req, resp) {
        resp.sendFile('public/index.html' , { root : __dirname })
    });
};

process.on('SIGINT', function() {
    process.exit()
});

if (process.env.SERVICES_ENDPOINT != undefined) {
    let config_url = process.env.SERVICES_ENDPOINT + "/configs/_/bo-app/default";
    loadConfig(config_url)
    .then(run)
    .catch((error) => {
        console.error(`Cannot load configuration from Config Server: ${config_url}. Exit now!`, error);
        process.exit()
    });
} else { // fallback to localhost (Dev only)
    run({
        FO_URL : "http://localhost:8000",
        oauth2: {
            clientId: "715355925993-6ckhdrodkktji2fsfs8f9bta72d07bds.apps.googleusercontent.com",
            clientSecret: "vn6V4PMFjYvsyzfRgWXJNTMg",
            redirectUri: "http://localhost:8088/login/callback"
        }
    });
}
