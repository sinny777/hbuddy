'use strict';

var log = require('debug')('boot:01-startup-script');

var Client = require('ibmiotf');
var chrono = require('chrono-node');
var request = require('request');

var appClient = {};

module.exports = function(app) {

	if (app.dataSources.db.name !== 'Memory' && !process.env.INITDB) {
		return;
	}

	var appConfig = require('../../common/config/config').get();
	var deviceHandler = require('../../server/handlers/deviceHandler')(app);
	var commonHandler = require('../../server/handlers/commonHandler')();

//	initStartupLogic();
	
//	saveAndExecuteScenes();
	
//	testPushNotification();
	
//	testNLCDateParser();
	
//	testConversation();
	
	function testConversation(){
		var Conversation = app.models.Conversation;
		var conversationReq = {"body":{
										"params": {"input": "Switch on the light"},
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
		appClient.subscribeToDeviceEvents("GransLiveGateway", "+", "+", "json");
	};
	
	function publishWaterTankData(){
		setInterval(function(){
			var timeNow = new Date();
			var deviceWithData = {data: {type: "watertank", uniqueId: "WT-ABC123", gatewayId: appConfig.gatewayId, ts: timeNow, distance: "150"}};
			var sensorData = {"d": deviceWithData.data};
			appClient.publishDeviceEvent("GransLiveGateway", appConfig.gatewayId, "cloud", "json", sensorData);
			console.log("Published simulated Watertank data: >>> ", sensorData);
		}, 120000);
	};

	function handleDeviceEvent(deviceType, deviceId, eventType,
			format, payload) {
		deviceHandler.handleDeviceEvent(deviceType, deviceId, eventType,
				format, payload);
	};
	
	function testPushNotification(){
		var FCM = require('fcm-push');
		var pushMsg = "Just for tesing Push Notification at " +new Date();
		var pushData = {
				boardId : "ABCXYZ",
				deviceIndex : 5,
				deviceValue : 1,
				style : "picture",
				picture : "http://wallpapercave.com/wp/3Ma6LaY.jpg"
			};
		var registrationIds = [];
		var deviceToken = "eqt7fel6Ga4:APA91bGGUO4Acaag6wA_UtsDbal8rKhJzzNrV5NmW0Fr7MZHuGUeYgbIzYCFMKJaP2JXzODxW8Fii8tu06JAGYb6FAkBpcdVti3VZWvS01F0nqpefDguCUb5Bd42JnLnRnZbTMP3z2kL";
		registrationIds.push(deviceToken);
		
		console.log('IN notificationHandler.sendPushNotification: >> ', pushMsg);
		var serverKey = "AAAAy66YFns:APA91bHa_RXSrxCHUYlrVW5fl89dxfLx02sjsby6OEhPPqgKi0fF66BFNNxHSUhyOmK8PQ_Oj2bfADAsMu_MPUyDpL08qmIPddsMMcRNmGVB-SdMPHZ_cothPtNyGNMY09pWVW32Zi77";
		var fcm = new FCM(serverKey);
		var message = {
			    to: deviceToken, // required fill with device token or topics
			    "content_available":true,
			    "priority": "high",
			    collapse_key: '', 
			    data: pushData,
			    notification: {
			        title: 'hBuddy Notification',
			        body: pushMsg
			    }
			};
		
		fcm.send(message, function(err, response){
		    if (err) {
		        console.log("Error in sending PushNotification: >> ", err);
		    } 
		    
		    console.log("PushNotification sent and got response: ", response);
		    
		});
		
	}

};
