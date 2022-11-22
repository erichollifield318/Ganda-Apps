// Methods related to links

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Usersdata } from './usersdata.js';
import { Email } from 'meteor/email';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';


Meteor.methods({
  'usersdata.insert'(payload){
  	check(payload,Object);
  	payload.createdAt = new Date();
    if(getSubdomain())
    {
      return dynamicCollections[getSubdomain()+'_usersdata'].insert(payload);
    }
    else {
      return Usersdata.insert(payload);
    }
  },

  'usersdata.remove'(id){
  	check(id,String);
    if(getSubdomain())
    {
      return dynamicCollections[getSubdomain()+'_usersdata'].remove(id);
    }
    else {
      return Usersdata.remove(id);
    }
  },

  'usersdata.getWeatherDetail'(params){
  	check(params, Object);
  	let appid = "afc499761bb4530e9ea97ddd3ffb4b32",
  		url = `http://api.openweathermap.org/data/2.5/weather?lon=${params.lon}&lat=${params.lat}&appid=${appid}&units=${ params.units || 'metric'}`,
  		callBack = HTTP.get(url);
  	return callBack.data;
  },

  'usersdata.sendFeedBack'(to, subject, message){
    check([to, subject, message], [String]);
    Email.send({
      to: to,
      from: Meteor.settings.public.adminEmail,
      subject: subject,
      text: message,
    });
  },
  'register'(data){
     return Accounts.createUser(data);
  }
});
