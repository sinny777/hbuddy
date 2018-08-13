'use strict';

// to enable these logs set `DEBUG=boot:02-load-users` or `DEBUG=boot:*`
var log = require('debug')('boot:02-load-users');

module.exports = function(app) {

  // createDefaultUsers();

  loginUserTest();

  function loginUserTest(){
    log('Login User: >>>>> ');
    var MyUser = app.models.MyUser;
    MyUser.login({"email": "contact.hukam@gmail.com", "password": "1SatnamW"},
        function(err, existingUser) {
          if (err) {
            console.error('error in login', err);
          }
          console.log(existingUser);
        });
  }

  function createDefaultUsers() {

    log('Creating roles and users');

    var MyUser = app.models.MyUser;
    var Role = app.models.Role;
    var RoleMapping = app.models.RoleMapping;

    var users = [];
    var roles = [{
                    name: 'admin',
                    users: [{
                      firstName: 'Hukam',
                      lastName: 'Team',
                      email: 'contact.hukam@gmail.com',
                      username: 'hukam',
                      password: '1SatnamW',
                      provider: 'hukam'
                    }]
                  },
                  {
                    name: 'guest',
                    users: [{
                      firstName: 'hBuddy',
                      lastName: '',
                      email: 'guest.hukam@hukamtechnologies.com',
                      username: 'guest',
                      password: 'guest',
                      provider: 'hukam'
                    }]
                  }];

    roles.forEach(function(role) {
      Role.findOrCreate(
        {where: {name: role.name}}, // find
        {name: role.name}, // create
        function(err, createdRole, created) {
          if (err) {
            console.error('error running findOrCreate('+role.name+')', err);
            return false;
          }

          console.log('created: >>>>> ', created);
          console.log('createdRole: >>>>> ', createdRole)
          if(createdRole){
        	  (created) ? log('created role', createdRole.name)
                      : log('found role', createdRole.name);
          }

          role.users.forEach(function(roleUser) {
        	MyUser.findOrCreate(
              {where: {username: roleUser.username}}, // find
              roleUser, // create
              function(err, createdUser, created) {
                if (err) {
                  console.error('error creating roleUser', err);
                }
                (created) ? log('created user', createdUser.username)
                          : log('found user', createdUser.username);
                createdRole.principals.create({
                  principalType: RoleMapping.USER,
                  principalId: createdUser.id
                }, function(err, rolePrincipal) {
                  if (err) {
                    console.error('error creating rolePrincipal', err);
                  }
                  users.push(createdUser);
                });
              });
          });
        });
    });

    //Add normal user with no specific role
    var testUser = {
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test.user@abc.com',
                    username: 'test',
                    password: 'test',
                    provider: 'hukam'
                  };
    MyUser.findOrCreate(
        {where: {username: testUser.username}}, // find
        testUser, // create
        function(err, createdUser, created) {
          if (err) {
            console.error('error creating roleUser', err);
          }
          (created) ? log('created user', createdUser.username)
                    : log('found user', createdUser.username);
          users.push(createdUser);
        });


    return users;
  }

};
