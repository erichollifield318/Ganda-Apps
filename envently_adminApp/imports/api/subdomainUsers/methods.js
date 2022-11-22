// Methods related to links

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

Meteor.methods({
  'user.insert'(usersData){

    console.log("under user.insert");

  	check(usersData, Object);

    console.log("userdata ===> " , usersData.email);

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
      if(usersData.coordinates) {
        record.profile.coordinates = usersData.coordinates
      }
      console.log("going to create user ");
      let id = Accounts.createUser(record);
      console.log("id is ===> " , id);
      if (usersData.role && usersData.role != '')
        Roles.addUsersToRoles(id,[usersData.role],usersData.role);

      let url = '';
      if(usersData.hostname === "localhost"){
          url = `http://${usersData.hostname}:${usersData.port}/user-invitation/${token}`;
      }else{
          url = `https://admin.ganda.app/user-invitation/${token}`;
      }
      console.log(' => invite url => ',url)
      let html = `<p>Hi ${usersData.name},</p> \n\n
      <p>This is a courtesy email from <a href='https://admin.ganda.app'>admin.ganda.app</a> to let you know that Super Admin has created an account for you.</p> \n
      <p>Click on the below link to go to the server and activate your account. </p>
      <p><a href=${url}>${url}</a></p>\n\n
      <p>Regards & Thanks,</p>
      </p><b>Ganda</b></p>`;
      Email.send({
          to: usersData.email,
          from: Meteor.settings.public.adminEmail,
          subject: "Welcome to Ganda",
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
    // let roles = {};
    // roles[userData.role] = [userData.role];

    // console.log("going to update user");
    // console.log("data of user ===> " , userData);
    // var newpass = userData.newPassword;

    // if (newpass) {

    //   console.log("usr id ===> " , userData.id);
    //   console.log("newpassword ====> " , newpass);
    //   Accounts.setPassword(userData.id,newpass);

    //   Meteor.users.update(userData.id, {
    //     $set: {
    //       'profile.name':userData.name,
    //       'profile.coordinates':userData.coordinates
    //     },
    //   });
    //   console.log(" userData ===> ",userData)
    //   if (userData.role && userData.role != '')
    //     Roles.setUserRoles(userData.id,[userData.role],userData.role);
    //   return true;  

    // }else{
    //   Meteor.users.update(userData.id, {
    //   $set: {
    //     'profile.name':userData.name,
    //     'profile.coordinates':userData.coordinates
    //   },
    //   });
    //   console.log(" userData ===> ",userData)
    //   if (userData.role && userData.role != '')
    //     Roles.setUserRoles(userData.id,[userData.role],userData.role);
    //   return true;
    // }


      Meteor.users.update(userData.id, {
      $set: {
        'profile.name':userData.name,
        'profile.coordinates':userData.coordinates
      },
      });
      console.log(" userData ===> ",userData)
      if (userData.role && userData.role != '')
        Roles.setUserRoles(userData.id,[userData.role],userData.role);
      return true;


  },


  'user.setPassword'(userData){
  	check(userData, Object);
    try{
    	Accounts.setPassword(userData.id, userData.pass);
      Meteor.users.update(userData.id, {
        $set: {
          'emails.0.verified': true,
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
  'user.removeRole' (userData) {
    check (userData, Object);
    const roles = `roles.${userData.role}`;
    const operation = {};
    operation[roles] = '';
    console.log(operation)
    const res = Meteor.users.update(userData.userId, {
      $unset: operation
    });
    console.log('check. ',res)
  },
  'user.logoutKiosk' (userId) {
    check (userId, String);
    const isLogut = Meteor.users.update( userId, {
      $unset: {
        'services.resume' : ''
      }
    });
    if (isLogut > 0) 
      return true;
    
    return false;
  },
});
