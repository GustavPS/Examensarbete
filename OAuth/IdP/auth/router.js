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
module.exports = (router, expressApp, authRoutesMethods) => {

    router.post('/register', authRoutesMethods.registerUser)

    /* 
    This is the endpoint that Service Providers can redirect to, it checks if
    the user have a valid session at this server (the IdP). If the user 
    have a valid access token he/she will be redirected to req.body.redirect_uri. If 
    he/she doesn't have a valid access token he/she will be reidrected to the login page.
    */
    router.post('/authenticated', function(req, res) {
        if (req.session.access_token != undefined) {
            let userID = expressApp.oauth.model.getUserIDFromToken(req.session.access_token);

            // Invalid or expired token
            if (userID == null) {
                console.log('A user is authenticated with an expired token, redirecting to login page.');
                res.redirect('http://localhost:4000?redirect_uri=' + req.body.redirect_uri);
                return;
            }
            req.session.userid = userID;
            console.log(`User ${req.session.userid} id already authenticated, redirecting to callback url!`);
            res.redirect(307, req.body.redirect_uri + "?token="+req.session.access_token + "&userid=" + userID);
        } else {
            console.log("A user is not authenticated, redirecting to login page.");
            res.redirect('http://localhost:4000?redirect_uri=' + req.body.redirect_uri);
            return;
        }
    });

    /*
    This endpoint validates a access token. The SP (Service Provider) makes a request
    to this endpoint after the authentication to make sure it recieved a valid
    access token.
    */
    router.post('/accessTokenValid', function(req, res) {
        let result = {
            success: false
        }
        if (req.body.access_token != undefined) {
            let userID = expressApp.oauth.model.getUserIDFromToken(req.body.access_token);
            if (userID != null) {
                result.success = true;
            }
        }
        res.json(result);
    });

    /*
    This endpoint is for logging out the user at the IdP. It simply removes the sessions access token.
    */
    router.post('/logout', function(req, res) {
        console.log(`User ${req.session.userid} has logged out!`);
        if (req.session.access_token != undefined) {
            expressApp.oauth.model.removeTokenFromDB(req.session.access_token);
            req.session.access_token = null;
        }
        res.redirect(req.body.redirect_uri);
    });

    /*
    This endpoint is for logging the user in.
    It gets called from this server (the IdP) to validate the credentials
    that the user entered. If the credentials are valid an access token is generated
    and the user is redirected to redirect_uri.
    */
    router.post('/login', function(req, res) {
       expressApp.oauth.model.getUser(req.body.username, req.body.password, (err, user) => {
           if (user === null) {
               console.log('A user tried to login with invalid credentials');
               res.redirect(302, '/?redirect_uri=' + req.body.redirect_uri + '&error=username_password');
               return;
           }
           access_token = expressApp.oauth.model.generateAccessToken();
           expressApp.oauth.model.saveAccessToken(access_token, null, null, user, () => {
               req.session.access_token = access_token;
                 req.session.userid = req.body.username;
                 console.log(`User ${req.session.userid} has logged in!`);
               res.redirect(307, req.body.redirect_uri + "?token="+req.session.access_token + "&userid=" + req.body.username);
           });
       });
    });


    return router
}