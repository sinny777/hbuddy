'use strict'

var bluemix = require('../../common/config/bluemix');

// var CONFIG = require('../../common/config/config').get(),
    watson = require('watson-developer-cloud'),
    request = require('request'),
    format = require('util').format,
    // conversationConfig = CONFIG.SERVICES_CONFIG.conversation,
    conversation_service = watson.conversation({ version: 'v1', version_date: '2017-11-07' });

var feedsHandler = require('../../server/handlers/feedsHandler')();
var searchHandler = require('../../server/handlers/searchHandler')();
var commonHandler = require('../../server/handlers/commonHandler')();

module.exports = function(app) {

var methods = {};

	methods.callConversation = function(reqPayload, cb) {
		if(!reqPayload && !reqPayload.params || !reqPayload.params.input){
			cb("INVALID PARMS FOR CONVERSATION ! ", null);
		}

    const workspaceId = params.workspaceId || process.env.WATSON_ASSISTANT_WORKSPACE_ID || '<workspace-id>';
    if (!workspaceId || workspaceId === '<workspace-id>') {
      return reject(new Error('The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/sinny777/conversation">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/sinny777/conversation/blob/master/training/conversation/car_workspace.json">here</a> in order to get a working application.'));
    }

		reqPayload.params.workspace_id = workspaceId;
		reqPayload.params.input = { "text": reqPayload.params.input };
		reqPayload.params.entities = [];
		reqPayload.params.intents = [];
		reqPayload.params.output = {};
        conversation_service.message(reqPayload.params, function(err, conversationResp) {
//        	console.log("<<<<<<<< CONVERSATION API RESPONSE :>>>>>>>>>>>> ", JSON.stringify(conversationResp));
            handleConversationResponse(err, conversationResp, cb);
        });
	};

	function handleConversationResponse(err, conversationResp, cb){
		var response = {conversationResp: conversationResp};

		if(conversationResp.intents && conversationResp.intents.length > 0
			&& conversationResp.intents[0].intent == 'appliance_action'){
			handleApplianceAction(response, function(err, resp){
				cb(err, resp);
				return false;
			});
		}else if (conversationResp.context){
			var next_action = conversationResp.context.next_action;
			if(!next_action){
				console.log("No next_action found in Conversation response context !! ");
				cb(err, response);
				return false;
			}

			switch(next_action) {
			    case "weather_service":
			    	getWeather(response, function(err, resp){
						cb(err, resp);
					});
			        break;
			    case "news_service":
			    	getNewsFeeds(response, function(err, resp){
						cb(err, resp);
					});
			        break;
			    case "google_search":
			    	searchGoogle(response, function(err, resp){
						cb(err, resp);
					});
			        break;
			    case "date_time":
			    	cb(err, response);
			        break;
			    case "joke":
			    	getRandomJoke(response, function(err, resp){
						cb(err, resp);
						return false;
					});
			        break;
			    case "continue":
			    	cb(err, response);
			        break;
			    case "completed":
			    	cb(err, response);
			        break;
			    default:
			    	cb(err, response);
			}

		}else if(conversationResp && conversationResp.output && conversationResp.output.text){
				cb(err, response);
			}else{
				cb(err, response);
			}
	};

	function handleApplianceAction(response, cb){
		if(response.conversationResp.context && response.conversationResp.context.gatewayId){
			console.log("IN handleApplianceAction, Fetch Data for Gateway: >>> ", response.conversationResp);

			if(response.conversationResp.entities && response.conversationResp.entities.length > 0){
				var area, action, appliance;
				for(var i = 0; i < response.conversationResp.entities.length; i++){
					var entity = response.conversationResp.entities[i];
					if(entity.entity == 'actions'){
						action = entity.value;
					}
					if(entity.entity == 'area'){
						area = entity.value;
					}
					if(entity.entity == 'appliance'){
						appliance = entity.value;
					}
				}
				console.log("ACTION: ", action, ", AREA: ", area, ", APPLIANCE: ", appliance);
			}

		}
		cb(null, response);
	};

	function getRandomJoke(response, cb){
		cb(null, response);
	};

	function searchGoogle(response, cb) {
	    console.log('Doing Google Search ');
	    var params = {"keyword": response.conversationResp.input.text};
	    searchHandler.searchGoogle(params, function(err, results){
	    	if (err) {
	            cb(err, null);
	        }else{
	        	if(results && results.length > 0){
	        		response.conversationResp.output = {
		        			text: results
		        	};
	        	}else{
	        		delete response.conversationResp.output["text"];
	        		response.conversationResp.context.next_action == "DO_NOTHING";
	        	}
	            cb(null, response);
	        }
	    });
	};

	function getNewsFeeds(response, cb) {
	    console.log('fetching News Feeds');
	    var params = {"feedURL": "http://feeds.feedburner.com/ndtvnews-latest"};
	    feedsHandler.fetchFeedsData(params, function(err, feedsResp){
	    	if (err) {
	            cb(err, null);
	        }else{
	        	console.log("Feeds Response: >>> ", feedsResp);
	        	if(feedsResp && feedsResp.length > 0){
	        		response.conversationResp.output = {
		        			text: feedsResp
		        	};
	        	}else{
	        		delete response.conversationResp.output["text"];
	        		response.conversationResp.context.next_action == "DO_NOTHING";
	        	}
	            cb(null, response);
	        }
	    });
	};

	function getWeather(response, cb) {
		var location = response.conversationResp.context.location;
		if(!location){
			response.conversationResp.output = {
        			text: ["Please tell me the location"]
        	};
            cb(null, response);
            return false;
		}
	    console.log('fetching weather data for ', location);
	    var url =  "https://query.yahooapis.com/v1/public/yql?q=select item.condition from weather.forecast where woeid in (select woeid from geo.places(1) where text='"+location+"')&format=json";
	    request({
	        url: url,
	        json: true
	    }, function (err, resp, body) {
	        if (err) {
	            cb(err, null);
	        }
	        if (resp.statusCode != 200) {
	           cb(new Error(format("Unexpected status code %s from %s\n%s", resp.statusCode, url, body)), null);
	        }
	        try {
	        	var weather = body.query.results.channel.item.condition;

	        	var temperature = Number((weather.temp - 32) * 5/9).toFixed(2);
	        	if(location)
	        	var respText = format('The current weather conditions in %s are %s degrees and %s.', location, temperature, weather.text);
	        	response.conversationResp.output = {
	        			text: [respText]
	        	};
	        	console.log(respText);
	            cb(null, response);
	        } catch(ex) {
	            ex.message = format("Unexpected response format from %s - %s", url, ex.message);
	            cb(ex, null);
	        }
	    });
	};

    return methods;

}
