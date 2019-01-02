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
		         returns: {arg: 'data', type: 'object'},
						 "accessScopes": ["/api"]
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
				  device.status = "OFF";
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
		var res = ctx.res;
		var req = ctx.req;
		console.log('Device.action, HEADERS: ', req.headers);
    let reqdata = req.body;
    console.log('Device.action, PAYLOAD: ', reqdata);

    let authHeader = req.headers["authorization"];
    var authToken = authHeader.split(' ')[1];
    console.log("authToken: >> ", authToken);
    // let uid = datastore.Auth.tokens[authToken].uid;

    if (!reqdata.inputs) {
      res.status(401).set({
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }).json({error: 'missing inputs'});
    }
    for (let i = 0; i < reqdata.inputs.length; i++) {
      let input = reqdata.inputs[i];
      let intent = input.intent;
      if (!intent) {
        res.status(401).set({
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
          }, res);
          break;
        case 'action.devices.QUERY':
          console.log('post /smarthome QUERY');
          console.log(reqdata.inputs[0].payload.devices);
          query({
            uid: "169b7e62acfa358058afe1406232d465",
            auth: authToken,
            requestId: reqdata.requestId,
          }, res);
          break;
        case 'action.devices.EXECUTE':
          console.log('post /smarthome EXECUTE');
          console.log(reqdata.inputs[0].payload.commands);
          executeCommand({
            uid: "169b7e62acfa358058afe1406232d465",
            auth: authToken,
            requestId: reqdata.requestId,
          }, res);
          break;
        default:
          response.status(401).set({
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }).json({error: 'missing intent'});
          break;
      }
    }

	};

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
