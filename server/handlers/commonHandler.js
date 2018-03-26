
var crypto = require('crypto');
var CONFIG = require('../../common/config/config').get();
const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: CONFIG.EMAIL.username,
    pass: CONFIG.EMAIL.password
  }
});

module.exports = function() {

var methods = {};

	methods.random = function(howMany, chars) {
	    chars = chars
	        || "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ23456789";
	    var rnd = crypto.randomBytes(howMany)
	        , value = new Array(howMany)
	        , len = chars.length;

	    for (var i = 0; i < howMany; i++) {
	        value[i] = chars[rnd[i] % len]
	    };

	    return value.join('');
	};

	/**
	 * timeString is in format HH:MM:SS
	 */
	methods.timeDifferenceFromStr = function(timeString){
		console.log("IN commonHandler.timeDifference with timeString: ", timeString);
		var timeArr;
		var hours;
		var mins;
		var secs;
			 timeArr = timeString.split(":");
			 hours = parseInt(timeArr[0]);
			 mins = parseInt(timeArr[1]);
			 secs = parseInt(timeArr[2]);
		return methods.timeDifference(hours, mins, secs);
	};

	methods.timeDifference = function(hours, minutes, seconds){
		console.log("IN commonHandler.timeDifference with values, hours: ", hours, ", mins: ", minutes, ", secs: ", seconds);
		var timeNow = new Date();
		var hourNow = timeNow.getHours();
		var minNow = timeNow.getMinutes();
		var scheduleTime = new Date();
		scheduleTime.setHours(hours, minutes, seconds);

		console.log("timeNow: >>> ", timeNow, ", scheduleTime: ", scheduleTime);
		var secsDiff = (scheduleTime.getTime() - timeNow.getTime())/1000;
		return secsDiff;
	};

  methods.sendEmail = function(mailOptions, cb) {
    console.log("IN commonHandler.sendMail: >> ", mailOptions);
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
        cb(error, info);
      });
	};

    return methods;

}
