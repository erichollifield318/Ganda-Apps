// All links-related publications

import {Meteor} from 'meteor/meteor';
import {AdminSettings} from '../admin_settings.js';
import {dynamicCollections} from '/imports/startup/both/dynamic_collections.js';
import {getSubdomain} from '/imports/startup/both/global_function.js';

Meteor.publish(
  'admin_settings.all', (sd) => {
    if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd) + '_admin_settings']) {
      return dynamicCollections[getSubdomain(sd) + '_admin_settings'].find({subDomain: sd});
    }
    return AdminSettings.find({subDomain: sd});
  });
