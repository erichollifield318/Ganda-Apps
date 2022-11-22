// Definition of the EventDev collection

import { Mongo } from 'meteor/mongo';

export const UsageLog = new Mongo.Collection('usage_log');

if (Meteor.isServer) {
  UsageLog._ensureIndex({ _id: 1 });
}


UsageLog.allow({
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
