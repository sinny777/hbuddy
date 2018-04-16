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

};
