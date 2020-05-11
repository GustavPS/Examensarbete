const port = 4000
const sqlite3 = require('better-sqlite3')('database.db');
var cookieSession = require('cookie-session')

const bodyParser = require('body-parser')
const express = require('express')
const expressApp = express()
expressApp.use(bodyParser.urlencoded({ extended: true }))
expressApp.use(bodyParser.json())
expressApp.use(express.static("public"));
expressApp.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    httpOnly: false,
  
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }))


const oAuthModel = require('./auth/tokenModel')(sqlite3)

expressApp.oauth = {
    model: oAuthModel
}

const RoutesMethods = require('./auth/routesMethods')(sqlite3);
const AuthRouter = require('./auth/router')(express.Router(),
                                            expressApp,
                                            RoutesMethods)

const defRouter = require('./defRouter')(express.Router(), expressApp);



expressApp.use('/auth', AuthRouter);
expressApp.use(defRouter);
expressApp.listen(port, () => {
    console.log(`IdP listening on port ${port}`)
})

