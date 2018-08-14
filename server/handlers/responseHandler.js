'use strict'

module.exports = function(app) {

  let Mapping;

var methods = {};

	methods.formatResponse = function(response, cb) {
    console.info("IN responseHandler.formatResponse: >>>> ", response.output);
    if(response.output && response.output.hasOwnProperty('type')
       && response.output.type == "CLOUDANT_MAPPING"){
         for(let textKey of response.output.mappings){
           var findReq =  {where: {"key": textKey}};
           console.log('IN responseHandler.formatResponse, findMapping with key: ', textKey);
           if(!Mapping){
             Mapping = app.models.Mapping;
           }
           Mapping.find(findReq, function(err, mappings) {
                 if(err){
                   console.log("Error in finding Mappings: >>> ", err);
                   return;
                 }
                 if(mappings && mappings.length > 0){
                     if(response.context && response.context.locale){
                       response.output.text = mappings[0].output[response.context.locale];
                     }else{
                       response.output.text = mappings[0].output["en"];
                     }
                     console.info("MAPPINGS OUTPUT: >>> ", response.output.text);
                     replaceContextVariables(response, cb);
                 }else{
                     replaceContextVariables(response, cb);
                 }

            });
         }
    }else{
      replaceContextVariables(response, cb);
    }

	};


  function replaceContextVariables(response, cb){
    if(response.context){
      var texts = [];
      for(let t of response.output.text){
        if(t.indexOf("$") != -1){
          //TODO: This is currently only for $location, but needs to write
          // an engine that can replace all context variables
            if(t.indexOf("$location") != -1){
              t = t.replace("$location", response.context.location);
              console.log("AFTER REPLACEING Context variables: >> ", t);
            }
        }
        texts.push(t);
      }
      response.output.text = texts;
    }
    return cb(null, response);
  }

    return methods;

}
