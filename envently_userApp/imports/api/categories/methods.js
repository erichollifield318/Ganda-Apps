// Methods related to categories
import { Meteor } from 'meteor/meteor';
import { Categories } from './categories.js';
import { MenuItemDev } from '/imports/api/menu_item_dev/menu_item_dev';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.methods({

  'getMenuSubmenuName'(marker) {
    let menu = null, menuName = {}, subMenuName = {};

    if(marker && marker.markerFor=='Location'){
      if (getSubdomain() && dynamicCollections[getSubdomain()+'_menu_item_dev']) {
        menu = dynamicCollections[getSubdomain()+'_menu_item_dev'].find({'items.custom_locations': { $in: [marker._id] }}, {fields: {'items.$': 1, name: 1}}).fetch();
      } else {
        menu = MenuItemDev.find({'items.custom_locations': { $in: [marker._id] }}, {fields: {'items.$': 1, name: 1}}).fetch();
      }
      // console.log(":: LOCAITON.menu  -  > ",menu);

    } else if (marker && marker.markerFor=='Event'){
      if (getSubdomain() && dynamicCollections[getSubdomain()+'_menu_item_dev']) {
        menu = dynamicCollections[getSubdomain()+'_menu_item_dev'].find({'items.events': { $in: [marker._id] }}, {fields: {'items.$': 1, name: 1}}).fetch();
      } else {
        menu = MenuItemDev.find({'items.events': { $in: [marker._id] }}, {fields: {'items.$': 1, name: 1}}).fetch();
      }
      // console.log(":: EVENT.menu  -  > ",menu);

    } else if (marker && marker.markerFor=='Category' && marker.categories && marker.categories.length){
      if (getSubdomain() && dynamicCollections[getSubdomain()+'_menu_item_dev']) {
        menu = dynamicCollections[getSubdomain()+'_menu_item_dev'].find({'items.sensis_categories': { $in: [ marker.categories[0].id ] }}, {fields: {'items.$': 1, name: 1}}).fetch();
      } else {
        menu = MenuItemDev.find({'items.sensis_categories': { $in: [ marker.categories[0].id ] }}, {fields: {'items.$': 1, name: 1}}).fetch();
      }
      // console.log(":: CATEGORY.menu  -  > ",menu);
    }

    if(menu && menu.length){
      menuName = menu[0].name;
      subMenuName = menu[0].items[0].name;
    }
    return {menuName, subMenuName}
  }
});
