const express = require('express')
var exphbs  = require('express-handlebars');
const path = require('path');
const app = express()
const request = require('request');
var cookieSession = require('cookie-session')
const port = 4001;
var Base64 = require('js-base64').Base64;
app.use(express.static("views"));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    httpOnly: false,
  
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }))

const sqlite3 = require('better-sqlite3')('database.db');
const users = require('./users')(sqlite3)

getCookie = (name, cookies) => {
    var value = "; " + cookies;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

decodeBase64 = (s) => {
    return JSON.parse(Base64.decode(s));
}

isAuthenticated = (session) => {
    if (session.userid === undefined || session.access_token === undefined) {
        return false;
    }
    return users.accessTokenMatch(session.userid, session.access_token);
}

app.get('/', (req, res) => {
    res.sendFile(
        path.join(__dirname + '/public/index.html')
    )
})

app.get('/profile', (req, res) => {
    let cookie = getCookie("session", req.headers.cookie);
    console.log("SESISON: " + req.session.access_token);
    if (!isAuthenticated(req.session)) {
        res.redirect('/');
        return;
    }

    
    //let json = decodeBase64(cookie);

    res.render('profile', {name: req.session.userid, layout: false});
    //res.send("Hello " + json.userid + "! Welcone to your profile.");
});

app.post('/callback', (req, res) => {
    console.log("TOKEN: " + req.query.token)

    // Check with the IdP if the access token is valid
    request.post({
        url: 'http://localhost:4000/auth/accessTokenValid',
        json: {
            access_token: req.query.token
        },
        headers: {
            'Content-Type': 'application/json'
        }
    }, (err, response, body) => {
        if (body.success) {
            users.createUserIfNotExist(req.query.userid);
            users.saveToken(req.query.userid, req.query.token);

            // Set the local session
            req.session.userid = req.query.userid;
            req.session.access_token = req.query.token;
            res.redirect(302, '/profile');
        } else {
            res.redirect(302, '/');
        }
    });

})

app.listen(port, () => console.log(`Client app listening on port ${port}!`))