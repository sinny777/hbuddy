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
			},
			"FIREBASE": {
				"type": "service_account",
			  "project_id": process.env.FIREBASE_project_id,
			  "private_key_id": process.env.FIREBASE_private_key_id,
			  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCtRYF0Oxh9LFbL\nABb6rRGkhmitpdNRxBccDkrJlqiMrDBiEFI4WEt4ou1g2wN89pWKiWJey60WK+Uw\nWEkfvteh7fHBzH8Zi97fdJV77Qv6y78qeuYfPCN21h0gQ0JeBcm4nBSxwNvTYHne\nSoNqrLq2v6oIa0DfBuUxSh6Q2Vzskx7GZwfXi4v7QLn6NPm9XGBFQk1tgUZmWfYl\n8eEv8pXHpe9M1HPlAQPpVbr3G55S2X69v4k7buj64VQNv1g2XQY8nN7vwZXomqPW\nhIw2709l/FzIXACn2JTfOj74hH8HemynVdZxtjNeRBRBg1GuHAyqzrmpoIpcO22J\nLHxXUfAlAgMBAAECggEAEZ9rmrA1/ekoDK5+J9G5ZSPceqjOdNb+SLa1aYpeqywK\nIbcqPZvRVTww63RrBucnb3con56UhJhDT6bzDP0CfnAucfkEBkuhB9YaLAgAe2oE\nj+P/Crc5nikJvlHI6roo+ZM6UZfdY8LAsliexBc8SED3ILMT3nsbjWdN84p/9nmX\nOB7WenRiPUEbfRuXOcjmLWMq+C6WxUVYWhPRmuMaK2K6c7ZOY1YV/MVFo9zBID55\n0MEaqYsfGb/ZF13b1dMwLbuIyWXd7cYlH20i2vLE+0YVxlflgC++M2wmrJtvp+Ye\nsaXcOUwoX/AKM/giVEEmclt3PyZ7scAIZMg1OEgiAwKBgQDc9W/EagaEp+uRC481\n5y26Mbw4KdHajurlD6GSdxtJv5aI5/YUCqfXQcmKk6GINcAVwnpl2ZlUI/T/5rGN\nsE3nBnS1JHlwBWM+I9vfIDYmo9V4/Ie8G56RkuRPdtyvD9BQo9yiw8Hge3WBXzKQ\n1KWYlTHMHlnJSg7Gl+QBsHGkQwKBgQDIwAunT/173YuNvdlGWPPKuXdIY7bV6DaQ\n1LVeJ1RFMg/UJL0cQGpKmRjC1AgnPj2HgYsFvubvir7Sp/LhI19B5VdJndwnqwZH\nbj8fpxvKVXVVbNyqZjHRP3S3ABEm42AJ2ynbx5ht2ASWYPLbS/kf5Yf5GZpVSvM1\nl5l6k1BHdwKBgA2yzaYQqKzKuEj6vXsrBOO5N6EHvrHdEGT5DhxFdBSjYxLDxrbB\nXlxzAKqtsmL+ahUvRGVSEzZrMEI5LCLLnljHRq8APuMaAmgU0wnHNnQ4zgA9L7ES\nyUbfI3ZluRLFWTXWotQYbMmc/dDydPETrdyCy16LNyfKhpX7TrBoHvN/AoGAK3/5\nxnp9ye5axA8EWssBoMcJguUghD96O23sEwfgqdHMPkLru4h1v85m4CjDz4UcHhXD\nAy63qeZdrRX5ejGI/aVtgaU0RGA5zxajlP9H9VMJRsZ9Fmtolhfy+YiJLu0MLXaR\nHm+kpwCtFczSMxTGWdQJ379dgufnxZAhEL+FIMcCgYA4QqjPKMHOV5yC/xGQbfNp\nr/zJ70SHxtwYrnDgDyDnoytbVV/B+72yq7G+kWk2TLmL1p6YWbr6mR7jrIfA4SdI\n/245xqkn80AdgyFmTyA+vdM9yDK93oynj6U1HuquXIAxfa4K9fvzovRqkxu1CgDQ\na8yTwKM15Ey91rOb/aqKwA==\n-----END PRIVATE KEY-----\n",
			  "client_email": process.env.FIREBASE_client_email,
			  "client_id": process.env.FIREBASE_client_id,
			  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
			  "token_uri": "https://accounts.google.com/o/oauth2/token",
			  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
			  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-wf72k%40hukam-157906.iam.gserviceaccount.com"
			}
		}

};
