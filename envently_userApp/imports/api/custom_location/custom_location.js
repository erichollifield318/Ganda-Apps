// Definition of the EventDev collection

import { Mongo } from 'meteor/mongo';
export const CustomLocation = new Mongo.Collection('custom_location');


CustomLocation.allow({
  insert(userId, doc, fields, modifier) {
    return true;
  },
  update(userId, doc, fields, modifier) {
    return true;
  },
  remove(userId, doc, fields, modifier) {
    return true;
  },
});
