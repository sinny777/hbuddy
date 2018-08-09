

	var CONFIG = require('../../common/config/config').get();

/**
 * Make sure app is provided while instantiating this class and calling any method
 */
module.exports = function(app) {

	var commonHandler = require('../../server/handlers/commonHandler')();
	var emailHandler = require('../../server/handlers/emailHandler')();
	var admin = require('firebase-admin');
	admin.initializeApp({
			credential: admin.credential.cert(CONFIG.FIREBASE),
			databaseURL: "https://"+CONFIG.FIREBASE_project_id+".firebaseio.com"
		});
	var Notification;
	var UserSetting;
	var Device;

	var methods = {};

	methods.sendNotification = function(reqPayload, cb) {
		console.log('IN notificationHandler.sendNotification: >> ', reqPayload);
		methods.sendFCMNotification(reqPayload, function(notifyErr, notifyResp){
			cb(notifyErr, notifyResp);
		});
	};

	methods.eventTriggered = function(reqPayload, cb) {
		console.log('IN notificationHandler.eventTriggered: >> ', reqPayload);
		let deviceSerial = reqPayload.deviceSerial;
		let eventName = reqPayload.event;
		if(!deviceSerial){
			return cb(new Error("No Device Serial provided..."), null);
		}
		var deviceHandler = require('../../server/handlers/deviceHandler')();
		var findReq =  {where: {"deviceId": deviceSerial}};
		console.log('IN NotificationHandler.eventTriggered, findDevice with deviceId: ', deviceSerial);
		if(!Device){
			Device = app.models.Device;
		}
		Device.find(findReq, function(err, devices) {
			if(err){
				console.log("Error in finding Device: >>> ", err);
				return;
			}

			var device;
			if(devices && devices.length > 0){
				device = devices[0];
			}
			var notifyUsers = [];
			if(device && device.config && device.config.onEvent){
				for(let eventConfig of device.config.onEvent){
					if(eventConfig.name == eventName){
						// Check for Push Notifications to be sent
						if(eventConfig.notify && eventConfig.notify.length > 0){
							msg = getPushPayload();
							msg.topic = device.deviceId+"_"+eventName;
							msg.notification.body = eventName + " is triggered on "+device.title;
							methods.sendFCMNotification(msg, function(notifyErr, notifyResp){
								if(notifyErr){
									console.log("ERROR in sending Event triggered notification: >> ", notifyErr);
									return;
								}
								console.log("Event triggered notification Resp: >> ", notifyResp);
							});
						}
					}
				}
				cb(null, "Users Notified >>> ");
			}else{
				cb(new Error("No device Found with serial >> "+deviceSerial), null);
			}

		});


	};

	methods.sendFCMNotification = function(pushReq, cb){
			console.log('IN notificationHandler.sendFCMNotification: >> ', pushReq);
			admin.messaging().send(pushReq)
			.then((response) => {
				cb(null, response);
			})
			.catch((error) => {
				cb(error, null);
			});
	}

	methods.getPushPayload = function(){
		var message = {
				notification: {
					title: "Hukam Notification",
					body: "Hukam Notification"
				},
				data: {	},
				android: {
					ttl: 3600 * 1000, // 1 hour in milliseconds
					priority: 'high',
					notification: {
						// icon: 'stock_ticker_update',
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
				topic: "hukam"
		};

		return message;

	}

	return methods;

}
