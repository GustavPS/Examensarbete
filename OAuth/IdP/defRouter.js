var path = require('path');
/**
 *
 * @param router - A Router that we can assign endpoints to
 *
 * @param expressApp - An instance of the express App
 *
 * @param authRoutesMethods - An instance of the authRoutesMethod module
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