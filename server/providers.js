module.exports = {
  "local": {
    "provider": "local",
    "module": "passport-local",
    "usernameField": "username",
    "passwordField": "password",
    "authPath": "/api/MyUsers/basic",
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
    "clientID": process.env.FACEBOOK_LOGIN_CLIENT_ID,
    "clientSecret": process.env.FACEBOOK_LOGIN_CLIENT_SECRET,
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
    "clientID": process.env.GOOGLE_LOGIN_CLIENT_ID,
    "clientSecret": process.env.GOOGLE_LOGIN_CLIENT_SECRET,
    "callbackURL": "/auth/google/callback",
    "authPath": "/auth/google",
    "callbackPath": "/auth/google/callback/",
    "successRedirect": "/api/MyUsers/authenticated",
    "failureRedirect": "/api/MyUsers/authentication/failed",
    "scope": ["email", "profile"],
    "failureFlash": true
  }
};
