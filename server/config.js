module.exports = {
  "restApiRoot": "/api",
  "aclErrorStatus": 403,
  "remoting": {
    "json": {
      "strict": false,
      "limit": "100kb"
    },
    "urlencoded": {
      "extended": true,
      "limit": "100kb"
    },
    "rest": {
      "normalizeHttpPath": false,
      "xml": false,
      "handleErrors": true
    },
    "cors": false,
    errorHandler: {
      handler: function(err, req, res, next) {
        var log = require('debug')('server:rest:errorHandler'); // example
        log(req.method, req.originalUrl, res.statusCode, err);
        next(); // call next() to fall back to the default error handler
      }
    }
  },
  "logoutSessionsOnSensitiveChanges": true,
  "legacyExplorer": false,
  "cookieSecret": "246bace2-38cb-4138-85d9-0ae8160b07c8"
};
