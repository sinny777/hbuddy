
/**
 * Make sure app is provided while instantiating this class and calling any method
 */
module.exports = function(app) {

	var notificationHandler = require('../../server/handlers/notificationHandler')(app);
	var Device;
	var Board;
	var PlaceArea;

	// var bluemix = require('../../common/config/bluemix');
	// var dbCredentials = bluemix.getServiceCreds('cloudantNoSQLDB');
	const CLOUDANT_CONFIG = JSON.parse(process.env.VCAP_SERVICES)["cloudantNoSQLDB"][0]
	var cloudant = require('cloudant')(CLOUDANT_CONFIG.credentials.url);

var methods = {};

	methods.handleGoogleAction = function(payload, cb){
		console.log('IN deviceHandler.handleGoogleAction with payload: >>>> ', payload);
		try {
			var jsonPayload = JSON.parse(payload);
      if (!jsonPayload.inputs) {
        return cb(new Error("Missing Inputs"), null);
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
            console.log('post /Devices/action SYNC');
            sync({
              uid: "169b7e62acfa358058afe1406232d465",
              auth: authToken,
              requestId: reqdata.requestId,
            }, res);
            break;
          case 'action.devices.QUERY':
            console.log('post /Devices/action QUERY');
            console.log(reqdata.inputs[0].payload.devices);
            query({
              uid: "169b7e62acfa358058afe1406232d465",
              auth: authToken,
              requestId: reqdata.requestId,
            }, res);
            break;
          case 'action.devices.EXECUTE':
            console.log('post /Devices/action EXECUTE');
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

		} catch (err) {
			return cb(new Error("Invalid Payload"), null);
		}
	};

	methods.findDevice = function(deviceId, cb){
		try{
			if(deviceId){
					var findReq =  {"where": {"deviceId": deviceId}};
					console.log('IN deviceHandler, findDevice with deviceId: ', deviceId, ', findReq: ', findReq);
					Device = app.models.Device;
					Device.find(findReq, function(err, resp) {
						cb(err, resp);
					});
			}else{
				cb("deviceId can not be null", null);
			}
		}catch(err){
			console.log(err);
			cb("Some Error in findDevice: " +err, null);
		}
	};

	  return methods;

}
