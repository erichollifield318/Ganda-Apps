// All links-related publications

import { Meteor } from 'meteor/meteor';
import { LocationData } from '../location_data.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.publish('location_data.all', () => {
  if (getSubdomain() && dynamicCollections[getSubdomain()+'_location_data']) {
    return dynamicCollections[getSubdomain()+'_location_data'].find();
  }
  return LocationData.find();
});
