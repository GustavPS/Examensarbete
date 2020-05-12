let db

const crypto = require('crypto');


module.exports =  (injectedDB) => {

    db = injectedDB


    return  {
        createUserIfNotExist: createUserIfNotExist,
        saveToken: saveToken,
        accessTokenMatch: accessTokenMatch,
    }
}

/**
 * Creates an user in the database if the user does not exist
 * 
 * @param {string} username 
 */
function createUserIfNotExist(username) {
    if (!userExist(username)) {
        createUser(username);
    }
}

/**
 * Save the users token to the database
 * 
 * @param {string} username 
 * @param {string} token 
 */
function saveToken(username, token) {
    removeToken(username);
    let stmt = db.prepare('INSERT INTO user_token (user_id, token) VALUES ((SELECT id FROM users WHERE username = ?), ?)');
    stmt.run(username, token);
}

/**
 * Checks if the user and token matches a record in the database
 * 
 * @param {string} username 
 * @param {string} token 
 */
function accessTokenMatch(username, token) {
    const row = db.prepare('SELECT * FROM user_token WHERE user_id = (SELECT id FROM users WHERE username = ?) AND token = ?').get(username, token);
    return row != undefined;
}

/**
 * Removes a users token from the database
 * 
 * @param {string} username 
 */
function removeToken(username) {
    let stmt = db.prepare('DELETE FROM user_token WHERE user_id IN (SELECT id FROM users WHERE username = ?)');
    stmt.run(username);
}

/**
 * Returns true if a user exists in the database otherwise false
 * 
 * @param {string} username 
 */
function userExist(username) {
    const row = db.prepare('SELECT * FROM users WHERE username=?').get(username);
    return row != undefined;
}

/**
 * Adds a user to the database
 * 
 * @param {string} username 
 */
function createUser(username) {
    let stmt = db.prepare('INSERT INTO users (username) VALUES (?)');
    stmt.run(username);
}