/* The userDBHelper is an object which will handle all of the user related db
operations  such as saving new users or retrieving existing ones. You can find
it in the userDBHelper.js in this projects databaseHelpers folder. */
let db;
const crypto = require('crypto');

/**
 * 
 * This module exports a function  which registers users by using
 * the specified injectedUserDBHelper.
 * 
 * @param injectedUserDBHelper - this object handles the execution of user
 * related database operation such as storing them when they register
 * 
 * @return {{registerUser: registerUser, login: *}}
 */
module.exports = injectedDB => {

    //assign the injectedUserDBHelper to the file's userDBHelper
    db = injectedDB

    return {
        registerUser: registerUser,
    }
}

/**
 *
 * Handles the requests to register a user. The request's body will contain
 * a username and password. The method which will check if the user exists, 
 * if they do exist then we will notify the client of this, and if they don't
 * exist then we will attempt to register the user, and then send the client a
 * response notifying them of whether or not the user was sucessfully registered
 *
 * @param req - request from api client
 * @param res - response to respond to client
 */
function registerUser(req, res){
    //get the username and password:
    const username = req.body.username
    let password = req.body.password
    console.log(req.body.username);

    //validate the request
    if (!isString(username) || !isString(password)){
        return sendResponse(res, "Invalid Credentials", true)
    }

    const row = db.prepare('SELECT * FROM users WHERE username=?').get(username);
    // Create account if it does not exist.
    if (row === undefined) {
        password = hashPassword(password);
        const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
        stmt.run(username, password);
        sendResponse(res, "Registration was successful", null);
    }
    // If an account with the username exists, redirect with error.
    else {
        sendResponse(res, "Failed to register user" , "User already exists.");
    }
}

/**
 *
 * sends a response created out of the specified parameters to the client.
 *
 * @param res - response to respond to client
 * @param message - message to send to the client
 * @param error - error to send to the client
 */
function sendResponse(res, message, error) {

    /* Here e create the status code to send to the client depending on whether
    or not the error being passed in is nukk. Then, we create and send
    the json object response to the client */
    res
        .status(error != null ? error != null ? 400 : 200 : 400)
        .json({
            'message': message,
            'error': error,
        })
}

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('base64');
}


/**
 *
 * Returns true the specified parameters is a string else it returns false
 *
 * @param parameter - the variable we're checking is a String
 * @return {boolean}
 */
function isString(parameter) {

    return parameter != null && (typeof parameter === "string"
                                        || parameter instanceof String) ? true : false
}
