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

});
