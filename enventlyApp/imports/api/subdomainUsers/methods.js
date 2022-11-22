// Methods related to links

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

Meteor.methods({
  'user.insert'(usersData){
  	check(usersData, Object);
  	if (Meteor.users.find({'emails.0.address': usersData.email}).count() === 0) {
      const token = Random.secret();
      const record = {
          email: usersData.email,
          profile:{
              name:usersData.name,
              status: 'invite',
              subdomainId: usersData.subdomainId,
              subdomainName: usersData.subdomainName,
              used: false,
              token: token,
              inviteDate: new Date()
          }
      }
      let id = Accounts.createUser(record);
      Roles.addUsersToRoles(id,[usersData.role],usersData.role);

      let url = '';
      if(usersData.hostname === "localhost"){
          url = `http://${usersData.hostname}:${usersData.port}/user-invitation/${token}`;
      }else{
          url = `https://admin.envent.ly/user-invitation/${token}`;
      }
      let html = `<p>Hi ${usersData.name},</p> \n\n
      <p>This is a courtesy email from <a href='https://admin.envent.ly'>admin.envent.ly</a> to let you know that Super Admin has created an account for you.</p> \n
      <p>Click on the below link to go to the server and activate your account. </p>
      <p><a href=${url}>${url}</a></p>\n\n
      <p>Regards & Thanks,</p>
      </p><b>EnventLy</b></p>`;
      Email.send({
          to: usersData.email,
          from: "EnventLy <hello@doqumi.com>",
          subject: "Welcome to EnventLy",
          html: html
      });
      return url;
    }
    return {
      'status' : 'failed',
      'message' : 'User already exist',
    };
  },

  'user.delete'(id){
  	check(id, String);
  	return Meteor.users.remove(id);
  },

  'user.update' (userData) {
    check(userData, Object);
    Meteor.users.update(userData.id, {
      $set: {
        'profile.name':userData.name,
      },
    });
    Roles.addUsersToRoles(userData.id,[userData.role],userData.role);
    return true;
  },
  'user.setPassword'(userData){
  	check(userData, Object);
    try{
    	Accounts.setPassword(userData.id, userData.pass);
      Meteor.users.update(userData.id, {
        $set: {
          'emails[0].verified': true,
          'profile.status': "active",
          'profile.used': true,
        }
      });
      return true;
    } catch (e) {
      return false;
    }
  },

  'user.changeStatus' (userId, newStatus) {
    check (userId, String);
    check (newStatus, String);
    Meteor.users.update(userId, {
      $set: {
        'profile.status': newStatus,
      },
    });
    return true;
  },
  'user.temp'(data){
    console.log(data);
  }
});
