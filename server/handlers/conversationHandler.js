'use strict'

var request = require('request'),
		format = require('format');
const assert = require('assert');

var watson = require('watson-developer-cloud'),
    request = require('request'),
    format = require('util').format,
    conversationService = watson.conversation({ version: 'v1', version_date: '2017-11-07' });

const commonHandler = require('./commonHandler')();
const externalCallHandler = require('./externalCallHandler')();
var discoveryHandler;

var pubsub = require('../../server/pubsub.js');
var socket;
var ENABLE_DISCOVERY = false;

let Conversation;

module.exports = function(app) {

	if(!Conversation){
		Conversation = app.models.Conversation;
	}

	const responseHandler = require('./responseHandler')(app);

	if(process.env.ENABLE_DISCOVERY){
		ENABLE_DISCOVERY = (process.env.ENABLE_DISCOVERY.toLowerCase() === 'true');
	}

	if(ENABLE_DISCOVERY){
		 discoveryHandler = require('./discoveryHandler')();
	}

var methods = {};

		methods.callVirtualAssistant = function(params){

			function logError(e) {
        console.error(e);
        throw e;  // reject the Promise returned by then
      }
			return callWatsonAssistant(params)
			.then(callWatsonDiscovery)
			.then(updateWatsonResponse)
			.then(methods.formatWatsonResponse)
			.then(null, logError);

		};


/**
 * This method is used to call IBM Watson Assistant (formerly Conversation)
 * and based on the response it handles business logic and even call watson
 * Discovery Service for fetching response.
 * @param  {[type]} params       Payload for calling Watson Assistant
 * @param  {[type]} Conversation Loopback Model for CRUD operations in DB
 * @return {[type]}              API Response with Context, Output and more
 */
 function callWatsonAssistant(params) {
		console.info("IN conversationHandler.callConversation with params: ", params);
		return new Promise(function(resolve, reject){
		    assert(params, 'params cannot be null');
				if(params.context){
						params.context.next_action = null;
				}else{
          params.context = {};
        }
				console.info("User text: ", params.input.text);
				if((!params.input || !params.input.text) && !params.context.initConversation){
						return reject(new Error('Input text cannot be null or empty !'));
				}
			  const workspaceId = params.workspaceId || process.env.WATSON_ASSISTANT_WORKSPACE_ID || '<workspace-id>';
		    if (!workspaceId || workspaceId === '<workspace-id>') {
		      return reject(new Error('The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/sinny777/conversation">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/sinny777/conversation/blob/master/training/conversation/car_workspace.json">here</a> in order to get a working application.'));
		    }

		    var payload = {
		      workspace_id: workspaceId,
		      context: params.context || {},
		      input: params.input || {}
		    };
		    // console.info("Calling Watson Assistant with payload: >> ", payload);
		    conversationService.message(payload, function(err, conversationResp) {
					if (err) {
		        return reject(err);
		      }
					conversationResp.context.initConversation = false;
					conversationResp.datetime = new Date();

		        let returnJson = conversationResp;
		        delete returnJson.environment_id;
		        delete returnJson.collection_id;
		        delete returnJson.username;
		        delete returnJson.password;

						return resolve(conversationResp);

		    });
		});

};

function callWatsonDiscovery(conversationResp){
	// console.info("IN callWatsonDiscovery, conversationResp: ", conversationResp);
	return new Promise(function(resolve, reject){
			if(conversationResp.output.hasOwnProperty('action') && conversationResp.output.action.hasOwnProperty('call_discovery')) {
				if(ENABLE_DISCOVERY && discoveryHandler){
					discoveryHandler.callDiscovery(conversationResp).then((discoveryResults) => {
							conversationResp.output.discoveryResults = discoveryResults;
							delete conversationResp.username;
							delete conversationResp.password;
							console.log("CALLED DISCOVERY: >>>>>>> ");
							return resolve(conversationResp);
						}).catch(function(error) {
							return reject(error);
						});
				}else{
					console.info("\n\n<<<<<<< DISCOVERY SERVICE IS DISABLED >>>>>>>>>>\n\n");
					return resolve(conversationResp);
				}
			}else{
				return resolve(conversationResp);
			}
	});
}

	function updateWatsonResponse(response) {
		return new Promise(function(resolve, reject){
					    var responseText;
					    if (!response.output) {
					      response.output = {};
					    }

					    if (response.intents && response.intents[0]) {
					      var intent = response.intents[0];
					      if (intent.confidence <= 0.5 && (!response.output.text || response.output.text == "")) {
					        responseText = 'I did not understand your intent, please rephrase your question';
					      }
					    }
							if(response.context && response.context.next_action){
					        var next_action = response.context.next_action;
					        if(next_action && next_action.constructor === Object
										&& next_action.hasOwnProperty('action') && next_action.action == "external_call"){
											console.info("NEXT ACTION OBJECT: >>> ", next_action);
											 setTimeout(function(){
													externalCallHandler.handleResponse(response, function(err, response){
														console.log("External Call Response: >> ", response.output.text);
														console.log("External Call Context: >> ", response.context);
														commonHandler.getEventEmitter().emit("external_call", err, response);
													});
											 }, 2000);
									}else{
										return resolve(response);
									}
					    }else{
							      if(!response.output.text){
							        response.output.text = [];
							      }
										if(responseText){
												response.output.text.push(responseText);
										}
							     return resolve(response);
					    }

							if(response.output.text){
									return resolve(response);
							}

				});

  }

	methods.formatWatsonResponse = function(response){
		return new Promise(function(resolve, reject){
			responseHandler.formatResponse(response, function(err, formattedResp){
				updateDBIfRequired(formattedResp);
				return resolve(formattedResp);
			});
		});
	}

	function updateDBIfRequired(conversationResp){
		if(!conversationResp.context.hasOwnProperty('save_in_db') || conversationResp.context.save_in_db){
			console.info("IN updateDBIfRequired: >>> ", conversationResp.context.save_in_db);
			// conversationResp.context.save_in_db = false;
			if(!Conversation){
				Conversation = app.models.Conversation;
			}
			Conversation.upsert(conversationResp, function(err, savedConversation){
					if(err){
						console.info("ERROR IN SAVING CONVERSATION: >> ", err);
					}else{
						console.info("<<<< CONVERSATION SAVED IN DB SUCCESSFULLY >>>>>>> ");
					}
				});
		}
	}

	methods.publishResponse = function(formattedResp){
					if(formattedResp.context.next_action == "append"){
								if(!formattedResp.context.channel || formattedResp.context.channel == "WEB"){
									if(!socket){
										socket = Conversation.app.io;
									}

									var conversation = {"conversation": formattedResp};
									var collectionName = 'CHAT'; // DEFAULT collectionName
									if(formattedResp.context.conversation_id){
										collectionName = formattedResp.context.conversation_id;
									}

									console.info("PUBLISHING CONVERSATION RESPONSE TO collectionName: >>>> ", collectionName);
									pubsub.publish(socket, {
											collectionName : collectionName,
											data: conversation,
											method: 'POST'
									});
								}else{
									console.info("NOTHING TO APPEND Channel: >>>> ", formattedResp.context.channel);
								}
					}
	}

	methods.publishData = function(publishReq){
		return new Promise(function(resolve, reject){
				if(!socket){
					socket = Conversation.app.io;
				}
				console.log("IN conversationHandler.publishData, publishReq: >>> ", publishReq);
				/*
				pubsub.publish(socket, {
						collectionName : publishReq.collectionName,
						data: publishReq.data,
						method: 'POST'
				});
				*/
				socket.emit(publishReq.collectionName, publishReq.data);
				return resolve({"response": "PUBLISHED"});
		});
	}

  return methods;

}
