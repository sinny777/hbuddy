var loopback = require('loopback');
var LoopBackContext = require('loopback-context');

module.exports = function(Place, Member) {
	
	Place.remoteMethod(
		    'sensorData',
		    {
		    	accepts: [
		            { arg: 'req', type: 'object', http: function(ctx) {
		              return ctx.req;
		            } 
		          }],	
		         http: {path: '/sensordata', verb: 'post'},
		         returns: {arg: 'sensordata', type: 'object'}
		    }
	);
  
   Place.sensorData = function(req, cb){
		var deviceHandler = require('../../server/handlers/deviceHandler')(Place.app);
		deviceHandler.getLatestSensorData(req.body, function(err, resp){
			cb(err, resp);
		});
	};
	
	Place.observe('before save', function updateTimestamp(ctx, next) {
		console.log('\n\nInside Place.js before save: ');
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
	
	// remote method before hook
	  Place.beforeRemote('find', function(context, unused, next) {
		  console.log('\n\nIN Place.js find method >>>>>> ');
	    var accessToken = context.req && context.req.accessToken;
		var userId = accessToken && accessToken.userId;
	    var ownerId = context.query && context.query.where && context.query.where.ownerId;
	    
		console.log('accessToken: >> ', accessToken);
	    
	    if(loopback){
	    	
	    	var loopbackContext = LoopBackContext.getCurrentContext();
	        var currentUser = loopbackContext && loopbackContext.get('currentUser');
	    	console.log('CurrentUser From LoopbackContext: ' , currentUser);
		    
		    if(!currentUser){
		    	currentUser = context.req.user;
		    }
	    	
	    	console.log("IN place.js current userId: ", userId, ", query: ", context.filter+", currentUser: ", currentUser);
	    	if(currentUser){
	    		findMembers(currentUser);
	    	}
	    }
    	
	   return next();
	  });
	  
	  findMembers = function(currentUser){
		  console.log('IN place.js, findMembers for memberId: ', currentUser.id);
		  var findReq = {filter: {where: {"username": "sinny777@gmail.com"}}};
	  }
	
};
