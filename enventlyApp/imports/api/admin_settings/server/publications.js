// All links-related publications

import { Meteor } from 'meteor/meteor';
import { AdminSettings } from '../admin_settings.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.publish('admin_settings.all', (sd) => {
  if(getSubdomain(sd))
  {
  return  dynamicCollections[getSubdomain(sd)+'_admin_settings'].find()
  }
  else {
    return AdminSettings.find()
  }
  });
