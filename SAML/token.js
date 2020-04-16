let db

const crypto = require('crypto');


module.exports =  (injectedDB) => {

    db = injectedDB


    return  {
        generateAccessToken: generateAccessToken,
    }
}

function generateAccessToken() {
    return crypto.randomBytes(20).toString('hex');
}