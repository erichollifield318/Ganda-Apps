// All links-related publications

import { Meteor } from 'meteor/meteor';
import { MenuItemDev } from '../menu_item_dev.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.publish('menu_item_dev.all', (sd) => {
  if (getSubdomain(sd) && dynamicCollections[ getSubdomain(sd) + '_menu_item_dev'] ) {
    return dynamicCollections[ getSubdomain(sd) + '_menu_item_dev' ].find({});
  }
  return MenuItemDev.find({});
});

