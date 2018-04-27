

	var CONFIG = require('../../common/config/config').get();

/**
 * Make sure app is provided while instantiating this class and calling any method
 */
module.exports = function(app) {

	var commonHandler = require('../../server/handlers/commonHandler')();
	var emailHandler = require('../../server/handlers/emailHandler')();
	var FCM = require('fcm-push');
	var Notification;
	var UserSetting;
	var Device;

	var methods = {};

	methods.sendNotification = function(reqPayload, cb) {
		console.log('IN notificationHandler.sendNotification: >> ', reqPayload);
		if(reqPayload.groups && reqPayload.groups.length > 0){
			methods.notifyGroups(reqPayload, cb);
		}
		if(reqPayload.users && reqPayload.users.length > 0){
			methods.notifyUsers(reqPayload, cb);
		}

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
						for(let notifyWho of eventConfig.notify){
								if(notifyWho.type == "user"){
										var user = {
											"userId": notifyWho.userId,
											"push": {
												"notify": true,
												"title":"hBuddy Notification",
											    "pushData":{
											    	"style" : "picture",
													"picture" : "http://wallpapercave.com/wp/3Ma6LaY.jpg"
												},
												"pushMsg":"There's "+eventName+" at "+device.title
											}
										}
										notifyUsers.push(user);
								}
						}

						methods.notifyUsers({"users": notifyUsers}, function(notifyErr, notifyResp){
							if(notifyErr){
								console.log("ERROR in Notifying User: >> ", notifyErr);
								return;
							}
							console.log("User Notified Resp: >> ", notifyResp);
						});

					}
				}
				cb(null, "Users Notified >>> ");
			}else{
				cb(new Error("No device Found with serial >> "+deviceSerial), null);
			}

		});


	};

	/**
	 * Send Notifications (Email, Push, SMS etc.) to Groups
	 */
	methods.notifyGroups = function(reqPayload, cb){
		console.log("IN notifyGroups: >> ", reqPayload.groups);
		//TODO: Implementation Pending
		return cb(null, "Notify Groups is currently not implemented !! ");
	}

	/**
	 * Send Notifications (Email, Push, SMS etc.) to Users
	 * as per their settings
	 */
	methods.notifyUsers = function(reqPayload, cb){
		console.log("IN notifyUsers: >> ", reqPayload.users);
		var registrationIds = [];
		var count = 0;
		for(let user of reqPayload.users){
			count++;
			if(user.userId && user.email){
					//TODO: Send Notification via Email
					console.log("Send Notification via Email to User: >> ", user);
				return 	cb(null, "Send Notification via Email is currently not implemented !! ");
			}
			if(user.userId && user.sms){
					//TODO: Send Notification via SMS
					return 	cb(null, "Send Notification via SMS is currently not implemented !! ");
			}
			if(user.userId && user.push && user.push.notify){
				if(!UserSetting){
					UserSetting = app.models.UserSetting;
				}
				UserSetting.find({where:{"userId": user.userId}}, function(err, userSettings) {
					if(err){
						console.log("ERROR WHILE FETCHING USER SETTINGS: ", err);
					}else{
						if(!userSettings || userSettings.length == 0){
							console.log("No User settings found for userId: >> ", user.userId);
							return;
						}
						registrationIds.push(userSettings[0].registrationId);
						if(count == reqPayload.users.length){
							methods.sendPushNotification({"title": user.push.title,"pushData": user.push.pushData, "pushMsg": user.push.pushMsg, "registrationIds": registrationIds}, function(err, response){
								if (err) {
										console.log("Error in sending PushNotification: >> ", err);
								} else {
										console.log("PushNotification Successfully Sent with Response: ", response);
								}
								return cb(err, response);
							});
						}
					}
				});
			}
		}
	}

	methods.sendNotificationOld = function(payload, board, placeArea, device) {
		console.log('IN notificationHandler.sendNotification: >> ', device);
		var registrationIds = [];
		if(!Notification){
			Notification = app.models.Notification;
		}
		var findReq = {
    			  		 where: {"or": [{"and":[{"type": "DEVICE"}, {"typeId": device.deviceIndex}, {"typeValue": device.value}, {"typeParentId": device.parentId}]},
    			  		                {"and":[{"type": "PLACEAREA"}, {"typeValue": placeArea.id}]}]
    			  		 }
						};
		Notification.find(findReq, function(err, notifications) {
			if(err){
				console.log("ERROR IN FINDING NOTIFICATIONS: >>> ", err);
				return;
			}
			var pushCount = 0;
			for (i = 0; i < notifications.length; i++) {
				var notification = notifications[i];
				if(notification.push){
					pushCount++;
					if(!UserSetting){
						UserSetting = app.models.UserSetting;
					}
					var count = 0;
					UserSetting.find({where:{"userId": notification.userId}}, function(err, userSettings) {
						count++;
						if(err){
							console.log("ERROR WHILE FETCHING USER SETTINGS: ", err);
						}else{
							registrationIds.push(userSettings[0].registrationId);
							if(pushCount == count){
								methods.handlePushNotification(payload, board, placeArea, device, registrationIds);
							}
						}
					});
				}
			}
		});

	};

	methods.handlePushNotificationOld = function(payload, board, placeArea, device, registrationIds){
		var pushMsg = placeArea.title +"'s " + device.title + " status is changed to " + device.status +" at " +new Date();
		var pushData = {
				boardId : payload.d.boardId,
				deviceIndex : payload.d.deviceIndex,
				deviceValue : payload.d.deviceValue,
				style : "picture",
				picture : "http://wallpapercave.com/wp/3Ma6LaY.jpg"
			};

		methods.sendPushNotification({"title":"hBuddy Notification","pushData": pushData, "pushMsg": pushMsg, "registrationIds": registrationIds}, function(err, response){
			if (err) {
					console.log("Error in sending PushNotification: >> ", err);
			} else {
					console.log("PushNotification Successfully sent with response: ", response);
			}
		});
	};

	methods.sendPushNotification = function(payload, cb) {
		console.log('IN notificationHandler.sendPushNotification: >> ', payload);
		var serverKey = CONFIG.NOTIFICATION.PUSH_NOTIFICATION_SERVER_KEY;
		var fcm = new FCM(serverKey);
		var message = {
			    to: payload.registrationIds.join(), // required fill with device token or topics
			    collapse_key: 'hbuddy_collapse_key',
			    data: payload.pushData,
			    notification: {
			        title: payload.title,
			        body: payload.pushMsg
			    }
			};

		fcm.send(message, function(err, response){
		    cb(err, response);
		});

	};

	return methods;

}
