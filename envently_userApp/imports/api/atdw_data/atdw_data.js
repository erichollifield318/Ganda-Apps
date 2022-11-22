// Definition of the EventDev collection

import { Mongo } from 'meteor/mongo';

export const AtdwData = new Mongo.Collection('atdw_data');

AtdwData.allow({
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
