'use strict';

var log = require('debug')('boot:01-startup-script');

var Client = require('ibmiotf');
var chrono = require('chrono-node');
var request = require('request');
var CONFIG = require('../../common/config/config').get();

var appClient = {};

module.exports = function(app) {
	console.log("INSIDEboot:01-startup-script >>>>>>>> ");

	console.log("environment: >> ", process.env.NODE_ENV);

	// if (app.dataSources.db.name !== 'Memory' && !process.env.INITDB) {
	// 	return;
	// }

	var appConfig = require('../../common/config/config').get();
	// var deviceHandler = require('../../server/handlers/deviceHandler')(app);
	var commonHandler = require('../../server/handlers/commonHandler')();

//	initStartupLogic();

//	saveAndExecuteScenes();

	 // testPushNotification();
	 // testFCMNotification();

//	testNLCDateParser();

//	testConversation();
//	testDeviceUpdate();


	function testConversation(){
		var Conversation = app.models.Conversation;
		var conversationReq = {"body":{
										"params": {"input": "Switch on the living room light"},
										"context": {}
									}
							  };

	  console.log("IN doConversation: >> ", JSON.stringify(conversationReq));
	  Conversation.doconversation(conversationReq,
					  function(err, resp) {
		  				if(err){
		  					console.log("ERROR IN doconversation: ", JSON.stringify(err));
		  				}
						console.log("CONVERSATION RESP: >> ", JSON.stringify(resp));
						if(resp && resp.conversationResp && resp.conversationResp.output){

						}
					  });
	};

	function testNLCDateParser(){
		printResults(chrono.parse('Please do the installation next Friday at 3pm'));
	};

	function printResults(results){
		console.log("\n\nRESULT: >>> ", results, "\n\n");
		if(results && results.length > 0){
			console.log("index: >>> ", results[0].index);
			console.log("results[0].text: >>> ", results[0].text);
			console.log("results[0].ref: >>> ", results[0].ref);
			if(results[0].start){
				console.log("StartDate: >>> ", results[0].start.date());
			}
			if(results[0].end){
				console.log("End Date: >>> ", results[0].end.date());
			}
		}
		console.log("\n\n------------------\n\n");
	}

	function saveAndExecuteScenes(){
		console.log("IN saveAndExecuteScenes: >>> ");
		var Scene = app.models.Scene;

		var waterTankScene = {
				title: "WaterTank",
				description: "Switch on motor for filling Water tank",
				placeId: "7760aef8d92a4dbd63939b5bd4cd0cfa",
				repeat: true,
				type: "TIME",
				settings: {
					startTime: "06:05:00",
					endTime: "07:05:00",
					"Monday": true,
					"Tuesday": false,
					"Wednesday": true,
					"Thursday": false,
					"Friday": true,
					"Saturday": true,
					"Sunday": true,
				},
				devices: [
				          {boardId: "SB-B1379", deviceIndex: 4, deviceValue: 1}
				          ]
		};

		Scene.findOrCreate(
	              {where: {title: waterTankScene.title}},
	              waterTankScene, // create
	              function(err, createdScene, created) {
	                if (err) {
	                  console.error('error creating waterTankScene', err);
	                }
	                (created) ? console.log('CREATED SCENE ::>> ', createdScene)
	                          : console.log('FOUND SCENE ::>> ', createdScene.title);
	                scheduleScene(createdScene);
	              });
	};

	function scheduleScene(scene){
		if(!scene.id){
			return false;
		}
		if(scene.type == "TIME"){
			console.log("Scene is of TIME Type and settings are: ", scene.settings);
			var secDiff = commonHandler.timeDifferenceFromStr(scene.settings.startTime);
			if(secDiff > 0){
				console.log("<<<<< Schedule Scene after >>>>>>> ", secDiff, " seconds or ", secDiff/60, " minutes");
				setTimeout(function() {
					console.log(" EXECUTING SCENE AT: ", new Date(), ", SCENE: ", scene.title);
				}, (secDiff * 1000));
			}else{
				console.log("Dont Schedule >>>>> ", secDiff/60, " minutes already passed");
			}
		}
	};

	function initStartupLogic() {

		var iotConfig = appConfig.CLOUD_CONFIG;
		var clientId = parseInt(Math.random() * 100, 10);
		iotConfig.id = iotConfig.id + clientId;
		appClient = new Client.IotfApplication(iotConfig);
		appClient.connect();
		appClient
				.on(
						"connect",
						function() {
							console
									.log('<<<<<<< IBM IoT Cloud Connected Successfully >>>>>> \n\n');
							subscribeToGateway();

							publishWaterTankData();

						});

		appClient.on("deviceEvent", function(deviceType, deviceId, eventType,
				format, payload) {
			console.log("Device Event from :: " + deviceType + " : " + deviceId
					+ " of event " + eventType + " with payload : " + payload);
			var payloadStr =  payload.toString('utf8');
			handleDeviceEvent(deviceType, deviceId, eventType,
					format, payloadStr);
		});
	};

	function subscribeToGateway() {
		appClient.subscribeToDeviceEvents("HukamGateway", "+", "+", "json");
	};

	function publishWaterTankData(){
		setInterval(function(){
			var timeNow = new Date();
			var deviceWithData = {data: {type: "watertank", uniqueId: "WT-ABC123", gatewayId: appConfig.gatewayId, ts: timeNow, distance: "150"}};
			var sensorData = {"d": deviceWithData.data};
			appClient.publishDeviceEvent("HukamGateway", appConfig.gatewayId, "cloud", "json", sensorData);
			console.log("Published simulated Watertank data: >>> ", sensorData);
		}, 120000);
	};

	function handleDeviceEvent(deviceType, deviceId, eventType,
			format, payload) {
		deviceHandler.handleDeviceEvent(deviceType, deviceId, eventType,
				format, payload);
	};

	function testFCMNotification(){
		var notificationHandler = require('../../server/handlers/notificationHandler')(app);
		// var registrationToken = "drdNN6TiDEs:APA91bHZvXNu3cDCV2lsuu89R97wAj1TnM7ZjSO92RVppiDJH8XS26N2f8j5Dk4u_vtkboUV38b6VE5f7dQN5VrxWoxHRPQgsfcn8D5uGnVd8APphlC0KhagZm39kEg4ms9Ud4Ux9HUlUYEvLTJbY1vsxYR3R_Tx9A";
			var message = {
					notification: {
						title: "Hukam Notification",
						body: "Your room AC is just switched on !"
					},
					data: {
						deviceIndex: "5",
						deviceValue: "1"
					},
					android: {
						ttl: 3600 * 1000, // 1 hour in milliseconds
						priority: 'high',
						notification: {
							icon: 'stock_ticker_update',
							color: '#f45342'
						}
					},
					apns: {
								headers: {
									'apns-priority': '10'
								},
								payload: {
									aps: {
										badge: 0,
										sound: "default"
									}
								}
							},
					topic: "000000008c0be72b"
			};

			console.log(message)
			notificationHandler.sendFCMNotification(message, function(err, response){
				if(err){
					console.log('Error sending message:', err);
				}else{
					console.log('Successfully sent message:', response);
				}
			});

	};

	function testDeviceUpdate(){
		console.log("IN testDeviceUpdate: >>> ");
		var Device = app.models.Device;

		var device = {
			    "audit": {
			        "created": "2017-08-04T11:23:17.215Z",
			        "modified": "2017-08-04T11:42:32.268Z"
			    },
			    "analog": false,
			    "config": null,
			    "description": "Digital Switch 2",
			    "deviceId": "A010-E365-F155",
			    "deviceIndex": 2,
			    "deviceValue": 1,
			    "deviceValueUnits": null,
			    "parentId": "AE2C100952FBC1FB",
			    "status": "OFF",
			    "title": "LED",
			    "type": "device",
			    "id": "1cee9f1f2fbc332c7199d1e0bb91651d"
			};

		Device.upsert(device, function(err, updatedDevice){
    		if(err){
    			console.log("ERROR IN UPDATING DEVICE: >> ", err);
    		}else{
    			console.log("<<<< BOARD DEVICE UPDATED SUCCESSFULLY >>>>>>> ", updatedDevice);
    		}
    	});
	};

};
