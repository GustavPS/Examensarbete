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
 * Create an entry in the database if the user does not exist
 * @param {string} username 
 */
function createUserIfNotExist(username) {
    if (!userExist(username)) {
        createUser(username);
    }
}

 /**
  * Save the users token into the database
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
 * Returns true if token matches the username in the database else it returns false.
 * 
 * @param {string} username 
 * @param {string} token 
 */
function accessTokenMatch(username, token) {
    const row = db.prepare('SELECT * FROM user_token WHERE user_id = (SELECT id FROM users WHERE username = ?) AND token = ?').get(username, token);
    return row != undefined;
}

/**
 * Remove the users accesstoken from the database.
 * 
 * @param {string} username 
 */
function removeToken(username) {
    let stmt = db.prepare('DELETE FROM user_token WHERE user_id IN (SELECT id FROM users WHERE username = ?)');
    stmt.run(username);
}

/**
 * Check if the user exists in the database.
 * 
 * @param {string} username 
 */
function userExist(username) {
    const row = db.prepare('SELECT * FROM users WHERE username=?').get(username);
    return row != undefined;
}

/**
 * Creates an entry for the user in the database.
 *  
 * @param {string} username 
 */
function createUser(username) {
    let stmt = db.prepare('INSERT INTO users (username) VALUES (?)');
    stmt.run(username);
}