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

	MyUser.authenticate = function(ctx, options, next) {
		var req = ctx.req;
		var res = ctx.res;
		const accessToken = options && options.accessToken;
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
					if(req.headers.referer){
						res.redirect(req.headers.referer);
					}else{
						res.redirect("http://www.hukamtechnologies.com");
					}


			});
	};

	MyUser.failedAuthentication = function(ctx, next){
		console.log("IN failedAuthentication: >>> ", ctx.accessToken);
		ctx.res.redirect('/');
	}

	MyUser.observe('access', function logQuery(ctx, next) {
	  console.log('Accessing %s matching %s', ctx.Model.modelName, JSON.stringify(ctx.query.where));
		next();
	});

	MyUser.observe('before save', function updateTimestamp(ctx, next) {
		console.log('\n\nInside MyUser.js before save: ', ctx.instance);
		  if (ctx.instance) {

				if(ctx.instance.username.includes("google")){
					var userId = ctx.instance.username.substring(7, ctx.instance.username.length);
					ctx.Model.app.models.UserIdentity.find({}, function (err, identity) {
						console.log("UserIdentity: >>> ", identity);
					});
				}

				if(ctx.instance.profile && ctx.instance.profile.id){
					var userId = ctx.instance.profile.id;
					console.log("USER_ID: >> ", userId);
					ctx.Model.app.models.UserIdentity.find({}, function (err, identity) {
						console.log("UserIdentity: >>> ", identity);
					});
				}

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
		          req.session.user = accessToken.user;
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
	    return next();
	  });

	function setCookies(req, res, accessToken){
		console.log("IN setCookies: >> ", accessToken);
		const expTime = accessToken.ttl * 1000 + Date.now();
    res.cookie('userId', accessToken.userId.toString(), {
			// signed: req.signedCookies ? true : false,
			domain: '.hukamtechnologies.com',
			maxAge: 1000 * accessToken.ttl,
			httpOnly: true
		});
		res.cookie('access_token', accessToken.id, {
			// signed: req.signedCookies ? true : false,
			domain: '.hukamtechnologies.com',
			maxAge: 1000 * accessToken.ttl,
			httpOnly: true
		});
		res.cookie('expires_at', JSON.stringify(expTime), {
			// signed: req.signedCookies ? true : false,
			domain: '.hukamtechnologies.com',
			maxAge: 1000 * accessToken.ttl,
			httpOnly: true
		});
	}

};
