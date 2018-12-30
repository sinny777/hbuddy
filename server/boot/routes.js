

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
      // console.info(token);
      res.json(token);
      /*
      res.render('home', {
        email: req.body.email,
        accessToken: token.id,
        redirectUrl: '/api/MyUsers/change-password?access_token=' + token.id
      });
      */
    });
  });

  //log a user in
  app.get('/login', function(req, res) {
    console.log("METHOD: ", req.method);
    console.log(req.headers);
    console.log(req.body);
    console.log(req.params);

    var auth = req.headers['authorization'];  // auth is in base64(username:password)  so we need to decode the base64
    console.log("Authorization Header is: ", auth);

    if(!auth) {
          res.statusCode = 401;
          res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
          res.end('<html><body>Need some creds son</body></html>');
    }else if(auth) {    // The Authorization was passed in so now we validate it

          var tmp = auth.split(' ');   // Split on a space, the original auth looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part
          var buf = new Buffer(tmp[1], 'base64'); // create a buffer and tell it the data coming in is base64
          var plain_auth = buf.toString();        // read it back out as a string
          console.log("Decoded Authorization ", plain_auth);
          // At this point plain_auth = "username:password"
          var creds = plain_auth.split(':');      // split on a ':'
          var username = creds[0];
          var password = creds[1];

          let credentials = {"username": username, "password": password};

          MyUser.login(credentials, 'user', function(err, token) {
            if (err) {
              res.statusCode = 401; // Force them to retry authentication
              res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
              // res.statusCode = 403;   // or alternatively just reject them altogether with a 403 Forbidden
              res.end('<html><body>You shall not pass</body></html>');
              /*
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
              */
              return;
            }
            console.info(token);
            res.json(token);
          });
    }
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




  app.post('/smarthome', function(request, response) {
    console.log('post /smarthome, HEADERS: ', request.headers);
    let reqdata = request.body;
    console.log('post /smarthome, PAYLOAD: ', reqdata);

    let authHeader = request.headers["authorization"];
    var authToken = authHeader.split(' ')[1];
    console.log("authToken: >> ", authToken);
    // let uid = datastore.Auth.tokens[authToken].uid;

    if (!reqdata.inputs) {
      response.status(401).set({
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }).json({error: 'missing inputs'});
    }
    for (let i = 0; i < reqdata.inputs.length; i++) {
      let input = reqdata.inputs[i];
      let intent = input.intent;
      if (!intent) {
        response.status(401).set({
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }).json({error: 'missing inputs'});
        continue;
      }
      switch (intent) {
        case 'action.devices.SYNC':
          console.log('post /smarthome SYNC');
          sync({
            uid: "169b7e62acfa358058afe1406232d465",
            auth: authToken,
            requestId: reqdata.requestId,
          }, response);
          break;
        case 'action.devices.QUERY':
          console.log('post /smarthome QUERY');
          console.log(reqdata.inputs[0].payload.devices);
          query({
            uid: "169b7e62acfa358058afe1406232d465",
            auth: authToken,
            requestId: reqdata.requestId,
          }, response);
          break;
        case 'action.devices.EXECUTE':
          console.log('post /smarthome EXECUTE');
          console.log(reqdata.inputs[0].payload.commands);
          executeCommand({
            uid: "169b7e62acfa358058afe1406232d465",
            auth: authToken,
            requestId: reqdata.requestId,
          }, response);
          break;
        default:
          response.status(401).set({
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }).json({error: 'missing intent'});
          break;
      }
    }
  });
  /**
   * Enables prelight (OPTIONS) requests made cross-domain.
   */
  app.options('/smarthome', function(request, response) {
    response.status(200).set({
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }).send('null');
  });

  function sync(data, response){
    let deviceList = [{
      "id": "123",
      "type": "action.devices.types.OUTLET",
      "traits": [
        "action.devices.traits.OnOff"
      ],
      "name": {
        "defaultNames": ["My Outlet 1234"],
        "name": "Night light",
        "nicknames": ["wall plug"]
      },
      "willReportState": false,
      "roomHint": "kitchen",
      "deviceInfo": {
        "manufacturer": "lights-out-inc",
        "model": "hs1234",
        "hwVersion": "3.2",
        "swVersion": "11.4"
      },
      "customData": {
        "fooValue": 74,
        "barValue": true,
        "bazValue": "foo"
      }
    },{
      "id": "456",
      "type": "action.devices.types.LIGHT",
        "traits": [
          "action.devices.traits.OnOff", "action.devices.traits.Brightness",
          "action.devices.traits.ColorTemperature",
          "action.devices.traits.ColorSpectrum"
        ],
        "name": {
          "defaultNames": ["lights out inc. bulb A19 color hyperglow"],
          "name": "lamp1",
          "nicknames": ["reading lamp"]
        },
        "willReportState": false,
        "roomHint": "office",
        "attributes": {
          "temperatureMinK": 2000,
          "temperatureMaxK": 6500
        },
        "deviceInfo": {
          "manufacturer": "lights out inc.",
          "model": "hg11",
          "hwVersion": "1.2",
          "swVersion": "5.4"
        },
        "customData": {
          "fooValue": 12,
          "barValue": false,
          "bazValue": "bar"
        }
      }];
         let deviceProps = {
           requestId: data.requestId,
           payload: {
             agentUserId: data.uid,
             devices: deviceList,
           },
         };
         console.log('sync response: >>> ', JSON.stringify(deviceProps));
         response.status(200).json(deviceProps);
         return deviceProps;

  }

  function query(data, response){
    let deviceStatus  = {
      "456": {
        "on": true,
        "online": true,
        "brightness": 80,
        "color": {
          "name": "cerulean",
          "spectrumRGB": 31655
        }
      }
    }

    let deviceProps = {
      requestId: data.requestId,
      payload: {
        agentUserId: data.uid,
        devices: deviceStatus,
      },
    };
    console.log('query response: >>> ', JSON.stringify(deviceProps));
    response.status(200).json(deviceProps);
    return deviceProps;

  }

  function executeCommand(data, response){
    let deviceProps = {
      requestId: data.requestId,
      payload: {
              "commands": [{
                "ids": ["456"],
                "status": "SUCCESS",
                "states": {
                  "on": true,
                  "online": true
                }
              }]
            }
    };
    console.log('execute response: >>> ', JSON.stringify(deviceProps));
    response.status(200).json(deviceProps);
    return deviceProps;
  }


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
