
/**
 * Make sure app is provided while instantiating this class and calling any method
 */
module.exports = function(app) {

	var notificationHandler = require('../../server/handlers/notificationHandler')(app);
  var deviceHandler = require('../../server/handlers/deviceHandler')(app);
  var Group;
  var Place;
  var PlaceArea;
  var Board;
  var Device;
	// var bluemix = require('../../common/config/bluemix');
	// var dbCredentials = bluemix.getServiceCreds('cloudantNoSQLDB');
	const CLOUDANT_CONFIG = JSON.parse(process.env.VCAP_SERVICES)["cloudantNoSQLDB"][0]
	var cloudant = require('cloudant')(CLOUDANT_CONFIG.credentials.url);

var methods = {};

  methods.handleAction = function(req, res){
    return new Promise(function(resolve, reject){
      console.log('In handleAction, HEADERS: ', req.headers);
      try {
          let reqdata = req.body;
          console.log('Device.action, PAYLOAD: ', JSON.stringify(reqdata));
          let appUser = req.headers["ibm-app-user"];
          var accessToken = req.accessToken;
          console.log("accessToken: >> ", accessToken);
          if (!reqdata.inputs) {
            return reject(new Error('Missing Inputs for Google Action to perform'));
            /*
            res.status(401).set({
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }).json({error: 'missing inputs'});
            */
          }

            for (let i = 0; i < reqdata.inputs.length; i++) {
              let input = reqdata.inputs[i];
              let intent = input.intent;
              if (!intent) {
                return reject(new Error('Missing Intent for Google Action to perform'));
                continue;
              }
              switch (intent) {
                case 'action.devices.SYNC':
                  sync({
                    accessToken: accessToken,
                    requestId: reqdata.requestId,
                  }, res);
                  break;
                case 'action.devices.QUERY':
                  query({
                    accessToken: accessToken,
                    requestId: reqdata.requestId,
                    payload: input.payload
                  }, res);
                  break;
                case 'action.devices.EXECUTE':
                  executeCommand({
                    accessToken: accessToken,
                    requestId: reqdata.requestId,
                    payload: input.payload
                  }, res);
                  break;
                default:
                  return reject(new Error('Missing Intent for Google Action to perform'));
                  break;
              }
            }
          }catch(err){
      			return reject(err);
      		}
    });
  }

	function sync(payload, response){
    console.log("IN deviceHandler, SYNC method, accessToken >>> ", payload.accessToken);
    deviceHandler.findDevicesForUser(payload.accessToken.userId).then((devices) => {
			var devicesResp = [];
      for(var index in devices){
        var device = devices[index]["__data"];
         delete device["_rev"];
         device["_rev"] = undefined;
         delete device.audit;
         device["audit"] = undefined;
         delete device["deviceId"];
         device["deviceId"] = undefined;
         device = JSON.parse(JSON.stringify(device));
         devicesResp.push(device);
      }
      let deviceProps = {
        requestId: payload.requestId,
        payload: {
          agentUserId: payload.accessToken.userId,
          devices: devicesResp,
        },
      };
      // console.log('sync response: >>> ', JSON.stringify(deviceProps));
      response.status(200).json(deviceProps);
      return deviceProps;
		}).catch(function(error) {
				console.log("ERROR in findPlacesForUser: >> ", error);
        response.status(error.code).json(error);
		});
  }

  function query(data, response){
    console.log("IN deviceHandler, QUERY method: >>> ", JSON.stringify(data));
    var devicesResp = [];
    for(var index in data.payload.devices){
      device = data.payload.devices[index];
      deviceHandler.findDeviceById(device.id).then((device) => {
           deviceResp = {};
           if(device.customData.status == 0){
             deviceResp[device.id] = {
               "on": true,
               "online": false
             }
           }
           devicesResp.push(deviceResp);
  		}).catch(function(error) {
  				console.log("ERROR in findPlacesForUser: >> ", error);
          response.status(error.code).json(error);
  		});
    }

    let deviceProps = {
      requestId: data.requestId,
      payload: {
        agentUserId: data.accessToken.userId,
        devices: devicesResp,
      },
    };
    // console.log('sync response: >>> ', JSON.stringify(deviceProps));
    response.status(200).json(deviceProps);
    return deviceProps;
  }

  function executeCommand(data, response){
    console.log("IN deviceHandler, EXECUTE method: >>> ", JSON.stringify(data));
    var updateDevices = {};
    var respPayload = {
            "commands": []
          };
    for(var i in data.payload.commands){
      command = data.payload.commands[i];
      for(var j in command.execution){
        execution = command.execution[j];
        if(execution.command == "action.devices.commands.OnOff"){
          var onResp = {
            "ids": [],
            "status": "SUCCESS",
            "states": {
              "on": true,
              "online": false
            }
          };
          var offResp = {
            "ids": [],
            "status": "SUCCESS",
            "states": {
              "on": false,
              "online": false
            }
          };
          for(var k in command.devices){
            device = command.devices[k];
            var customData = device.customData;
            if(execution.params.on){
                customData.deviceValue = 1;
                customData.status = 1;
                deviceNewData = {id: device.id, customData: customData};
                if(updateDevices.hasOwnProperty(device.customData.boardId)){
                  updateDevices[device.customData.boardId].push(deviceNewData);
                }else{
                  updateDevices[device.customData.boardId] = [];
                  updateDevices[device.customData.boardId].push(deviceNewData);
                }
                onResp.ids.push(deviceNewData.id);
                respPayload.commands.push(onResp);
            }else{
              customData.deviceValue = 0;
              customData.status = 0;
              deviceNewData = {id: device.id, customData: customData};
              if(updateDevices.hasOwnProperty(device.customData.boardId)){
                updateDevices[device.customData.boardId].push(deviceNewData);
              }else{
                updateDevices[device.customData.boardId] = [];
                updateDevices[device.customData.boardId].push(deviceNewData);
              }
              offResp.ids.push(deviceNewData.id);
              respPayload.commands.push(offResp);
            }
         }
       }
     }
   }

    console.log("updateDevices: >> ", JSON.stringify(updateDevices));
    let deviceProps = {
      requestId: data.requestId,
      payload: respPayload
    };
    console.log('execute response: >>> ', JSON.stringify(deviceProps));
    response.status(200).json(deviceProps);
    return deviceProps;
  }


	  return methods;

}
