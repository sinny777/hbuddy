'use strict';

module.exports = function(Conversation) {
	
	var CONFIG = require('../config/config').get(),
	watson = require('watson-developer-cloud');

	Conversation.remoteMethod('doconversation', {
		    	accepts: [
		            { arg: 'req', type: 'object', http: function(ctx) {
		              return ctx.req;
		            } 
		          }],	
		         http: {path: '/', verb: 'post'},
		         returns: {arg: 'conversation', type: 'object'}
	});
	
	Conversation.doconversation = function(req, cb) {
		console.log("In Conversation.doconversation : >>>> ", req.body);
		var conversationHandler = require('../../server/handlers/conversationHandler')(Conversation.app);
		var reqPayload = req.body;
		conversationHandler.callConversation(reqPayload, function(err, resp){
			console.log("SENDING CONVERSATION RESPONSE: >>>> ", resp);
			cb(err, resp);
		});
	  };

};
