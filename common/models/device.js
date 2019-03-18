/**
 * [exports description]
 * @type {[type]}
 * Reference: https://developers.google.com/actions/reference/smarthome/rest/v1/devices/sync#DeviceInfo
 */

'use strict';

module.exports = function(Device) {

	Device.remoteMethod(
		    'action',
		    {
		    	accepts: [{ arg: 'ctx', type: 'object', http: function(ctx) {
															return ctx;
														}
										}],
		         http: {path: '/action', verb: 'post'},
		         returns: {type: 'object', root: true}
		    }
	);

	Device.observe('before save', function updateTimestamp(ctx, next) {
		  var device = {};
		  if (ctx.instance) {
			  device = ctx.instance;
			  if(!device.audit){
				  device.audit = {};
			  }
			  if(!device.id){
				  device.audit.created = new Date();
			  }
			  device.audit.modified = new Date();
		  } else {
			  device = ctx.data;
			  if(!device.audit){
				  device.audit = {};
			  }
			  device.audit.modified = new Date();
		  }

		  if(!device.deviceId){
			  //TODO: Board should always have a UniquiId set before it is sent for saving
			  device.deviceId = generateUUID();
		  }

		 return next();
	});


	Device.action = function(ctx, next){
		console.log("\n\n<<<<<<< IN Device.action, Google Action : >>>>>>>>>> ");
		// console.log(ctx);
		try {
				var res = ctx.res;
				var req = ctx.req;
				var googleHandler = require('../../server/handlers/googleHandler')(Device.app);
				googleHandler.handleAction(req, res).then((responseJson) => {
					console.log("IBM WATSON RESPONSE: >>> ", responseJson);
					next(null, responseJson);
				}).catch(function(error) {
						console.log("ERROR in Device Google Action: >> ", error);
						next(error, null);
				});
			}catch(err){
				console.log(err);
			}

	};

	function generateUUID() {
	    var d = new Date().getTime();
	    var uuid = 'yxxx-yxxx-yxxx'.replace(/[xy]/g,function(c) {
	        var r = (d + Math.random()*8)%8 | 0;
	        d = Math.floor(d/16);
	        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
	    });
	    return uuid.toUpperCase();
	};

	/*
	var iotPlatformHandler = require('../../server/handlers/iotPlatformHandler')();

	Device.observe('before save', function updateTimestamp(ctx, next) {
		console.log('\n\nInside Device.js before save: ', ctx.instance);
		  if (ctx.instance) {
			  if(!ctx.instance.clientId){
				  iotPlatformHandler.registerDevice(ctx.instance, function(error, response, body){
					  if(error){
						  console.log("ERROR: >> ", error);
						  next(error);
					  }else{
						  if(response.statusCode != 201){
							  console.log("ERROR RESPONSE Message: >> ", response.statusMessage);
							  console.log("ERROR RESPONSE Body: >> ", body);
							  var error = new Error();
							  error.status = response.statusMessagee;
							  if(body){
								  error.message = body.message;
							  }
							  error.code = response.statusCode;
							  next(error);
						  }else{
							  if(body){
								  ctx.instance.clientId = body.clientId;
								  ctx.instance.typeId = body.typeId;
								  ctx.instance.status = body.status;
								  ctx.instance.registration = body.registration;
								  ctx.instance.refs = body.refs;
							  }
							  console.log("REGISTER RESPONSE, CODE: >>> ", response.statusCode, ", BODY: ", ctx.instance );
							  next();
						  }
					  }
				  });
			  }else{
				  iotPlatformHandler.updateDevice(ctx.instance, function(error, response, body){
					  if(error){
						  console.log("ERROR: >> ", error);
						  next(error);
					  }else{

						  if(response.statusCode >= 400){
							  console.log("ERROR RESPONSE Message: >> ", response.statusMessage);
							  console.log("ERROR RESPONSE Body: >> ", body);
							  var error = new Error();
							  error.status = response.statusMessagee;
							  error.message = body.message;
							  error.code = response.statusCode;
							  next(error);
						  }else{
							  console.log("UPDATE RESPONSE, CODE: >>> ", response.statusCode, ", BODY: ", ctx.instance );
							  next();
						  }
					  }
				  });
			  }
		  } else {
			  console.log("Updating Partial Device Data, ctx.data: >> ", ctx.data);
			  if(!ctx.data.clientId){
				  // TODO: Register Device on IoT Platform
			  }else{
				  // TODO: Update Device on IoT Platform
			  }
		  }

		});
	*/

};
