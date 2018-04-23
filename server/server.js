require('cls-hooked');
var loopback = require('loopback');
var LoopBackContext = require('loopback-context');
var boot = require('loopback-boot');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var path = require('path');

require('dotenv').config({path: process.env.PWD+"/.env"});

var app = module.exports = loopback();

//Passport configurators..
var loopbackPassport = require('loopback-component-passport');
var PassportConfigurator = loopbackPassport.PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);

// app.use(loopback.static(path.resolve(__dirname, '../client/dist')));
// app.use('/api', loopback.rest());

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
/*
app.middleware('parse', bodyParser.json({limit: 1024*1024*50, type:'application/json'}));
app.middleware('parse', bodyParser.urlencoded({
	limit: 1024*1024*50,
	extended: true,
	parameterLimit:50000,
	type:'application/x-www-form-urlencoding'
}));
*/

var flash = require('express-flash');

//attempt to build the providers/passport config
var config = {};
try {
  config = require('../server/providers.json');
} catch (err) {
  console.log(err);
  process.exit(1); // fatal
}

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

passportConfigurator.init(false);

/*
app.middleware('auth', loopback.token({
  model: app.models.CustomAccessToken,
  currentUserLiteral: 'me',
  searchDefaultTokenKeys: false,
  cookies: ['access_token'],
  headers: ['access_token', 'X-Access-Token'],
  params: ['access_token']
}));
*/

/*
var myContext = require('./middleware/context-myContext')();
app.use(myContext);

// put currentUser in req.context on /api routes
var getCurrentUserApi = require('./middleware/context-currentUserApi')();
app.use(getCurrentUserApi);

// use basic-auth for development environment
if (app.get('env') === 'development') {
  var basicAuth = require('./middleware/basicAuth')();
  app.use(basicAuth);
}
*/

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

// var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

passportConfigurator.setupModels({
	  userModel: app.models.MyUser,
	  userIdentityModel: app.models.UserIdentity,
	  userCredentialModel: app.models.UserCredential,
		applicationCredential: app.models.ApplicationCredential
	});

function customProfileToUser(provider, profile, options) {
  // console.log("IN customProfileToUser: >>> ", profile);
	var userObj = profile["_json"];
	userObj.firstName = userObj.given_name;
	userObj.lastName = userObj.family_name;
	delete userObj["given_name"];
	delete userObj["family_name"];
	delete userObj["_raw"];

  var userInfo = {
    providerId: profile.id,
    username: profile.emails[0].value,
    password: 'secret',
    email: profile.emails[0].value,
    profile: userObj
  };
  return userInfo;
}

for (var s in config) {
	var c = config[s];
	c.session = c.session !== false;
  c.profileToUser = customProfileToUser;
	passportConfigurator.configureProvider(s, c);
}


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
