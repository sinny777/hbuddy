module.exports = function(Notification) {

  Notification.remoteMethod('notify', {
		    	accepts: [
		            { arg: 'req', type: 'object', http: function(ctx) {
		              return ctx.req;
		            }
		          }],
		         http: {path: '/notify', verb: 'post'},
		         returns: {arg: 'data', type: 'object'}
	});

  Notification.remoteMethod('sendEmail', {
		    	accepts: [
		            { arg: 'req', type: 'object', http: function(ctx) {
		              return ctx.req;
		            }
		          }],
		         http: {path: '/email', verb: 'post'},
		         returns: {arg: 'data', type: 'object'}
	});

	Notification.notify = function(req, cb) {
		console.log("\n\nIn Notification.notify : >>>> ", req.body);
		var notificationHandler = require('../../server/handlers/notificationHandler')(Notification.app);
		var reqPayload = req.body;
		notificationHandler.sendNotification(reqPayload, function(err, resp){
			if (err) {
          console.log("Error in sending Notification: >> ", err);
      } else {
          console.log("Notification Successfully sent with response: ", resp);
      }
			cb(err, resp);
		});
 };

 Notification.sendEmail = function(req, cb) {
   console.log("\n\nIn Notification.sendEmail : >>>> ", req.body);
   var commonHandler = require('../../server/handlers/commonHandler')(Notification.app);
   var reqPayload = req.body;
   commonHandler.sendEmail(reqPayload, function(err, resp){
     if (err) {
         console.log("Error in sending Email: >> ", err);
     } else {
         console.log("Email Successfully sent with response: ", resp);
     }
     cb(err, resp);
   });
};

};
