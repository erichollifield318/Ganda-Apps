import { Meteor } from 'meteor/meteor';
import { UsageLog } from '../usage_log.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.publish('usage_log.all', (sd) =>{
  if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_usage_log']) {
    return dynamicCollections[getSubdomain(sd)+'_usage_log'].find();
  }
  return UsageLog.find();
  });
