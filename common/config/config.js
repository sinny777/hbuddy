/**
 * PRODUCTION Server Configuration
 */
'use strict';

module.exports.get = function() {
		return {
			  "SERVICES_CONFIG":{
		    	"IOT_CONFIG":{
						"gatewayId": "000000001x2xx34y",
						"credentials": {
								"org": process.env.SERVICES_CONFIG_IOT_CONFIG_credentials_org,
								"id": process.env.SERVICES_CONFIG_IOT_CONFIG_credentials_id,
								"authkey": process.env.SERVICES_CONFIG_IOT_CONFIG_credentials_authkey,
								"authtoken": process.env.SERVICES_CONFIG_IOT_CONFIG_credentials_authtoken,
								"type": process.env.SERVICES_CONFIG_IOT_CONFIG_credentials_type
						}
		    	},
					"CLOUDANT":{
							"credentials": {
									"username": process.env.SERVICES_CONFIG_CLOUDANT_credentials_username,
								  "password": process.env.SERVICES_CONFIG_CLOUDANT_credentials_password,
								  "host": process.env.SERVICES_CONFIG_CLOUDANT_credentials_host,
								  "port": 443,
								  "url": process.env.SERVICES_CONFIG_CLOUDANT_credentials_url
							}
					},
					"CONVERSATION":{
						"credentials":{
								"url": process.env.SERVICES_CONFIG_CONVERSATION_credentials_url,
								"password": process.env.SERVICES_CONFIG_CONVERSATION_credentials_password,
								"username": process.env.SERVICES_CONFIG_CONVERSATION_credentials_username,
								"version_date": process.env.SERVICES_CONFIG_CONVERSATION_credentials_version_date,
								"version": process.env.SERVICES_CONFIG_CONVERSATION_credentials_version,
								"silent": process.env.SERVICES_CONFIG_CONVERSATION_credentials_silent
						},
					"workspace_id": process.env.SERVICES_CONFIG_CONVERSATION_worspace_id
				}
			},
			"EMAIL":{
				"username": process.env.email_username,
				"password": process.env.email_password
			},
			"NOTIFICATION":{
				"PUSH_NOTIFICATION_SERVER_KEY": process.env.PUSH_NOTIFICATION_SERVER_KEY
			}
		}

};
