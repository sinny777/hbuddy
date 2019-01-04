var jwt = require('jsonwebtoken');
var atob = require('atob');

module.exports = function (app) {

  /*
  if (process.env.NODE_ENV !== 'production' && process.env.DEV_ACCESS_TOKEN !== undefined) {
    var defaultToken = {
      id: process.env.DEV_ACCESS_TOKEN || new Date().getTime(),
      userId: 1
    };
    app.models.AccessToken.create(defaultToken).then(function (res) {
      console.log('[DEV_ACCESS_TOKEN] Adding AccessToken: %s', res.id);
    }).catch(function (err) {
      console.log(err);
    });
  }
  */

/*
  try {
    const auth = "AAIkYWQ3NDA2MjUtM2JiZS00MWYyLWIzYzctN2Y3OWJlZDdkZTY0vwbYLdQnBYCa7RgE1XaPsuaT-988ancGneI0pFImOwHQLVGKZT4jcIw7-T36q5Hwc_qDenGaZ3-Tcl3m8XOGRSDy373EEAIEBEnF-r3_DmjklXyy2LXWKF6T6wfVsHAgp5yO-M9wz4OxBc1SMy52QxBBcliMKoIyumlBKRsidR8";
    var decoded = decoder(auth);
    console.log("DECODED: >>>> ", decoded);
    var decoded = parseToken(auth);
    console.log("TOKEN: >>> ", decoded);
  } catch (e) {
    console.log(e);
    return null;
  }

  function parseToken(token) {
    try {
    	var buf = new Buffer(token, 'base64'); // create a buffer and tell it the data coming in is base64
  		var token = buf.toString('utf8');        // read it back out as a string
  		// console.log(token);
  		var decoded = jwt.decode(token);
  		console.log("JWT DECODED: >>> ", decoded);
  		return token;
    } catch (e) {
  		console.log(e);
      return null;
    }
  };

  function decoder(token) {
      try {

  				base64url = token;
          //Convert base 64 url to base 64
          var base64 = base64url.replace('-', '+').replace('_', '/');
  				// console.log("base64: >> ", base64);
  				// var buf = new Buffer(parts[1], 'base64'); // create a buffer and tell it the data coming in is base64
  				var str = base64.toString('utf8');
  				console.log("str: >>> ", str);
          //atob() is a built in JS function that decodes a base-64 encoded string
          var utf8 = atob(str);
  				console.log("utf8: >>> ", utf8);
          var decoded = jwt.decode(utf8);
          console.log(">>>>>>>>> ", decoded);
          //Then parse that into JSON
          var json = JSON.parse(utf8);
          //Then make that JSON look pretty
          var json_string = JSON.stringify(json, null, 4)
      } catch (err) {
          json_string = "Bad Section.\nError: " + err.message
      }
      return json_string
  }
*/


};
