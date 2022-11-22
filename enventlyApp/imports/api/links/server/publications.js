// All links-related publications

import { Meteor } from 'meteor/meteor';
import { Links } from '../links.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.publish('links.all', () => {
  if(getSubdomain())
  {
    dynamicCollections[getSubdomain()+'_links'].find()
  }
  else {
    Links.find()
  }
  });
