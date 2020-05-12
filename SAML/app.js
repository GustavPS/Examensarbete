const express = require('express');
const expressApp = express();
var exphbs  = require('express-handlebars');
const path = require('path');
const port = 3000;

var SAML = require('./saml');
var cookieSession = require('cookie-session');
expressApp.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    httpOnly: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

let saml = new SAML();
var parser = require('fast-xml-parser');

expressApp.use(express.json());       // to support JSON-encoded bodies
expressApp.use(express.urlencoded()); // to support URL-encoded bodies

expressApp.use(express.static("views"));
expressApp.engine('handlebars', exphbs());
expressApp.set('view engine', 'handlebars');

const sqlite3 = require('better-sqlite3')('database.db');
const token = require('./token')(sqlite3);
const users = require('./users')(sqlite3);

/**
 * Check that the user is authenticated
 * 
 * @param {object} session 
 */
function isAuthenticated(session) {
    if (session.username === undefined || session.accessToken === undefined) {
        return false;
    }
    return users.accessTokenMatch(session.username, session.accessToken);
}

/**
 * Sends the startpage to the user
 */
expressApp.get('/', (req, res) => {
    res.sendFile(
        path.join(__dirname + '/views/index.html')
    )
});

/**
 * Validate the SAML IdP response, generate a new accessToken and create a session for the user.
 * If the user does not exist create it. 
 * Redirect to requested resource.
 */
expressApp.post('/consume', (req, res) => {
    let xml = Buffer.from(req.body.SAMLResponse, 'base64').toString('UTF-8');
    let responseJson = parser.parse(xml);
    let username = responseJson['samlp:Response']['saml:Assertion']['saml:AttributeStatement']['saml:Attribute']['saml:AttributeValue'];
    
    accessToken = token.generateAccessToken();
    users.createUserIfNotExist(username);
    users.saveToken(username, accessToken);

    req.session.accessToken = accessToken;
    req.session.username = username;
    res.redirect(req.body.RelayState);
});

/**
 * Endpoint for logging out the user
 */
expressApp.post('/logout', (req, res) => {
    saml.logout(req, res);
});

/**
 * Renders the protected resource if the user is authenticated. If not start SAML authentication flow.
 */
expressApp.get('/profile', (req, res) => {
    if (isAuthenticated(req.session)) {
        res.render('profile', {name: req.session.username, layout: false});
    } else {
        saml.startAuth(req, res);
    }
});

expressApp.listen(port, () => {
    console.log(`SAML SP listening on port: ${port}`)
})

