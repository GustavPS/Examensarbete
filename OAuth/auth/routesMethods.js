let db;
const crypto = require('crypto');

/**
 * 
 * This module exports a function  which registers users by using
 * 
 * 
 * @param injectedUserDBHelper - this object handles the execution of user
 * related database operation such as storing them when they register
 * 
 * @return {{registerUser: registerUser, login: *}}
 */
module.exports = injectedDB => {

    db = injectedDB

    return {
        registerUser: registerUser,
    }
}


function registerUser(req, res){
    //get the username and password:
    const username = req.body.username
    let password = req.body.password

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

function sendResponse(res, message, error) {
    
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
 * @param parameter
 * @return {boolean}
 */
function isString(parameter) {
    return parameter != null && (typeof parameter === "string"
                                        || parameter instanceof String) ? true : false
}
