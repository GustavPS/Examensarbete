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
 * @param authRoutesMethods - an object which contains the registration method. It
 *                           can be populated with other methods such as deleteUser()
 *                           if you decide to build out of this project's structure.
 * @return {route}
 */
module.exports = (router, expressApp, authRoutesMethods) => {

    function test(req, res) {
        console.log("schomme")
        res.send("TJENIXEN");
    }

    /* This is the route client's will call to register new users. It's very aptly named. */
    router.post('/register', authRoutesMethods.registerUser)

    /* This is the route for allowing existing users to login using a username and
    passsword. If they successfully login this method will returns the bearer token
    they need to access auth protected areas. the grant() method we pass in as
    middleware below will handle sending the bearer token back to the client as
    long as we validate their username and password properly using the mode we'll
    implement later in this tutorial. */

    router.post('/authenticated', function(req, res) {
        if (req.session.access_token != undefined) {
            console.log("hej");
            let userID = expressApp.oauth.model.getUserIDFromToken(req.session.access_token);

            // Invalid or expired token
            if (userID == null) {
                res.redirect('http://192.168.43.70:4000?redirect_uri=' + req.body.redirect_uri);
                return;
            }
            req.session.userid = userID;
            res.redirect(307, req.body.redirect_uri);
            console.log(req.session.access_token);
        } else {
            res.redirect('http://192.168.43.70:4000?redirect_uri=' + req.body.redirect_uri);
            return;
        }
    });

    router.post('/logout', function(req, res) {
        if (req.session.access_token != undefined) {
            expressApp.oauth.model.removeTokenFromDB(req.session.access_token);
            req.session.access_token = null;
        }
        res.redirect(req.body.redirect_uri);
    });

    router.post('/login', function(req, res) {
        /*
        var h = expressApp.oauth.grant();
        h(req, res);
        console.log(h);
        */



       expressApp.oauth.model.getUser(req.body.username, req.body.password, (err, user) => {
           console.log("titta här");
           console.log(user);
           if (user === null) {
               res.redirect(302, '/?redirect_uri=' + req.body.redirect_uri + '&error=username_password');
               return;
           }
           access_token = expressApp.oauth.model.generateAccessToken();
           expressApp.oauth.model.saveAccessToken(access_token, null, null, user, () => {
               req.session.access_token = access_token;
                 req.session.userid = req.body.username;

               console.log("saved");
               res.redirect(307, req.body.redirect_uri);
           });
       });
    });


    return router
}

/*
Användare vill komma åt innehåll på applikation 1
Applikation 1 kontaktar IdP med rätt headers och kollar om vi är inloggad
Om vi inte är inloggade redirectar IdP till inloggningssidan
När användaren loggat in skickar IdP tillbaka användaren till redirect_uri med access_token:en

*/