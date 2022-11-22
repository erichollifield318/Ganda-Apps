// All links-related publications

import { Meteor } from 'meteor/meteor';
import { MenuItemDev } from '../menu_item_dev.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';
Meteor.publish('menu_item_dev.all', (sd) => {
  if(getSubdomain(sd)){
    // console.log('gajera',dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].find({}).fetch().length)
    return dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].find({})
  }else {
    return MenuItemDev.find({})
  }
});

Meteor.publish('menu_item_dev.filtered', (clientMenus,sd) => {
  check(clientMenus, Array);
  if(getSubdomain(sd))
  {
  return  dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].find(clientMenus)
  }
  else {
  return MenuItemDev.find(clientMenus);
  }
});
