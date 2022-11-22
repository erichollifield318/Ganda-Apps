// Definition of the EventDev collection

import { Mongo } from 'meteor/mongo';

export const Enquiry = new Mongo.Collection('enquiry');

Enquiry.allow({
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
