var loopback = require('loopback');
var LoopBackContext = require('loopback-context');
var boot = require('loopback-boot');
var serveStatic = require('serve-static');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var path = require('path');

require('dotenv').config({path: process.env.PWD+"/.env"});

var app = module.exports = loopback();

//Passport configurators..
var loopbackPassport = require('loopback-component-passport');
var PassportConfigurator = loopbackPassport.PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);

app.use(serveStatic(__dirname + '/client/dist'));
app.use('/api', loopback.rest());

var ignoredPaths = ['/api/', '/explorer', '/status', '/auth'];
app.all('/*', function(req, res, next) {
  console.log(req.originalUrl);
  if(req.originalUrl == "#"){
    req.originalUrl = "/";
  }
 if(!includes(req.originalUrl, ignoredPaths)){
   if(req.url == '/' || req.url == '/#' || includes(req.originalUrl, ['/public', '/iot', '/account'])){
       res.sendFile('index.html', { root: path.resolve(__dirname, '..', 'client/dist') });
   }else{
       res.sendFile(path.resolve(req.url), { root: path.resolve(__dirname, '..', 'client/dist') });
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

var bodyParser = require('body-parser');
app.middleware('parse', bodyParser.json({limit: 1024*1024*50, type:'application/json'}));
app.middleware('parse', bodyParser.urlencoded({
	limit: 1024*1024*50,
	extended: true,
	parameterLimit:50000,
	type:'application/x-www-form-urlencoding'
}));

var flash      = require('express-flash');

//attempt to build the providers/passport config
var config = {};
try {
  config = require('../server/providers.json');
} catch (err) {
  console.log(err);
  process.exit(1); // fatal
}

//The access token is only available after boot
app.middleware('auth', loopback.token({
  model: app.models.AccessToken
}));

/*
app.use(loopback.context());
app.use(loopback.token({
	model: app.models.AccessToken
}));
*/

app.use(LoopBackContext.perRequest());
app.use(loopback.token({
  model: app.models.accessToken,
  currentUserLiteral: 'me',
  searchDefaultTokenKeys: false,
  cookies: ['access_token'],
  headers: ['access_token', 'X-Access-Token'],
  params: ['access_token']
}));

/*
app.use(function setCurrentUser(req, res, next) {
  if (!req.accessToken) {
    return next();
  }
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  app.models.MyUser.findById(req.accessToken.userId, function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new Error('No user with this access token was found.'));
    }
    var loopbackContext = LoopBackContext.getCurrentContext();
    if (loopbackContext) {
      loopbackContext.set('currentUser', user);
    }
    next();
  });
});
*/

passportConfigurator.init();

//Requests that get this far won't be handled
//by any middleware. Convert them into a 404 error
//that will be handled later down the chain.
//app.use(loopback.urlNotFound());

app.start = function() {
	  // start the web server
	  return app.listen(function() {
	    app.emit('started');
	    var baseUrl = app.get('url').replace(/\/$/, '');
	    console.log('Web server listening at: %s', baseUrl);
	    if (app.get('loopback-component-explorer')) {
	      var explorerPath = app.get('loopback-component-explorer').mountPath;
	      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
	    }
	  });
	};

	app.on('uncaughtException', function(err) {
	    if(err.errno === 'EADDRINUSE')
	         console.log('err: >>>>' , err);
	    else
	         console.log(err);
	    app.exit(1);
	});

//The ultimate error handler.
// app.use(loopback.errorHandler());

//Bootstrap the application, configure models, datasources and middleware.
//Sub-apps like REST API are mounted via boot scripts.
bootOptions = { "appRootDir": __dirname};

boot(app, bootOptions, function(err) {
	if (err) throw err;

	//start the server if `$ node server.js`
	if (require.main === module){
		try{
			app.io = require('socket.io')(app.start());
		}catch(err){
			console.log(err);
		}
	}
});

//app.use(loopback.cookieParser(app.get('cookieSecret')));
app.use(cookieParser(app.get('cookieSecret')));

app.middleware('session:before', cookieParser(app.get('cookieSecret')));
app.middleware('session', expressSession({
  secret: 'kitty',
  saveUninitialized: true,
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  resave: true,
  httpOnly: true,
  ephemeral: true
}));

//We need flash messages to see passport errors
app.use(flash());

var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

passportConfigurator.setupModels({
	  userModel: app.models.user,
	  userIdentityModel: app.models.userIdentity,
	  userCredentialModel: app.models.userCredential,
	  applicationCredentialModel: app.models.applicationCredential
	});

for (var s in config) {
	var c = config[s];
	c.session = c.session !== false;
	passportConfigurator.configureProvider(s, c);
	}
