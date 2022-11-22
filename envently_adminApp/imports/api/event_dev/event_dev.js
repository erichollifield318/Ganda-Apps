// Definition of the EventDev collection

import { Mongo } from 'meteor/mongo';

export const EventDev = new Mongo.Collection('event_dev');


EventDev.allow({
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
