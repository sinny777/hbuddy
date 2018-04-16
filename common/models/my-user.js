'use strict';

module.exports = function(MyUser) {

	var loopback = require('loopback');

	MyUser.remoteMethod(
		    'authenticate',
		    {
		    	accepts: [
		            { arg: 'req', type: 'object', http: function(ctx) {
		              return ctx;
		            }
		          }],
		         http: {path: '/authenticate', verb: 'get'},
		         returns: {arg: 'user', type: MyUser}
		    }

	);

	MyUser.authenticate = function(ctx, next) {
		console.log('IN MyUser.authenticate, req.accessToken: >>> ', ctx.req.accessToken);
		MyUser.findById(ctx.req.accessToken.userId, function(err, userObj){
			if (err) {
		    	  console.log("\n\nERROR IN User.findById:>>>>>>>>>> ", err);
		    	  return next();
		      }
			MyUser.app.currentUser = userObj;
			ctx.res.locals.currentUser = userObj;
			// var loopbackContext = MyUser.app.loopback.getCurrentContext();
		  // if (loopbackContext) loopbackContext.set('currentUser', userObj);
		    console.log('USER OBJ set in LB context: >>>>>> ', userObj);
		   	ctx.res.redirect('/');
		    // return next();
		});
	};

	MyUser.observe('before save', function updateTimestamp(ctx, next) {
		console.log('\n\nInside MyUser.js before save: ');
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

	MyUser.afterRemote('login', function(context, accessToken, next) {
	    console.log('\n\nIN MyUser.js, afterRemote login method, accessToken >>>>>>>', accessToken);
	    var res = context.res;
	    var req = context.req;
	    try{
	    	if (accessToken != null) {
		        if (accessToken.id != null) {
		          res.cookie('access_token', accessToken.id, {
		            signed: req.signedCookies ? true : false,
		            maxAge: 1000 * accessToken.ttl
		          });
		          res.cookie('userId', accessToken.userId.toString(), {
		            signed: req.signedCookies ? true : false,
		            maxAge: 1000 * accessToken.ttl
		          });
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

};
