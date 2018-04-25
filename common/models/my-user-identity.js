
module.exports = function(MyUserIdentity) {

MyUserIdentity.remoteMethod(
      'login',
      {
        accepts: [
              { "arg": "provider", "type": "string", required: true},
              { "arg": "authScheme", "type": "string", required: true},
              { "arg": "profile", "type": "object", required: true, http: {source: 'body'}},
              { "arg": "credentials", "type": "object", required: true, http: {source: 'body'}},
              {"arg": "options", "type": "Object",http: {source: 'body'}}
            ],
        returns: [
                  {arg: 'user', type: 'object'},
                  {arg: 'info', type: 'object'},
                  {arg: 'identity', type: 'object'},
                  {arg: 'accessToken', type: 'object'}
                ],
           http: {path: '/login', verb: 'post'}
      }

);

};
