// Methods related to Menus and their contents
import { Meteor } from 'meteor/meteor';
import { MenuItemDev } from './menu_item_dev.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.methods({
  'menuItemDev.getSubMenuNames'(sd){
    try {
      if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
        return dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].aggregate( [
              { $unwind: "$items" },
          { $project: {
            _id: 0,
            names: "$items.name",
            preference: "$items.preference",
            custom_locations: "$items.custom_locations"
          }}
        ]);
      }
      return MenuItemDev.aggregate( [
        { $unwind: "$items" },
        { $project: {
          _id: 0,
          names: "$items.name",
          preference: "$items.preference",
          custom_locations: "$items.custom_locations"
        }}
      ]);
    } catch (error){console.log("error inside menuItemDev getSubMenuNames Method MenuItemDev", error); }
  },
});
