const express = require('express')
var exphbs  = require('express-handlebars');
const path = require('path');
const app = express()
const port = 4001;
var Base64 = require('js-base64').Base64;
app.use(express.static("views"));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


getCookie = (name, cookies) => {
    var value = "; " + cookies;
    console.log(value);
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

decodeBase64 = (s) => {
    return JSON.parse(Base64.decode(s));
}

isAuthenticated = (cookie) => {
    return cookie !== undefined;
}

app.get('/', (req, res) => {
    res.sendFile(
        path.join(__dirname + '/public/index.html')
    )
})

app.get('/profile', (req, res) => {
    console.log(req.headers)
    let cookie = getCookie("session", req.headers.cookie);
    if (!isAuthenticated(cookie)) {
        res.redirect('/');
        return;
    }

    
    let json = decodeBase64(cookie);

    res.render('profile', {name: json.userid, layout: false});
    //res.send("Hello " + json.userid + "! Welcone to your profile.");
});

app.post('/callback', (req, res) => {

    res.redirect(302, '/profile');
})

app.listen(port, () => console.log(`Client app listening on port ${port}!`))