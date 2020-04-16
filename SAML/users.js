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

function createUserIfNotExist(username) {
    if (!userExist(username)) {
        createUser(username);
    }
}

function saveToken(username, token) {
    removeToken(username);
    let stmt = db.prepare('INSERT INTO user_token (user_id, token) VALUES ((SELECT id FROM users WHERE username = ?), ?)');
    stmt.run(username, token);
}

function accessTokenMatch(username, token) {
    console.log(username);
    console.log(token);
    const row = db.prepare('SELECT * FROM user_token WHERE user_id = (SELECT id FROM users WHERE username = ?) AND token = ?').get(username, token);
    return row != undefined;
}


function removeToken(username) {
    let stmt = db.prepare('DELETE FROM user_token WHERE user_id IN (SELECT id FROM users WHERE username = ?)');
    stmt.run(username);
}

function userExist(username) {
    const row = db.prepare('SELECT * FROM users WHERE username=?').get(username);
    return row != undefined;
}

function createUser(username) {
    let stmt = db.prepare('INSERT INTO users (username) VALUES (?)');
    stmt.run(username);
}