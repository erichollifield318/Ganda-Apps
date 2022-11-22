// All links-related publications

import { Meteor } from 'meteor/meteor';
import { CustomLocation } from '../custom_location.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.publish('custom_location.all', () => {
  if(getSubdomain())
  {
    dynamicCollections[getSubdomain()+'_custom_location'].find()
  }
  else {
    CustomLocation.find()
  }
  });
