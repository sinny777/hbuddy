/*
 * OFFICE CLIENT CONFIGURATION
 */

// API_URL: 'http://hbuddy.hukam.in/api'
// API_URL: 'http://localhost:3000/api'

define(['angular'], function (angular) {
	'use strict';

	return angular.module('app.config', [])
		.constant('CONFIG', {
			VERSION: '0.1',
			ENVIRONMENT: 'OFFICE',
			API_URL: '//hukam-web.mybluemix.net/api'
		});

});
