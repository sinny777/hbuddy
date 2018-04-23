

  var path = require('path');
  var serveStatic = require('serve-static');

// var setCurrentUser = require('../../server/middleware/context-currentUser')();
// var ensureLoggedIn = require('../../server/middleware/context-ensureLoggedIn')();

module.exports = function(app) {

  var router = app.loopback.Router();

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
