/**
 * PRODUCTION Server Configuration
 */
'use strict';

require('dotenv').config({path: process.env.PWD+"/.env"});

module.exports.get = function() {
		return {
			"gatewayId": "000000001x2xx34y",
			"IOT_CONFIG":{
          "org": JSON.parse(process.env.VCAP_SERVICES)["iotf-service"][0].credentials.org,
          "id": "hukam_web", // you can define by yourself here
          "auth-key": JSON.parse(process.env.VCAP_SERVICES)["iotf-service"][0].credentials.apiKey,
          "auth-token": JSON.parse(process.env.VCAP_SERVICES)["iotf-service"][0].credentials.apiToken,
          "type" : "shared" // do not change
      },
			"FIREBASE": {
				"type": "service_account",
			  "project_id": process.env.FIREBASE_project_id,
			  "private_key_id": process.env.FIREBASE_private_key_id,
			  "private_key": process.env.FIREBASE_private_key,
			  "client_email": process.env.FIREBASE_client_email,
			  "client_id": process.env.FIREBASE_client_id,
			  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
			  "token_uri": "https://accounts.google.com/o/oauth2/token",
			  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
			  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-wf72k%40hukam-157906.iam.gserviceaccount.com"
			}
		}

};
