// Methods related to Menus and their contents
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { MenuItemDev } from './menu_item_dev.js';
import { LocationDev } from '/imports/api/location_dev/location_dev.js';
import { LocationData } from '/imports/api/location_data/location_data.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.methods({
    'menuItemDev.insert' (fields,sd) {
        check(fields.name, Object);
        console.log(fields.name);
        var date = new Date();
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          return dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].insert({
              name: fields.name,
              isEvent: fields.isEvent,
              preference: {
                  icon: fields.icon,
                  color: fields.color
              },
              items: [],
              createdAt: date,
              customIndex : date.getTime(),
              defaultLangForMenu:fields.defaultLangForMenu,
          });
        }
        return  MenuItemDev.insert({
            name: fields.name,
            isEvent: fields.isEvent,
            preference: {
                icon: fields.icon,
                color: fields.color
            },
            items: [],
            createdAt: date,
            customIndex : date.getTime(),
            defaultLangForMenu:fields.defaultLangForMenu,
        });
    },


    'menuItemDev.remove' (deleteObject,sd) {
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].update({ _id: deleteObject.menuId }, { $pull: { items: { defaultLangforSubmenu: deleteObject.defaultLangforSubmenu } } }, { multi: true });
        } else {
          MenuItemDev.update({ _id: deleteObject.menuId }, { $pull: { items: { name: deleteObject.name.en } } }, { multi: true });
        }
    },

    'menuItemDev.addCategory' (updateObject,sd) {
        check(updateObject, Object);

        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          return dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].update({ _id: updateObject.menuKey, "items._id": updateObject._id }, { $addToSet: { 'items.$.sensis_categories': updateObject.sensisId } },
              false,
              true
          );
        }
        return MenuItemDev.update({ _id: updateObject.menuKey, "items._id": updateObject._id }, { $addToSet: { 'items.$.sensis_categories': updateObject.sensisId } },
            false,
            true
        );
    },

    'menuItemDev.addEvent' (updateObject,sd) {
        check(updateObject, Object);

        let record = [];
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          record = dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].find({
              _id: updateObject.menuKey,
              "items._id": updateObject._id,
              'items.events': { $in: [updateObject.eventId] }
          }).fetch();
        } else {
          record = MenuItemDev.find({
              _id: updateObject.menuKey,
              "items._id": updateObject._id,
              'items.events': { $in: [updateObject.eventId] }
          }).fetch();
        }
        if (record.length) {
            return "already Exists";
        }

        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          return dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].update({ _id: updateObject.menuKey, "items._id": updateObject._id }, { $addToSet: { 'items.$.events': updateObject.eventId } },
            false,
            true
          );
        }
        return MenuItemDev.update({ _id: updateObject.menuKey, "items._id": updateObject._id }, { $addToSet: { 'items.$.events': updateObject.eventId } },
          false,
          true
        );
    },


    'menuItemDev.addLocation' (updateObject,sd) {
        check(updateObject, Object);
        let parentMenu = [];
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          parentMenu =  dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].find({ _id: updateObject.menuKey, "items._id": updateObject._id, 'items.custom_locations': { $in: [updateObject.location_dev_id] } }).fetch();
        } else {
          parentMenu = MenuItemDev.find({ _id: updateObject.menuKey, "items._id": updateObject._id, 'items.custom_locations': { $in: [updateObject.location_dev_id] } }).fetch();
        }
        if (parentMenu.length) {
            return "already Exists";
        }

        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          return dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].update({ _id: updateObject.menuKey, "items._id": updateObject._id }, { $addToSet: { 'items.$.sensis_locations': updateObject.location_data_id, 'items.$.custom_locations': updateObject.location_dev_id } },
              false,
              true
          );
        }
        return MenuItemDev.update({ _id: updateObject.menuKey, "items._id": updateObject._id }, { $addToSet: { 'items.$.sensis_locations': updateObject.location_data_id, 'items.$.custom_locations': updateObject.location_dev_id } },
          false,
          true
        );
    },

    'menuItemDev.updateLocation' (updateObject,sd) {
        check(updateObject, Object);
        const {subMenuId, locationId} = updateObject;

        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].update({'items._id': subMenuId}, {$addToSet: {'items.$.custom_locations': locationId}});
        } else {
          MenuItemDev.update({'items._id': subMenuId}, {$addToSet: {'items.$.custom_locations': locationId}});
        }
    },


    'menuItemDev.removeCategory' (dataObject,sd) {
        check(dataObject, Object);
        let parentMenu = [];
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          parentMenu = dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].find({ 'items._id': dataObject.thisItemId }, {
              fields: { 'items.$': 1 },
          }).fetch();
        } else {
          parentMenu = MenuItemDev.find({ 'items._id': dataObject.thisItemId }, {
              fields: { 'items.$': 1 },
          }).fetch();
        }
        const categoriesArray = parentMenu[0].items[0].sensis_categories;
        const indx = categoriesArray.indexOf(dataObject.categoryId);
        categoriesArray.splice(indx, 1);

        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].update({ 'items._id': dataObject.thisItemId }, { $set: { 'items.$.sensis_categories': categoriesArray } });
        } else {
          MenuItemDev.update({ 'items._id': dataObject.thisItemId }, { $set: { 'items.$.sensis_categories': categoriesArray } });

        }
    },


    'menuItemDev.removeEvent' (dataObject,sd) {
        check(dataObject, Object);
        let parentMenu = [];
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          parentMenu =  dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].find({ 'items._id': dataObject.thisItemId }, {
              fields: { 'items.$': 1 },
          }).fetch();
        } else {
          parentMenu = MenuItemDev.find({ 'items._id': dataObject.thisItemId }, {
              fields: { 'items.$': 1 },
          }).fetch();
        }
        const eventsArray = parentMenu[0].items[0].events;
        const indx = eventsArray.indexOf(dataObject.eventId);
        eventsArray.splice(indx, 1);

        if(getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].update({ 'items._id': dataObject.thisItemId }, { $set: { 'items.$.events': eventsArray } });
        } else {
          MenuItemDev.update({ 'items._id': dataObject.thisItemId }, { $set: { 'items.$.events': eventsArray } });

        }
    },

    'menuItemDev.removeLocation' (dataObject,sd) {
        //requirement
        // search customLocationId as a _id in location_dev and get location_ref_id
        //and remove this record
        // now remove location_ref_id as _id in location_data
        // do below to remove customlocationid from MenuItemDev
        // and do same for removing sensislocation from MenuItemDEv
        check(dataObject, Object);
        let locationDev = {};
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_location_dev']) {
          locationDev = dynamicCollections[getSubdomain(sd)+'_location_dev'].findOne({ '_id': dataObject.customLocationId }, { fields: { 'location_ref_id': 1 } });
        } else {
          locationDev = LocationDev.findOne({ '_id': dataObject.customLocationId }, { fields: { 'location_ref_id': 1 } });
        }
        const locationRefId = locationDev && locationDev.location_ref_id ? locationDev.location_ref_id : undefined;
        // LocationDev.remove({'_id':dataObject.customLocationId})
        // LocationData.remove({'_id':locationRefId})
        let parentMenu =[];
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          parentMenu =  dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].find({ 'items._id': dataObject.thisItemId }, {
              fields: { 'items.$': 1 },
          }).fetch();
        } else {
          parentMenu = MenuItemDev.find({ 'items._id': dataObject.thisItemId }, {
              fields: { 'items.$': 1 },
          }).fetch();
        }
        const customLocationsArray = parentMenu[0].items[0].custom_locations;
        let indx = customLocationsArray.indexOf(dataObject.customLocationId);
        customLocationsArray.splice(indx, 1);

        const sensisLocationsArray = parentMenu[0].items[0].sensis_locations;
        indx = sensisLocationsArray.indexOf(locationRefId);
        sensisLocationsArray.splice(indx, 1);
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].update({ 'items._id': dataObject.thisItemId }, { $set: { 'items.$.custom_locations': customLocationsArray, 'items.$.sensis_locations': sensisLocationsArray } });
        } else {
          MenuItemDev.update({ 'items._id': dataObject.thisItemId }, { $set: { 'items.$.custom_locations': customLocationsArray, 'items.$.sensis_locations': sensisLocationsArray } });
        }

        let remainingMenuItem = [];
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          remainingMenuItem = dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].find({ 'items.custom_locations': dataObject.customLocationId }).fetch();
        } else {
          remainingMenuItem = MenuItemDev.find({ 'items.custom_locations': dataObject.customLocationId }).fetch();
        }
        if (!remainingMenuItem.length) {
          if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_location_dev']) {
            dynamicCollections[getSubdomain(sd)+'_location_dev'].remove({'_id': dataObject.customLocationId});
          } else {
            LocationDev.remove({'_id': dataObject.customLocationId});

          }
        }
    },

    'menuItemDev.newMenuItem' (updateObject,sd) {
        try {
            check(updateObject, Object);
            var date = new Date();
            updateObject["customIndex"] = date.getTime();
            // get parent document
            let parentMenu = [];
            if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
              parentMenu = dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].find({ _id: updateObject.menuKey }, { items: { $elemMatch: { "name": updateObject.name } } }, { items: 1 }).fetch();
            } else {
              parentMenu = MenuItemDev.find({ _id: updateObject.menuKey }, { items: { $elemMatch: { "name": updateObject.name } } }, { items: 1 }).fetch();
            }
            // Check if already on menu
            let checkIfAlreadyOnDb = parentMenu[0].items.map((eachItem) => {
                if (eachItem.name === updateObject.name) {
                    return 'alreadyOnCollection';
                }
            });
            // remove falsy values
            checkIfAlreadyOnDb = _.compact(checkIfAlreadyOnDb);
            // if already in menu throw error, else insert.
            if (checkIfAlreadyOnDb[0] === 'alreadyOnCollection') {
                throw new Meteor.Error('Unauthorized', 'Already on menu');
            } else {
                if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
                  return  dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].update({ _id: updateObject.menuKey }, {
                      $push: { items: updateObject }
                  });
                }
                return MenuItemDev.update({ _id: updateObject.menuKey }, {
                    $push: { items: updateObject }
                });
            }
        } catch (e) {
            if (e) {
                throw new Meteor.Error('Failed update ', 'menuItemDev.newMenuItem');
            }
        }
    },

    'menuItemDev.publishMenuItems' (menuId,sd) {
        let parentMenu = [];
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          parentMenu = dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].find({ '_id': menuId }, {
              fields: { 'items._id': 1 },
          }).fetch();
        } else {
          parentMenu = MenuItemDev.find({ '_id': menuId }, {
              fields: { 'items._id': 1 },
          }).fetch();
        }
        var items = parentMenu[0].items;
        var itemsIds = _.pluck(items, '_id');

        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          return dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].update({ '_id': menuId }, { $addToSet: { 'publishDetails': { timeStamp: new Date(), itemsIds: itemsIds } }, $set: { updatedAt: new Date() } },
              false,
              true
          );
        }
        return MenuItemDev.update({ '_id': menuId }, { $addToSet: { 'publishDetails': { timeStamp: new Date(), itemsIds: itemsIds } }, $set: { updatedAt: new Date() } },
            false,
            true
        );
    },

    'menuItemDev.getMenuItemInfo'(itemId,sd){
        let menuItem = [];
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          menuItem = dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].find({ 'items._id': itemId }, {
              fields: { 'items.$': 1 },
          }).fetch();
        } else {
          menuItem = MenuItemDev.find({ 'items._id': itemId }, {
              fields: { 'items.$': 1 },
          }).fetch();
        }
        return menuItem && menuItem.length>0 && menuItem[0].items && menuItem[0].items.length>0 ? menuItem[0].items[0] : undefined;
    },

    'menuItemDev.updateMenuItem'(itemId, setFields,sd){
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          return dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].update({ 'items._id': itemId }, { $set: setFields });
        }
        return MenuItemDev.update({ 'items._id': itemId }, { $set: setFields });
    },

    'menuItemDev.moveItemToSelectedMenu'(selectedMenuId , menuItemId, menuId, itemInfo,sd){
        if(menuId!=selectedMenuId){
            if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
              dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].update({ _id: menuId }, { $pull: { items: { _id: menuItemId } } });
            } else {
              MenuItemDev.update({ _id: menuId }, { $pull: { items: { _id: menuItemId } } });
            }
            itemInfo["customIndex"] = getHighestCustomIndex(selectedMenuId, itemInfo,sd)
            if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
              dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].update({ _id: selectedMenuId }, { $push: { items: itemInfo } });
            } else {
              MenuItemDev.update({ _id: selectedMenuId }, { $push: { items: itemInfo } });
            }
        }
    },

    'menuItemDev.updateCustomIndex' (oldIndex, newIndex, menuId,sd) {
        let menus = [];
        if (oldIndex < newIndex) {
            if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
              menus = dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].find({}, { skip: newIndex, limit: 2, fields: { name: 1, customIndex: 1 }, sort: { customIndex: 1 } }).fetch()
            } else {
              menus = MenuItemDev.find({}, { skip: newIndex, limit: 2, fields: { name: 1, customIndex: 1 }, sort: { customIndex: 1 } }).fetch()
            }
        } else if (oldIndex > newIndex) {
            let skipValue = newIndex == 0 ? 0 : newIndex - 1;
            let limitValue = newIndex == 0 ? 1 : 2;
            if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
              menus = dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].find({}, { skip: skipValue, limit: limitValue, fields: { name: 1, customIndex: 1 }, sort: { customIndex: 1 } }).fetch()
            } else {
              menus = MenuItemDev.find({}, { skip: skipValue, limit: limitValue, fields: { name: 1, customIndex: 1 }, sort: { customIndex: 1 } }).fetch()
            }
        }
        let avg = getAverageValue(menus, oldIndex, newIndex);
        if(avg>0){
          if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
            return dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].update({ '_id': menuId }, { $set: { customIndex: avg } });
          }
          return MenuItemDev.update({ '_id': menuId }, { $set: { customIndex: avg } });
        }
        return false;  //means not updated
    },

    'menuItemDev.updateSubMenuCustomIndex' (oldIndex, newIndex, menuId, subMenuItemId,sd) {
        let menuItems = MenuItemDev.find({ _id: menuId }, {fields:{"items.customIndex": 1, "items.name": 1}}).fetch();
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          menuItems = dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].find({ _id: menuId }, {fields:{"items.customIndex": 1, "items.name": 1}}).fetch();
        } else {
          menuItems = MenuItemDev.find({ _id: menuId }, {fields:{"items.customIndex": 1, "items.name": 1}}).fetch();
        }
        let selectedMenuItems = _.sortBy(menuItems[0].items, 'customIndex');
        let requiredItems = [];
        if (oldIndex < newIndex) {
            requiredItems = _.take(_.drop(selectedMenuItems, newIndex), 2);
        }else if (oldIndex > newIndex) {
            let skipValue = newIndex == 0 ? 0 : newIndex - 1;
            let limitValue = newIndex == 0 ? 1 : 2;
            requiredItems = _.take(_.drop(selectedMenuItems, skipValue), limitValue);
        }
        if(requiredItems.length){
            let avg = getAverageValue(requiredItems, oldIndex, newIndex);
            if(avg>0){
                if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
                  return dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].update({ _id: menuId, "items._id": subMenuItemId }, { $set: { 'items.$.customIndex': avg }});
                }
                return MenuItemDev.update({ _id: menuId, "items._id": subMenuItemId }, { $set: { 'items.$.customIndex': avg }});
            }
            return false;  //means not updated
        }
        return false;
    },

    'menuItemDev.upsertCustomIndex'(sd){
        let menus = [];
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          menus = dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].find({ 'customIndex': {$exists:false} }, {fields: { 'createdAt': 1 }}).fetch();
        } else {
          menus = MenuItemDev.find({ 'customIndex': {$exists:false} }, {fields: { 'createdAt': 1 }}).fetch();
        }
        _.each(menus, function(menu){
            let createdAt = menu.createdAt;
            let date = new Date(createdAt);
            let msTime = Math.round(date.getTime());
            if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
              dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].update({ '_id': menu._id }, { $set: { customIndex: msTime } });
            } else {
              MenuItemDev.update({ '_id': menu._id }, { $set: { customIndex: msTime } });
            }
        });
    },

    'menuItemDev.upsertCustomIndexInSubMenuItems'(sd){
        let menus = [];
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
          menus =  dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].find({ 'items.customIndex': {$exists:false} }, {fields: { 'items': 1 }}).fetch();
        } else {
          menus = MenuItemDev.find({ 'items.customIndex': {$exists:false} }, {fields: { 'items': 1 }}).fetch();
        }
         _.each(menus, function(menu){
            let items = menu.items
                var date = new Date("January 1, 1971");
                var time = date.getTime()
             _.each(items, function(item){
                if(!item.customIndex){
                    time = time + 11000;
                    if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
                      dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].update({ _id: menu._id, "items._id": item._id }, { $set: { 'items.$.customIndex': time }});
                    } else {
                      MenuItemDev.update({ _id: menu._id, "items._id": item._id }, { $set: { 'items.$.customIndex': time }});
                    }
                }
            });
        });
    },

   
});

function getAverageValue(menus, oldIndex, newIndex){
    let total = 0;
    for (var i = 0; i < menus.length; i++) {
        total+=menus[i].customIndex;
    }
    if(menus.length==1){
        if(oldIndex < newIndex){
            total+=1000;
        }else if(oldIndex > newIndex){
            total-=1000;
        }
        return total;
    }
    return Math.round(total/2);
}

function getHighestCustomIndex(selectedMenuId, itemInfo,sd){
    var highestCustomIndexItem;
    if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_menu_item_dev']) {
      highestCustomIndexItem =  dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].aggregate([
        {
          $match: {
            _id: selectedMenuId
          }
        },{
          $unwind : "$items"
        },{
          $sort : {
            "items.customIndex":-1
          }
        },{
          $limit :1
        }
      ]);
    } else {
      highestCustomIndexItem = MenuItemDev.aggregate([
        {
          $match: {
            _id: selectedMenuId
          }
        },{
          $unwind : "$items"
        },{
          $sort : {
            "items.customIndex":-1
          }
        },{
          $limit :1
        }
      ])
    }
    if(highestCustomIndexItem && highestCustomIndexItem.length && highestCustomIndexItem[0].items && highestCustomIndexItem[0].items.customIndex){
        return highestCustomIndexItem[0].items.customIndex + 1000;
    }else{
        var date = new Date();
        return date.getTime();
    }
}
