

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

	var methods = {};

	methods.sendNotification = function(payload, board, placeArea, device) {
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

	methods.handlePushNotification = function(payload, board, placeArea, device, registrationIds){
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
		console.log('IN notificationHandler.sendPushNotification: >> ', payload.pushMsg);
		console.log('IN notificationHandler.registrationIds: >> ', payload.registrationIds);
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
