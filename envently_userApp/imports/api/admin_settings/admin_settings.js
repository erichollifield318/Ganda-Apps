// Definition of the EventDev collection

import { Mongo } from 'meteor/mongo';

export const AdminSettings = new Mongo.Collection('admin_settings');

AdminSettings.allow({
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
