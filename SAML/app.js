const express = require('express')
const expressApp = express()
const port = 3000;

var SAML = require('./saml');
var cookieSession = require('cookie-session')
expressApp.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    httpOnly: false,
  
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }))

let saml = new SAML();
var parser = require('fast-xml-parser');


expressApp.use(express.json());       // to support JSON-encoded bodies
expressApp.use(express.urlencoded()); // to support URL-encoded bodies
const sqlite3 = require('better-sqlite3')('database.db');
const token = require('./token')(sqlite3)
const users = require('./users')(sqlite3)

function isAuthenticated(session) {
    if (session.username === undefined || session.accessToken === undefined) {
        return false;
    }
    console.log(users.accessTokenMatch(session.username, session.accessToken))
    return users.accessTokenMatch(session.username, session.accessToken);
}

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

    // 2. Finns username i databasen, redirecta till RelayState med korrekt info (t.ex användarnamn)
    // 3. Finns inte username i databasen, skapa den och redirecta till RelayState med korrekt info (t.ex användarnamn)
})

expressApp.get('/profile', (req, res) => {
    if (isAuthenticated(req.session)) {
        res.send("Välkommen " + req.session.username) ;
    } else {
        saml.startAuth(req, res);
    }
    // Kolla om sessionen är valid (finns i databasen)
    // Om session inte är valid, kör saml.startAuth(req, res)
    // Om session är valid, rendera sidan

});

expressApp.listen(port, () => {

    console.log(`listening on port ${port}`)
})

//MARK: --------------- INITIALISE THE SERVER
