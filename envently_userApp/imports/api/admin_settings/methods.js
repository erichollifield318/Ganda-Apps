// Methods related to Menus and their contents
import { Meteor } from 'meteor/meteor';
// import { check, Match } from 'meteor/check';
import { AdminSettings } from './admin_settings.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.methods({
    'AdminSettings.fetchBySubdomain' (subDomain){
      if (getSubdomain(subDomain) && dynamicCollections[getSubdomain(subDomain)+'_admin_settings']) {
        return dynamicCollections[getSubdomain(subDomain)+'_admin_settings'].findOne({subDomain: subDomain});
      }
      return AdminSettings.findOne({subDomain: 'doublebay'});
    },
});

