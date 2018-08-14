'use strict'

var request = require('request'),
		format = require('format'),
    google = require('google');

const feedsHandler = require('./feedsHandler')();

google.resultsPerPage = 20;
var results_count = 3;

module.exports = function() {

var methods = {};

methods.handleResponse = function(response, cb){
	var next_action = response.context.next_action;
	if(next_action && next_action.constructor === Object
		&& next_action.hasOwnProperty('action') && next_action.action == "external_call"){
			console.log("IN externalCallHandler with next_action: ", next_action);

		  if(next_action.service == 'google_search'){
		      methods.searchGoogle(response, function(err, resp){
							if(resp){
								resp.context.next_action = "append";
							}
		          return cb(null, resp);
		      });
		  }

		  if(next_action.service == "weather_service"){
			    methods.getWeather(response, function(err, resp){
							if(err){
								console.log("ERROR in getWeather: >>> ", err);
							}
						 	if(resp){
								resp.context.next_action = "append";
							}
			      	return cb(err, resp);
			    });
		  }

			if(next_action.service == "news_service"){
					methods.getNewsFeeds(response, function(err, resp){
							if(resp){
								resp.context.next_action = "append";
							}
						 	cb(err, resp);
					});
			}

		}
};

methods.getWeather = function(response, cb) {
    if(!response.context && !response.context.location){
      cb(new Error("Please provide the location "), null);
      return false;
    }
    console.info('fetching weather for : >>> ', response.context.location);

    var url =  "https://query.yahooapis.com/v1/public/yql?q=select item.condition from weather.forecast where woeid in (select woeid from geo.places(1) where text='"+response.context.location+"')&format=json";
    request({
        url: url,
        json: true
    }, function (err, resp, body) {
        if (err) {
            cb(err, response);
        }

        if (resp.statusCode != 200) {
            return cb(new Error(format("Unexpected status code %s from %s\n%s", resp.statusCode, url, body)), response);
        }
        try {
          var weather = body.query.results.channel.item.condition;
					var temperature = Number((weather.temp - 32) * 5/9).toFixed(2);
          var respText = format('The current weather conditions in '+response.context.location+' are %s degrees and %s.', temperature, weather.text);
          response.output = {
              text: [respText]
          };
          return cb(null, response);
        } catch(ex) {
					  ex.message = format("Unexpected response format from %s - %s", url, ex.message);
						cb(ex, response);
        }
    });
  };

	methods.searchGoogle = function(response, cb) {
		console.info("IN searchHandler.searchGoogle: >>> ", response);
		var results = ["Here are some search results. \n"];
		google(response.input.text, function (err, res){
			  if (err) cb(err, null);
			  for (var i = 0; i < res.links.length; ++i) {
			    var link = res.links[i];
			    if(i <= results_count){
			    	 results.push(link.description + " ")
			    }else{
			    	break;
			    }
			  }
				response.output.text = results;
			  cb(null, response);
			});
	};

	methods.getNewsFeeds = function(response, cb){
		console.info('fetching News Feeds');
		var params = {"feedURL": "http://feeds.feedburner.com/ndtvnews-latest"};
		feedsHandler.fetchFeedsData(params, function(err, feedsResp){
				if(err) {
						cb(err, null);
				}else{
					console.info("Feeds Response: >>> ", feedsResp);
					if(feedsResp && feedsResp.length > 0){
						response.output = {
								text: feedsResp
						};
					}else{
						// delete response.output["text"];
						response.context.next_action == "DO_NOTHING";
					}
						cb(null, response);
				}
		});
	};

    return methods;

}
