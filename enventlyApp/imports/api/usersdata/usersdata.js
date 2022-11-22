// Definition of the links collection

import { Mongo } from 'meteor/mongo';

export const Usersdata = new Mongo.Collection('usersdata');

Usersdata.allow({
  insert(userId, doc, fields, modifier) {
    return true;
  },

  remove(id){
  	return true;
  }
});