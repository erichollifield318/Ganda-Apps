// Definition of the EventDev collection

import { Mongo } from 'meteor/mongo';

export const LocationDev = new Mongo.Collection('location_dev');

if (Meteor.isServer) {
  LocationDev._ensureIndex({ _id: 1, name: 1 });
}

LocationDev.allow({
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
