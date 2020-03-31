var path = require('path');

/**
 *
 * @param router - we assign routes and endpoint functions for each route
 *                  to this object.
 *
 * @param expressApp - an instance of the express app. By applying
 *                     expressApp.oauth.grant() method to an endpoint
 *                     the endpoint will return a bearer token
 *                     to the client if it provides calid credentials.
 *
 * @return {route}
 */
module.exports = (router, expressApp) => {

    router.get('/', function(req, res) {
        res.sendFile(path.join(__dirname + '/public/index.html'));
    });

    router.post('/', function(req, res) {
        res.sendFile(path.join(__dirname + '/public/index.html'));
    });

    return router
}