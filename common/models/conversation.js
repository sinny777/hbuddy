'use strict';

module.exports = function(Conversation) {

	var conversationHandler;

	Conversation.remoteMethod('doconversation', {
		    	accepts: [
		            { arg: 'req', type: 'object', http: function(ctx) {
		              return ctx.req;
		            }
		          }],
		         http: {path: '/', verb: 'post'},
		         returns: {arg: 'conversation', type: 'object'}
	});

	Conversation.doconversation = function(req, next) {
		console.log("\n\nIn Conversation.doconversation : >>>> ", req.body);
		if(!conversationHandler){
			conversationHandler = require('../../server/handlers/conversationHandler')(Conversation.app);
		}
		var reqPayload = req.body;
			conversationHandler.callVirtualAssistant(reqPayload.params).then((responseJson) => {
				// console.log("IBM WATSON RESPONSE: >>> ", responseJson);
				next(null, responseJson);
			}).catch(function(error) {
					next(error, null);
			});
 };

 Conversation.publishToSocket = function(req, next){
	 var reqPayload = req.body;
	 if(!conversationHandler){
		 conversationHandler = require('../../server/handlers/conversationHandler')(Conversation.app);
	 }
	 conversationHandler.publishData(reqPayload).then((responseJson) => {
			 next(null, responseJson);
		 }).catch(function(error) {
				 next(error, null);
		 });
 };

};
