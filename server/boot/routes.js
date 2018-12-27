

  var path = require('path');
  var serveStatic = require('serve-static');

  var dsConfig = require('../datasources.json');
  var path = require('path');

// var setCurrentUser = require('../../server/middleware/context-currentUser')();
// var ensureLoggedIn = require('../../server/middleware/context-ensureLoggedIn')();

module.exports = function(app) {

  var router = app.loopback.Router();
  var MyUser = app.models.MyUser;

  //log a user in
  app.post('/login', function(req, res) {
    console.log(req.body);
    MyUser.login(req.body, 'user', function(err, token) {
      if (err) {
        if(err.details && err.code === 'LOGIN_FAILED_EMAIL_NOT_VERIFIED'){
          res.render('reponseToTriggerEmail', {
            title: 'Login failed',
            content: err,
            redirectToEmail: '/api/MyUsers/'+ err.details.userId + '/verify',
            redirectTo: '/',
            redirectToLinkText: 'Click here',
            userId: err.details.userId
          });
        } else {
          res.render('response', {
            title: 'Login failed. Wrong username or password',
            content: err,
            redirectTo: '/',
            redirectToLinkText: 'Please login again',
          });
        }
        return;
      }
      console.info(token);
      res.render('home', {
        email: req.body.email,
        accessToken: token.id,
        redirectUrl: '/api/MyUsers/change-password?access_token=' + token.id
      });
    });
  });

  //log a user in
  app.get('/login', function(req, res) {
    console.log("METHOD: ", req.method);
    console.log(req.headers);
    console.log(req.body);
    console.log(req.params);
    MyUser.login(req.body, 'user', function(err, token) {
      if (err) {
        if(err.details && err.code === 'LOGIN_FAILED_EMAIL_NOT_VERIFIED'){
          res.render('reponseToTriggerEmail', {
            title: 'Login failed',
            content: err,
            redirectToEmail: '/api/MyUsers/'+ err.details.userId + '/verify',
            redirectTo: '/',
            redirectToLinkText: 'Click here',
            userId: err.details.userId
          });
        } else {
          res.render('response', {
            title: 'Login failed. Wrong username or password',
            content: err,
            redirectTo: '/',
            redirectToLinkText: 'Please login again',
          });
        }
        return;
      }
      console.info(token);
      res.render('home', {
        email: req.body.email,
        accessToken: token.id,
        redirectUrl: '/api/MyUsers/change-password?access_token=' + token.id
      });
    });
  });

  //verified
  app.get('/verified', function(req, res) {
    res.render('verified');
  });

  //log a user out
  app.get('/logout', function(req, res, next) {
    if (!req.accessToken) return res.sendStatus(401);
    MyUser.logout(req.accessToken.id, function(err) {
      if (err) return next(err);
      res.redirect('/');
    });
  });

  //send an email with instructions to reset an existing user's password
  app.post('/request-password-reset', function(req, res, next) {
    User.resetPassword({
      email: req.body.email
    }, function(err) {
      if (err) return res.status(401).send(err);

      res.render('response', {
        title: 'Password reset requested',
        content: 'Check your email for further instructions',
        redirectTo: '/',
        redirectToLinkText: 'Log in'
      });
    });
  });

  //show password reset form
  app.get('/reset-password', function(req, res, next) {
    if (!req.accessToken) return res.sendStatus(401);
    res.render('password-reset', {
      redirectUrl: '/api/MyUsers/reset-password?access_token='+
        req.accessToken.id
    });
  });

  router.get('/status', app.loopback.status());

  // app.use(serveStatic(path.join(__dirname, '../../client/dist')));

/*
  app.use(serveStatic(path.join(__dirname, '../../client/dist')));

  var ignoredPaths = ['/api', '/explorer', '/status', '/auth'];
  app.all('/**', function(req, res, next) {
   if(!includes(req.originalUrl, ignoredPaths)){
     if(req.url == '/' || includes(req.originalUrl, ['/public', '/iot', '/account'])){
         res.sendFile('index.html', { root: path.resolve(__dirname, '../..', 'client/dist') });
     }else{
         // res.sendFile('index.html', { root: path.resolve(__dirname, '..', 'client/dist') });
        // console.log(path.resolve(__dirname, '../..', 'client/dist')+req.url);
        // res.sendFile(req.url, { root: path.resolve(__dirname, '../..', 'client/dist') });
        res.sendFile(path.resolve(__dirname, '../..', 'client/dist')+req.url);
     }
   } else {
       next();
   }
  });

  function includes(string, array) {
   for(i = 0; i < array.length; i++)
     if(string.includes(array[i])){
       return true;
     }
   return false;
  }
*/
  /*
  router.get('/account', setCurrentUser, ensureLoggedIn, function (req, res, next) {
        var ctx = server.req.getCurrentContext();
        var currentUser = ctx.get('currentUser');
        console.log("IN root.js, CurrentUser: >> ", currentUser);
        next();
    });
    */
  app.use(router);
};
