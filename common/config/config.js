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
			  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDFCOP2NtTIru6L\nXPEUNHQzmYi+Wlrg8dUStapt+1DW0Mx0PfkS4u7kNxcgHz5wRVRT+VjqCxFRCnKF\n8veAiIbextvI1cEa8VPVe+X5T1tYHZ+1h73F+4kuylo2bFV0hGgTo9WHp2BUwLS7\nhds9FbMfDVXrdtGAsbuFwbXqVDHjwzt9+0WgA1fFm+4+3Rh6VS9SIFw6AFlE9eU6\nqROylcLnbyiPkM/KyGB70zPgF/bX5AHi/kwp3irtpYW5uDO8qqLO8zSAX6y3uRJA\nI7CFGzCDHdOG+O7gUpv6SQwtFZgkvB+UMvuit19ZvfFS38f/bVaWumh1zEPsRLnz\nT71TWAcFAgMBAAECggEAV+KPS9NJNfpRDHh4T7rV2e4xwDYtMwirMZ02V7gxZp/b\nkj3SS0pNpB2ugvVstEc4RfyCXGJzZuJyEq09GGfNQLESd5Jgf9QEwMRy37E13SfZ\nhO73BsgbeHNpqbzIoSAuDBSXudo+bY9HDh22nJiBPOiF2nE1IWIlcpPkwJCtcBlr\nGv5Ypej6Z5t2yCO3yt7T/afW/O38NyZRrzpfP8UMvXu/ke2kAX1PEXhYq+l45jhG\nX00VD5YdTXSmmN+YWTQDz7ZcjS9YhKhDL+iZ93ecYhQpLg+OzgWf7vFoCmduFNRF\nwULPHiOkC+o47PeoPwSyqTBoKAR7SHkI2XvQhP9wQQKBgQD+NN0sx1oI4DxTqvk+\n3w5hJSODGQEfbtSGfCC6/aV/FbLeGuTSyIqv2rSYRLlcfPYpp1J8JT4aCeiQwAfZ\ngIXQ/2nnzN2nrAjQauiJXhauwoxOhOTEleZ7qTEQczcixviYFPGd7QkqSUdMaCuK\nY+YWa7efyxoa0ztiD+Qaa2RBYwKBgQDGbMP3vZqXwOQIHswrlt/3isPHSrWVJmWr\n5uv8R1OkD1Bshn3WM/jizZzoWwkWXU0EKiA25UfRPmEAoISfzDgurYnAsJnuK8Tt\nIO7XSH4Y/1ZuJic/wBWwmc3wRdqZ1JC2h3KLhVCWc68SAfV9uWaWgC1eYbj/Xlu4\n+EHu2B52dwKBgCYw3wG5OYeX2LhhOWz+qfRiVgF+IjMMvZUu1OQC83gyVFsWA0a/\npkZhPzyZJpgElh8P6k6IcdoLnwsQLp24t2H83XZbyvlD2VcmmKT6o8HBrL6nLI90\nTdpKQvrLtH7fEb4Xd21YjUXzGGkcRV5XP9widsXlB5j8HzHOXWCyva8tAoGAKm7S\nDaXHbJJ8cVwcr2mpZaeQLItGf6nhbjyI1L9wHJKF0V+Fg4xDukTcPDhTniu/r5dO\nok6v6Ahd+CNbmUyz6w+DeOiLUoqbp1Y2nWVMSg44rn+MPy7VtJl/l9VoZSM2+0HF\n9h5BWJtOohw3InbGgILSsO9W/41vMgQtHWWsRgsCgYEA73Z3Su64wEOJAz2mTiHZ\nMQzDMLa5CDHAaRKuMql6p0ozmURPHYXycA1Ub9MapFSk8aK3U70PXr7m79vY+8RS\nCpvbLICg6wyiLoqXRnI9qFSsrpzbrCWk9PrzTy4oqjIAv2UKPm+8XdVqRWJVMnS0\ntPbhNyRb+KZRc2SZ9YuYDng=\n-----END PRIVATE KEY-----\n",
			  "client_email": process.env.FIREBASE_client_email,
			  "client_id": process.env.FIREBASE_client_id,
			  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
			  "token_uri": "https://accounts.google.com/o/oauth2/token",
			  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
			  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-wf72k%40hukam-157906.iam.gserviceaccount.com"
			}
		}

};
