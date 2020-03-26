const port = 4000

/* Get a connection to the mySql database */
//const mySqlConnection = require('./dbHelpers/mySqlWrapper')

/* The bearerTokenDBHelper handles all of the database operations
relating to saving and retrieving oAuth2 bearer tokens */
//const bearerTokensDBHelper =
//                require('./dbHelpers/bearerTokensDBHelper')
//                                                  (mySqlConnection)

/* The userDBHelper handles all of the database operations relating
to users such as registering and retrieving them */
//const userDBHelper = require('./dbHelpers/userDBHelper')
//                                              (mySqlConnection)

/* This is a library used to help parse the body of the api requests. */
const sqlite3 = require('better-sqlite3')('database.db');


const bodyParser = require('body-parser')
const express = require('express')
const expressApp = express()
expressApp.use(bodyParser.urlencoded({ extended: true }))
expressApp.use(bodyParser.json())

/* We require the node-oauth2-server library */
const oAuth2Server = require('node-oauth2-server')

/* Here we instantiate the model we just made and inject the dbHelpers we use in it */
const oAuthModel = require('./auth/tokenModel')(sqlite3)

/* Now we instantiate the oAuth2Server and pass in an object which tells
the the password library that we're using the password  grant type and
give it the model we just required. */
expressApp.oauth = oAuth2Server({
    model: oAuthModel,
    grants: ['password'],
    debug: true,
    options: {
        continueMiddleware: true
    }
})

/* Here we require the authRoutesMethods object from the module
 that we just made */
const RoutesMethods = require('./auth/routesMethods')(sqlite3);

/* Now we instantiate the authRouter module and inject all
of its dependencies. */
const AuthRouter = require('./auth/router')(express.Router(),
                                            expressApp,
                                            RoutesMethods)

const defRouter = require('./defRouter')(express.Router(), expressApp);



expressApp.use('/auth', AuthRouter);
expressApp.use(defRouter);
expressApp.use(expressApp.oauth.errorHandler())

//MARK: --------------- REQUIRED OBJECTS

//MARK: --------------- SET UP MIDDLEWARE



//MARK: --------------- SET UP MIDDLEWARE

//MARK: --------------- INITIALISE THE SERVER

//init the server
expressApp.listen(port, () => {

    console.log(`listening on port ${port}`)
})

//MARK: --------------- INITIALISE THE SERVER
