'use strict'

var bluemix = require('../../common/config/bluemix');

var CONFIG = require('../../common/config/config').get(),
    watson = require('watson-developer-cloud'),
    request = require('request'),
    format = require('util').format,
    conversationConfig = CONFIG.SERVICES_CONFIG.conversation,
    conversation_service = watson.conversation(conversationConfig.credentials);

var feedsHandler = require('../../server/handlers/feedsHandler')();
var searchHandler = require('../../server/handlers/searchHandler')();
var commonHandler = require('../../server/handlers/commonHandler')();

module.exports = function(app) {
    
var methods = {};
  	
	methods.callConversation = function(reqPayload, cb) {
		if(!reqPayload && !reqPayload.params || !reqPayload.params.input){
			cb("INVALID PARMS FOR CONVERSATION ! ", null);
		}
		reqPayload.params.workspace_id = conversationConfig.workspace_id;
		reqPayload.params.input = { "text": reqPayload.params.input };
		reqPayload.params.entities = [];
		reqPayload.params.intents = [];
		reqPayload.params.output = {};
        conversation_service.message(reqPayload.params, function(err, conversationResp) {
        	console.log("<<<<<<<< CONVERSATION API RESPONSE :>>>>>>>>>>>> ", JSON.stringify(conversationResp));
            handleConversationResponse(err, conversationResp, cb);
        });
	};
	
	function handleConversationResponse(err, conversationResp, cb){
		var response = {conversationResp: conversationResp};
		
		if(conversationResp.intents && conversationResp.intents.length > 0 && conversationResp.intents[0] == 'appliance_action'){
			handleApplianceAction(response, function(err, resp){
				cb(err, resp);
				respSent = true;
			});
		}
		
		if(conversationResp.context){
			var next_action = conversationResp.context.next_action;
			var respSent = false;
			if(!next_action){
				cb(err, response);
			}
			
			if(next_action && next_action == "weather_service"){
				getWeather(response, function(err, response){
					cb(err, response);
					respSent = true;
				});
			}
			
			if(next_action && next_action == "news_service"){
				getNewsFeeds(response, function(err, response){
					cb(err, response);
					respSent = true;
				});
			}
			
			if(next_action && next_action == "google_search"){
				searchGoogle(response, function(err, response){
					cb(err, response);
					respSent = true;
				});
			}
			
			if(next_action && next_action == "date_time"){
				cb(err, response);
				respSent = true;
			}
			
			if(next_action && next_action == "joke"){
				getRandomJoke(response, function(err, response){
					cb(err, response);
					respSent = true;
				});
			}
			
			/*
			if(!respSent){
				cb(err, response);
			}
			*/
			
		}else if(conversationResp && conversationResp.output && conversationResp.output.text){
				cb(err, response);
			}else{
				cb(err, response);
			}
	};
	
	function handleApplianceAction(response, cb){
		console.log("IN handleApplianceAction: >>> ", response);
		if(conversationResp.context && conversationResp.context.gatewayId){
			
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
	    console.log('fetching weather');
	    var url =  "https://query.yahooapis.com/v1/public/yql?q=select item.condition from weather.forecast where woeid in (select woeid from geo.places(1) where text='New Delhi, IN')&format=json";
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
	        	
	        	var respText = format('The current weather conditions are %s degrees and %s.', temperature, weather.text);
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