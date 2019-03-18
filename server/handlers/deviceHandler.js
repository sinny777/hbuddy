
/**
 * Make sure app is provided while instantiating this class and calling any method
 */
module.exports = function(app) {

	var Group = app.models.Group;
	var Place = app.models.Place;
	var PlaceArea = app.models.PlaceArea;
	var Board = app.models.Board;
	var Device = app.models.Device;

	var notificationHandler = require('../../server/handlers/notificationHandler')(app);
	// var bluemix = require('../../common/config/bluemix');
	// var dbCredentials = bluemix.getServiceCreds('cloudantNoSQLDB');
	const CLOUDANT_CONFIG = JSON.parse(process.env.VCAP_SERVICES)["cloudantNoSQLDB"][0]
	var cloudant = require('cloudant')(CLOUDANT_CONFIG.credentials.url);

var methods = {};

	methods.handleDeviceEvent = function(deviceType, deviceId, eventType,
			format, payload){
		console.log('\n\nIN deviceHandler.handleDeviceEvent with payload: >>>> ', payload);
		try {
			var jsonPayload = JSON.parse(payload);
			methods.handleDevicePayload(jsonPayload);
		} catch (err) {
			// TODO: Handle Invalid Payload
			console.log("INVALID PATLOAD: >>> ", err);
		}
	};

	methods.deviceChangeTrigger = function(payload){
		console.log("IN deviceHandler.deviceChangeTrigger: >>> ", payload);
		var msg = {};
		if(payload && payload.message){
			try{
				msg = JSON.parse(payload.message);
				methods.handleDevicePayload(msg);
			}catch(err){
				console.log('ERROR in Parsing Payload Message: >> ', err );
				msg = payload.message;
			}
		}
	};

	methods.sensorDataTrigger = function(payload){
		console.log("IN deviceHandler.sensorDataTrigger: >>> ", payload);
		var msg = {};
		if(payload && payload.message){
			try{
				msg = JSON.parse(payload.message);
				methods.handleDevicePayload(msg);
			}catch(err){
				console.log('ERROR in Parsing Payload Message: >> ', err );
				msg = payload.message;
			}
		}
	};

	methods.handleDevicePayload = function(payload){
		console.log('IN deviceHandler.handleDevicePayload with payload: >>>> ', payload);
		if(payload.d.boardId){
				methods.findDevice(payload.d.boardId, payload.d.deviceIndex, function(err, devices) {
					if(err){
						console.log("ERROR IN finding Board with uniqueIdentifier: ", payload.d.boardId, err);
					}else{
						if(devices && devices.length > 0){
							var device = devices[0];
							console.log("RESP FROM FIND DEVICE: >>> ", device.title);
							if(device.deviceIndex == payload.d.deviceIndex){
					    	device.deviceValue = payload.d.deviceValue;
					    	device.audit.modified = new Date();
								device.status = payload.d.status;
								Device.upsert(device, function(err, updatedDevice){
					    		if(err){
					    			console.log("ERROR IN UPDATING DEVICE: >> ", err);
					    		}else{
					    			console.log("<<<< DEVICE UPDATED SUCCESSFULLY >>>>>>> ", updatedDevice);
					    		}
					    	});
					    }
						}else{
							console.log("NO DEVICE FOUND FOR PAYLOAD: ", payload);
						}
					}
				});
		}
	};

	methods.findDevice = function(boardId, deviceIndex, cb){
		try{
			if(boardId && deviceIndex){
					var findReq =  {where: {"parentId": boardId, "deviceIndex": deviceIndex}};
					console.log('IN findDevice, with boardId: ', boardId, ", deviceIndex: ", deviceIndex, ', findReq: ', findReq);
					Device.find(findReq, function(err, resp) {
						cb(err, resp);
					});
			}else{
				cb("boardId or deviceIndex can not be null", null);
			}
		}catch(err){
			console.log(err);
			cb("Some Error in findDevice: " +err, null);
		}
	};

	methods.findDeviceById = function(id){
		return new Promise(function(resolve, reject){
			try{
				if(id){
						console.log('IN deviceHandler, findDeviceById with id: ', id);
						Device.findById(id, function(err, resp) {
							resolve(resp);
						});
				}else{
					return reject(new Error("id can not be null"));
				}
			}catch(err){
				return reject(err);
			}
		});
	};

	methods.findDevice = function(deviceId, cb){
		try{
			if(deviceId){
					var findReq =  {"where": {"deviceId": deviceId}};
					console.log('IN deviceHandler, findDevice with deviceId: ', deviceId, ', findReq: ', findReq);
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

	methods.findBoard = function(boardId, gatewayId, cb){
		try{
			if(boardId){
				if(gatewayId){
					var findReq =  {where: {"uniqueIdentifier": boardId, "gatewayId": gatewayId}};
					console.log('IN findBoard, with boardId: ', boardId, ", gatewayId: ", gatewayId, ', findReq: ', findReq);
					Board.find(findReq, function(err, resp) {
						cb(err, resp);
					});
				}else{
					var findReq =  {where: {"uniqueIdentifier": boardId}};
					console.log('IN findBoard, with boardId: ', boardId, ', findReq: ', findReq);
					Board.find(findReq, function(err, resp) {
						cb(err, resp);
					});
				}
			}else{
				cb("boardId can not be null", null);
			}
		}catch(err){
			console.log(err);
			cb("Some Error in findBoard: " +err, null);
		}
	};

	methods.findDevicesForUser = function(userId){
			console.log('IN findDevicesForUser with userId: ', userId);
			return new Promise(function(resolve, reject){
					return methods.findPlacesForUser(userId).then((places) => {
						var placeIds = [];
						for (var index in places) {
							var place = places[index];
							placeIds.push(place.id);
						}
						var findReq =  {"where": {"customData.placeId": {inq: placeIds}}};
						console.log('IN deviceHandler, findDevicesForUser with findReq: ', JSON.stringify(findReq));
						Device.find(findReq, function(err, devices) {
							if(err){
								return reject(err);
							}
							return resolve(devices);
						});
					}).catch(function(error) {
						console.log("ERROR IN Fetching Groups: >> ", error);
						return reject(error.message || error);
					});
			});
	}

	methods.findPlacesForUser = function(userId){
		console.log('IN findPlacesForUser with userId: ', userId);
		return new Promise(function(resolve, reject){
				return methods.findGroupsForUser(userId).then((groups) => {
					var findReq = {filter: {where: {or: [{ownerId: userId}]}}};
	        var placeIds = [];
					for (var index in groups) {
						var group = groups[index];
						placeIds.push(group.placeId);
					}
					if(placeIds.length > 0){
						findReq.filter.where.or.push({id: {inq: placeIds}});
					}
					console.log("In findPlacesForUser, findReq:>>>  ", JSON.stringify(findReq));
					Place.find(findReq, function(err, resp) {
						if(err){
							return reject(err);
						}
						return resolve(resp);
					});
				}).catch(function(error) {
					console.log("ERROR IN Fetching Groups: >> ", error);
					return reject(error.message || error);
				});
		});
	};

	methods.findPlacesForGatewayId = function(gatewayId, cb){
		console.log('IN findPlaceAreasForGatewayId with gatewayId: ', gatewayId);
		var findReq =  {where: {"gatewayId": gatewayId}};
		Place.find(findReq, function(err, resp) {
			cb(err, resp);
		});
	};

	methods.findPlaceAreasForPlaceId = function(placeId, cb){
		console.log('IN findPlaceAreasForPlaceId with placeId: ', placeId);
		var findReq =  {where: {"placeId": placeId}};
		PlaceArea.find(findReq, function(err, resp) {
			cb(err, resp);
		});
	};

	methods.findPlaceArea = function(placeAreaId, cb){
		console.log('IN findPlaceArea with placeAreaId: ', placeAreaId);
		PlaceArea.findById(placeAreaId, function(err, resp) {
			cb(err, resp);
		});
	};

	methods.findGroupsForUser = function(userId, cb){
		console.log('IN findGroupsForUser with userId: ', userId);
    return new Promise(function(resolve, reject){
        const findReq = {
                          filter: {
                                    where: {"or": [{"members": {"elemMatch": {"userId": {"$eq": userId}}}},
                                        {"ownerId": userId}]}
                                   }
                        };
				console.log("IN findGroupsForUser, findReq: >> ", JSON.stringify(findReq))
    		Group.find(findReq, function(err, groups) {
          if(err){
            return reject(err);
          }
					return resolve(groups);
    		});
    });
	};

	methods.getLatestSensorData = function(params, cb){
		var startKey = [];
		startKey.push(params.gatewayId);
		startKey.push(params.uniqueId);
		startKey.push(params.type);
		startKey.push({});
		var reqParams = {
			descending: params.descending,
			startkey: startKey,
			limit: params.limit
		  };
		console.log("reqParams: >>> ", reqParams);
		var db = cloudant.use(methods.getLatestSensorDataBucket());
		db.view('iotp', 'sensordata-view', reqParams, function(err, resp) {
			  if (!err) {
				var result = [];
			    if(resp.rows && resp.rows.length > 0){
			    	for(var index in resp.rows) {
						  var viewData = resp.rows[index];
						  if(viewData.value && viewData.value.length > 0){
							  var sensorData = {};
							  sensorData = viewData.value[0].data.d;
							  result.push(sensorData);
						  }
			    	}
			    	cb(null, result);
			    }else{
			    	cb(null, result);
			    }
			  }else{
				  console.log('ERROR IN CALLING getLatestSensorData: ', err);
				  cb(err, null);
			  }
		});

	};

	methods.getLatestSensorDataBucket = function(){
		var today = new Date();

		var year = today.getFullYear();
		var month = today.getMonth() + 1;
		if(month < 10){
			month = "0"+month;
		}

		var deviceDataBucket = "iotp_o6oosq_devicelogs_"+year+"-"+month;
		return deviceDataBucket;
	};


    return methods;

}
