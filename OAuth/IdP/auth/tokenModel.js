let db
let accessTokensDBHelper

const crypto = require('crypto');


module.exports =  (injectedDB) => {

    db = injectedDB


    return  {
        getUser: getUser,
        saveAccessToken: saveAccessToken,
        generateAccessToken: generateAccessToken,
        getUserIDFromToken: getUserIDFromToken,
        removeTokenFromDB: removeTokenFromDB
    }
}


/**
 * This method hashes a password using sha256
 * @param {string} password 
 * @return {hashedPassword}
 */
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('base64');
}

/**
 * The method attempts to find a user with the spceified username and password.
 *
 * @param username
 * @param password
 * @param callback
 * The callback takes 2 parameters.
 * This first parameter is an error of type boolean, and the second is a user object.
 */
function getUser(username, password, callback) {
    hashed = hashPassword(password);
    const user = db.prepare('SELECT * FROM users WHERE username=? AND password=?').get(username, hashed);

    if (user === undefined) {
        callback("Could not find user", null);
    } else {
        callback(false, user);
    }
}

/**
 * This function saves the accesstoken to the database.
 * When it's done it will call the callback function.
 * 
 * @param {string} accessToken 
 * @param {number} userID 
 * @param {function} callback 
 */

function saveTokenToDB(accessToken, userID, callback) {
    var d = new Date();
    d.setHours(d.getHours() + 1);
    var s = d.getTime();
    let stmt = db.prepare('DELETE FROM tokens WHERE userid = ?');
    stmt.run(userID);
    stmt = db.prepare('INSERT INTO tokens (userid, token, expires) VALUES (?, ?, ?)');
    stmt.run(userID, accessToken, s);
    callback(null);
}

/**
 * This function will remove the accesstoken from the databse
 * 
 * @param {string} accessToken 
 */
function removeTokenFromDB(accessToken) {
    let stmt = db.prepare('DELETE FROM tokens WHERE token = ?');
    stmt.run(accessToken);
}
/**
 * saves the accessToken along with the userID retrieved from the given user
 * Because this is a simple implementation clientID and expires will always be null, but
 * it's built to be easy to implement multiple clients.
 *
 * @param accessToken
 * @param clientID
 * @param expires
 * @param user
 * @param callback
 */
function saveAccessToken(accessToken, clientID, expires, user, callback){
   saveTokenToDB(accessToken, user.username, callback);
}


/**
 * This function tries to map an access token to a userID from the database
 * 
 * @param {string} token 
 */
function getUserIDFromToken(token) {
    const row = db.prepare('SELECT userid FROM tokens WHERE token = ?').get(token);
    if (row == undefined) {
        return null;
    }
    return row.userid;
}

/**
 * Generates an access token (a random 20 length string)
 */
function generateAccessToken() {
    return crypto.randomBytes(20).toString('hex');
}