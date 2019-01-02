module.exports = {
  "local": {
    "provider": "local",
    "module": "passport-local",
    "usernameField": "username",
    "passwordField": "password",
    "authPath": "/auth/local",
    "successRedirect": "/api/MyUsers/authenticated",
    "failureRedirect": "/api/authentication/failed",
    "failureFlash": true,
    "setAccessToken" : true,
    "session" : true,
    "forceDefaultCallback" : true
  },
  "facebook-login": {
    "provider": "facebook",
    "module": "passport-facebook",
    "clientID": "330079704089458",
    "clientSecret": "1b90ff47d86375149b62c234c7ce2adf",
    "callbackURL": "/auth/facebook/callback",
    "authPath": "/auth/facebook",
    "callbackPath": "/auth/facebook/callback/",
    "successRedirect": "/api/MyUsers/authenticated",
    "failureRedirect": "/login",
    "scope": ["email", "public_profile"],
    "failureFlash": true
  },
  "google-login": {
    "provider": "google",
    "module": "passport-google-oauth",
    "strategy": "OAuth2Strategy",
    "clientID": "874807563899-9kk6gpacomg9t56pqfc4o8n4gn365ppg.apps.googleusercontent.com",
    "clientSecret": "Z_HktcSYMZMLBx8Usz0DL-pS",
    "callbackURL": "/auth/google/callback",
    "authPath": "/auth/google",
    "callbackPath": "/auth/google/callback/",
    "successRedirect": "/api/MyUsers/authenticated",
    "failureRedirect": "/api/MyUsers/authentication/failed",
    "scope": ["email", "profile"],
    "failureFlash": true
  }
};
