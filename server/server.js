require('cls-hooked');
var loopback = require('loopback');
var LoopBackContext = require('loopback-context');
var boot = require('loopback-boot');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var path = require('path');
const fs = require('fs');

require('dotenv').config({path: process.env.PWD+"/.env"});

process.env.VCAP_SERVICES = process.env.VCAP_SERVICES || fs.readFileSync('./credentials.json', 'utf-8');

var app = module.exports = loopback();

console.log("\n\n<<<<<<< RUNNING ON ", process.env.NODE_ENV, " ENVIRONMENT >>>>>>>>>> \n\n")

//Passport configurators..
var loopbackPassport = require('loopback-component-passport');
var PassportConfigurator = loopbackPassport.PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);

// app.use(loopback.static(path.resolve(__dirname, '../client/dist')));
// app.use('/api', loopback.rest());

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
/*
app.middleware('parse', bodyParser.json({limit: 1024*1024*50, type:'application/json'}));
app.middleware('parse', bodyParser.urlencoded({
	limit: 1024*1024*50,
	extended: true,
	parameterLimit:50000,
	type:'application/x-www-form-urlencoding'
}));
*/


app.use((req, res, next) => {
	  var token = req.accessToken;
		console.log("req.URL: >>> ", req.url);
		console.log("token : >>> ", token);
		if(token == null && req.url == '/api/Devices/action'){
			var miscinfo = req.body.miscinfo;
			console.log("miscinfo 2: >>> ", miscinfo);
			console.log("req.body.existingToken: >>> ", req.body.existingToken);
			console.log("req.body.existingPayload: >>> ", req.body.existingPayload);
			console.log("req.body.accessToken: >>> ", req.body.accessToken);
			console.log("req.body.authorization: >>> ", req.body.authorization);
			console.log(req.cookies);
		}

		if(token == null){
			return next();
		}

		console.log("TOKEN >>> ", req.accessToken);
	  const now = new Date();
	  if (now.getTime() - token.created.getTime() < 1000) {
	    return next();
	  }
	  req.accessToken.created = now; // eslint-disable-line
	  return req.accessToken.save(next);
});


var flash = require('express-flash');

bootOptions = { "appRootDir": __dirname};

boot(app, bootOptions, function(err) {
	if (err) throw err;

	//start the server if `$ node server.js`
  if (require.main === module){
		try{
      console.log("\n\n<<<<<<<< IN SERVER BOOT >>>>>>> ");
			app.io = require('socket.io')(app.start());
      app.io.on('connection', function(socket){
        console.log('a user connected');
        socket.on('CHAT', function(msg){
          console.log('message: ' + msg);
          // app.io.emit('CHAT', msg);
        });
        socket.on('disconnect', function(){
            console.log('\n\n<<<<<<<< USER DISCONNECTED >>>>>> \n\n');
        });
      });
		}catch(err){
			console.log(err);
		}
	}
});

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

//attempt to build the providers/passport config
var config = {};
try {
  config = require('../server/providers.js');
  // console.log("\n\n<<<<<<<<: PASSPORT CONFIG INITIALIZED :>>>>> \n\n");
} catch (err) {
  console.log(err);
  console.error('Please configure your passport strategy in `providers.json`.');
  console.error('Copy `providers.json.template` to `providers.json` and replace the clientID/clientSecret values with your own.');
  process.exit(1); // fatal
}

passportConfigurator.init(false);

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
	  userIdentityModel: app.models.MyUserIdentity,
	  userCredentialModel: app.models.UserCredential,
		applicationCredential: app.models.ApplicationCredential
	});

function customProfileToUser(provider, profile, options) {
  // console.log("IN customProfileToUser: >>> ", profile);
	var userObj = profile["_json"];
	delete userObj["_raw"];

  var userInfo = {
    provider: provider,
    providerId: profile.id,
    username: provider+"."+profile.id,
    password: 'secret',
    email: profile.id+"@loopback."+provider+".com",
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
