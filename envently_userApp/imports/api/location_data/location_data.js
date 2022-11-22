// Definition of the EventDev collection

import { Mongo } from 'meteor/mongo';

export const LocationData = new Mongo.Collection('location_data');

if (Meteor.isServer) {
  LocationData._ensureIndex({ _id: 1 });
}


LocationData.allow({
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
