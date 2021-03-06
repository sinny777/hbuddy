'use strict';

var loopback = require('loopback');
var LoopBackContext = require('loopback-context');

module.exports = function(MyUser) {

	MyUser.remoteMethod(
		    'authenticate',
		    {
		    	accepts: [
		            { arg: 'ctx', type: 'object', http: function(ctx) {
		              				return ctx;
		            				}
		          	},
								{"arg": "options", "type": "object", "http": "optionsFromRequest"}
							],
		         http: {path: '/authenticate', verb: 'get'}
		    }

	);

	MyUser.remoteMethod(
		    'authenticated',
		    {
		    	accepts: [
		            { arg: 'ctx', type: 'object', http: function(ctx) {
		              				return ctx;
		            				}
		          	},
								{"arg": "options", "type": "object", "http": "optionsFromRequest"}
							],
		         http: {path: '/authenticated', verb: 'get'}
		    }

	);

	MyUser.remoteMethod(
		    'failedAuthentication',
		    {
		    	accepts: [
		            { arg: 'req', type: 'object', http: function(ctx) {
		              return ctx;
		            }
		          }],
		         http: {path: '/authentication/failed', verb: 'get'},
		         returns: null
		    }

	);

	MyUser.remoteMethod(
		    'basic',
		    {
		    	accepts: [
		            { arg: 'ctx', type: 'object', http: function(ctx) {
		              				return ctx;
		            				}
		          	}
							],
		         http: {path: '/basic', verb: 'get'},
						 returns: {type: 'object', root: true}
		    }

	);

	MyUser.authenticate = function(ctx, options, next) {
		var req = ctx.req;
		var res = ctx.res;
		// const accessToken = options && options.accessToken;
		console.log('IN MyUser.authenticate, req.url: >>> ', req.url);
		console.log('IN MyUser.authenticate, req.query: >>> ', req.query);
		console.log("IN MyUser.authenticate, req.headers.referer: >> ", req.headers.referer);
		res.redirect('/auth/'+req.query.provider);
	}

	MyUser.authenticated = function(ctx, options, next) {
		var req = ctx.req;
		var res = ctx.res;
		const accessToken = options && options.accessToken;
		console.log("IN MyUser.authenticated, req.headers.referer: >> ", req.headers.referer);
		console.log('IN MyUser.authenticated, req.accessToken: >>> ', accessToken);
		  if (!accessToken) {
				return next();
			}

			req.app.models.MyUser.findById(accessToken.userId, function (err, user) {
				// console.log("MyUser Obj: >>> ", user);
					if (err) {
							console.log(err);
							return next();
					}
					if (!user) {
							//user not found for accessToken, which is odd.
							next();
					}
					req.session.user = user;
					setCookies(req, res, accessToken);

					if(!process.env.NODE_ENV || process.env.NODE_ENV != "production"){
						res.redirect("http://localhost:4200");
					}else{
						res.redirect("http://www.hukamtechnologies.com");
					}
			});
	};

	MyUser.failedAuthentication = function(ctx, next){
		console.log("IN failedAuthentication: >>> ", ctx.accessToken);
		if(!process.env.NODE_ENV || process.env.NODE_ENV != "production"){
			ctx.res.redirect('http://localhost:4200');
		}else{
			ctx.res.redirect('http://www.hukamtechnologies.com');
		}

	}

	MyUser.basic = function(ctx, next){
		console.log("<<<<<<<<<<< IN basic LOGIN >>>>>>>>>>>>>");
		var res = ctx.res;
		var req = ctx.req;

		var auth = req.headers['authorization'];
		console.log("auth: >>> ", auth);
		if(!auth) {
          res.statusCode = 401;
          res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
          res.end('<html><body>Need some creds son</body></html>');
    }else if(auth) {
					var tmp = auth.split(' ');   // Split on a space, the original auth looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part
					var buf = new Buffer(tmp[1], 'base64'); // create a buffer and tell it the data coming in is base64
					var plain_auth = buf.toString();        // read it back out as a string
					var creds = plain_auth.split(':');      // split on a ':'
					var username = creds[0];
					var password = creds[1];

					let credentials = {"username": username, "password": password};

					MyUser.login(credentials, function(err, accessToken) {
            if (err) {
              return next(err, null);
            }
            	console.info(accessToken);
							res.setHeader("API-OAUTH-METADATA-FOR-PAYLOAD", accessToken);
							res.setHeader("API-OAUTH-METADATA-FOR-ACCESSTOKEN", accessToken.id);
							// res.setHeader("API-Authenticated-Credential", accessToken.userId);

							req.app.models.MyUser.findById(accessToken.userId, function (err, user) {
								// console.log("MyUser Obj: >>> ", user);
									if (err) {
											console.log(err);
											return next(err, null);
									}
									if (!user) {
											//user not found for accessToken, which is odd.
											next();
									}
									req.session.user = user;
									setCookies(req, res, accessToken);
									return next(null, accessToken);
							});

          });

		}

	};

	MyUser.observe('access', function logQuery(ctx, next) {
	  console.log('Accessing %s matching %s', ctx.Model.modelName, JSON.stringify(ctx.query.where));
		console.log(ctx.accessToken);
		next();
	});

	MyUser.observe('before save', function updateTimestamp(ctx, next) {
		// console.log('\n\nInside MyUser.js before save: ', ctx.instance);
		  if (ctx.instance) {

			  if(!ctx.instance.audit){
				  ctx.instance.audit = {};
			  }
			  if(!ctx.instance.id){
				  ctx.instance.audit.created = new Date();
			  }
		    ctx.instance.audit.modified = new Date();
		  } else {
			  if(!ctx.data.audit){
				  ctx.data.audit = {};
			  }
			  ctx.data.audit.modified = new Date();

		  }
		 return next();
		});

	MyUser.afterRemote('login', function setLoginCookie(context, accessToken, next) {
	    console.log('\n\nIN MyUser.js, afterRemote login method, accessToken >>>>>>>', accessToken);
	    var res = context.res;
	    var req = context.req;
	    try{
	    	if (accessToken != null) {
		        if (accessToken.id != null) {
		          // req.session.user = accessToken.user;
							setCookies(req, res, accessToken);
							// return res.redirect('/');
		        }
		      }

	    }catch(err){
	    	console.log("ERROR IN afterRemote.login: >>> ", err);
	    }

	   return next();
	  });

	MyUser.afterRemote('logout', function(context, result, next) {
	    var res = context.res;
	    res.clearCookie('access_token');
	    res.clearCookie('userId');
			res.clearCookie('expires_at');
			console.log("After Logout Called: >> ");
	    return next();
	  });

	function setCookies(req, res, accessToken){
		var domain;
		console.log("IN setCookies: >> accessToken: ", accessToken);

		if(req.headers.referer){
			var referer = req.headers.referer;
			if(referer.indexOf("localhost") != -1){
					domain = ".localhost";
					console.log("Localhost running !!!!! ", referer);
			}else{
					domain = referer.substring(referer.indexOf("."), referer.lastIndexOf(".")+4);
			}
		}

		if(!domain && req.headers.host){
			var host = req.headers.host;
			domain = host.substring(host.indexOf("."), host.lastIndexOf(".")+4);
		}
		console.log("IN setCookies: >> domain: ", domain);
		const expTime = accessToken.ttl * 1000 + Date.now();
		if(accessToken.userId){
			res.cookie('access_token', accessToken.id, {
				signed: req.signedCookies ? true : false,
				domain: domain,
				maxAge: 1000 * accessToken.ttl,
				httpOnly: false
			});
			res.cookie('expires_at', JSON.stringify(expTime), {
				signed: req.signedCookies ? true : false,
				domain: domain,
				maxAge: 1000 * accessToken.ttl,
				httpOnly: false
			});
			res.cookie('userId', accessToken.userId.toString(), {
				signed: req.signedCookies ? true : false,
				domain: domain,
				maxAge: 1000 * accessToken.ttl,
				httpOnly: false
			});
		}
	}

};
