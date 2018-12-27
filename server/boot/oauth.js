module.exports = function(app) {
  /*
  var oauth2 = require('loopback-component-oauth2');
  console.log("\n\n<<<<<<< IN OAUTH SETUP >>>>>>>>\n");
  var options = {
    dataSource: app.dataSources.db, // Data source for oAuth2 metadata persistence
    loginPage: '/login', // The login page URL
    loginPath: '/login', // The login form processing URL
    tokenPath: '/oauth/token',
    authorizationServer: true,
    resourceServer: true,
    authorizePath: '/oauth/authorize'
  };

  oauth2.oAuth2Provider(
    app, // The app instance
    options // The options
  );

  oauth2.authenticate(['/protected', '/api', '/account'], {
    session: false,
    scope: 'places'
  });
  */

  /*
    var router = app.loopback.Router();
    var passport = require('passport');
    // var CustomStrategy = require('passport-custom');
    var oauth2 = require('loopback-component-oauth2-server')

    var options = {
        // custom user model
        userModel: 'user',
        applicationModel: 'OAuthClientApplication',
        // -------------------------------------
        // Resource Server properties
        // -------------------------------------
        resourceServer: true,

        // used by modelBuilder, loopback-component-oauth2-server/models/index.js
        // Data source for oAuth2 metadata persistence
        dataSource: app.dataSources.db,

        // -------------------------------------
        // Authorization Server properties
        // -------------------------------------
        authorizationServer: true,

        // path to mount the authorization endpoint
        authorizePath: '/oauth/authorize',

        // path to mount the token endpoint
        tokenPath: '/oauth/token',

        // backend api does not host the login page
        loginPage: '/oauth/login',
        loginPath: '/oauth/login',
        loginFailPage: '/oauth/login?fail',

        // grant types that should be enabled
        supportedGrantTypes: [
            'implicit',
            'jwt',
            'clientCredentials',
            'authorizationCode',
            'refreshToken',
            'resourceOwnerPasswordCredentials'
        ]
    }
    oauth2.oAuth2Provider(
        app,
        options
    )

    passport.use('loopback-oauth2-local', new CustomStrategy(
        function(req, callback) {
            // Do your custom user finding logic here, or set to false based on req object
            // verify user name, password

            // findOrCreate local user

            // return user
            callback(null, user);
        }
    ));

    router.get('/oauth/login', function(req, res) {
        res.render('login', {
            loginFailed: req.query && req.query.fail == '' ? true : false
        });
    });

    // Set up the login handler
    router.post(options.loginPath || '/login',
        passport.authenticate('loopback-oauth2-local', {
            successReturnToOrRedirect: '/',
            passReqToCallback: true,
            failureRedirect: options.loginFailPage || '/login',
            failureFlash: true
        }));

    app.use(router);
*/
};
