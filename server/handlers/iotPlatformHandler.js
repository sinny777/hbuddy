
var crypto = require('crypto');

module.exports = function() {

	var request = require('request'),

var methods = {};

	const IOT_CONFIG = JSON.parse(process.env.VCAP_SERVICES)["iotf-service"][0];
	IOT_DEVICE_REGISTER_BASE_URI = "https://"+IOT_CONFIG.credentials.http_host + "/api/v0002/device/types/";

	methods.registerDevice = function(deviceObj, callback) {
		console.log("IN iotPlatformHAndler.registerDevice: >>>> ", deviceObj);
		try{

				API_URL = IOT_DEVICE_REGISTER_BASE_URI+ deviceObj.typeId + "/devices";

				var device = {"deviceId": deviceObj.deviceId, "deviceInfo": deviceObj.deviceInfo};

				var options = {
						  url: API_URL,
						  method: "POST",
						  headers: {
						    "Content-Type": "application/json",
						    "Accept": "application/json"
						  },
						  "auth":{
							  "user": IOT_CONFIG.credentials.apiKey,
							  "pass": IOT_CONFIG.credentials.apiToken
						  },
						  "json": true,
						  "body": device
						};
				console.log("IN iotPlatformHAndler.registerDevice: >>> Request options: >> ", options);

				request(options, function(error, response, body){
					if(callback){
						callback(error, response, body);
					}
				});

		}catch(err){
			if(callback){
				callback(err, null, null);
			}
		}

	};

	methods.updateDevice = function(deviceObj, callback){
		console.log("IN iotPlatformHAndler.updateDevice: >>> ", deviceObj);
		API_URL = IOT_DEVICE_REGISTER_BASE_URI+ deviceObj.typeId + "/devices";

		if(deviceObj.deviceId){
			API_URL += deviceObj.deviceId;
		}else{
			callback(new Error("Invalid Request, deviceId not found to update Device "), null, null);
			return;
		}

		var updateObj = {
				"deviceUpdate": {
					"deviceInfo": deviceObj.deviceInfo,
					"metadata": deviceObj.metadata,
					"status": deviceObj.status
				}
			}

		var options = {
				  url: API_URL,
				  method: "PUT",
				  headers: {
				    "Content-Type": "application/json",
				    "Accept": "application/json"
				  },
				  "auth":{
						"user": IOT_CONFIG.credentials.apiKey,
						"pass": IOT_CONFIG.credentials.apiToken
				  },
				  "json": true,
				  "body": updateObj
				};

		request(options, function(error, response, body){
			if(callback){
				callback(error, response, body);
			}
		});
	};

    return methods;

}
