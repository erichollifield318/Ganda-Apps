// Methods related to categories
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Categories } from './categories.js';
import { EventDev } from '/imports/api/event_dev/event_dev';
import { MenuItemDev } from '/imports/api/menu_item_dev/menu_item_dev';
import { CacheDev } from '/imports/api/cache_dev/cache_dev';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.methods({
  'fetchCategoryDetails'(sd) {
    // if(Meteor.settings.public.isLocal)
    //   return Categories.find({}).fetch();

    let dbResult;
      if(getSubdomain(sd))
      {
        dbResult = dynamicCollections[getSubdomain(sd)+'_menu_item_dev'].aggregate( [
          { $unwind : "$items" },
          { $project: {
              _id: 0,
              categoryId: "$items.sensis_categories",
          }}
          ]);
      }
      else {
        dbResult = MenuItemDev.aggregate( [
          { $unwind : "$items" },
          { $project: {
              _id: 0,
              categoryId: "$items.sensis_categories",
          }}
          ]);
      }

    let categoryIds = _.union(_.flatten(_.pluck(dbResult, 'categoryId')));
    categoryIds.forEach((cat,i)=>categoryIds[i]=parseFloat(cat));
    console.log(":: categoryIds ----->  ",categoryIds)
    let query = {id: { $in: categoryIds }},
        projection = { sort:{ name: 1 } };
        if(getSubdomain(sd))
        {
          return dynamicCollections[getSubdomain(sd)+'_categories'].find(query, projection).fetch();
        }
        else {
          return Categories.find(query, projection).fetch();
        }
  },

  'categories.insert'(categories) {
    const name = categories.name;
    const count = categories.count;
    const id = categories.id;

    check(name, String);
    check(count, Number);
    check(id, Number);

    if(getSubdomain())
    {
      return dynamicCollections[getSubdomain()+'_categories'].insert({
        name,
        count,
        id,
        createdAt: new Date(),
      });
    }
    else {
      return Categories.insert({
        name,
        count,
        id,
        createdAt: new Date(),
      });
    }
  },

  'categories.getName'(ids,sd) {
    check(ids, Array);
      if(getSubdomain(sd))
      {
        return dynamicCollections[getSubdomain(sd)+'_categories'].find(
          { id: { $in: ids } },
          { fields:
          {
            count: 0,
            createdAt: 0,
          },
          }).fetch();
      }
      else {
        return Categories.find(
          { id: { $in: ids } },
          { fields:
          {
            count: 0,
            createdAt: 0,
          },
          }).fetch();
      }
  },

  'getMenuSubmenuName'(marker) {
    let menu = null, menuName = '', subMenuName = ''

    if(marker && marker.markerFor=='Location'){
      if(getSubdomain())
      {
        menu = dynamicCollections[getSubdomain()+'_menu_item_dev'].find({'items.custom_locations': { $in: [marker._id] }}, {fields: {'items.$': 1, name: 1}}).fetch();
      }
      else {
        menu = MenuItemDev.find({'items.custom_locations': { $in: [marker._id] }}, {fields: {'items.$': 1, name: 1}}).fetch();
      }
      // console.log(":: LOCAITON.menu  -  > ",menu);

    }else if(marker && marker.markerFor=='Event'){
      if(getSubdomain())
      {
        menu = dynamicCollections[getSubdomain()+'_menu_item_dev'].find({'items.events': { $in: [marker._id] }}, {fields: {'items.$': 1, name: 1}}).fetch();
      }
      else {
        menu = MenuItemDev.find({'items.events': { $in: [marker._id] }}, {fields: {'items.$': 1, name: 1}}).fetch();
      }
      // console.log(":: EVENT.menu  -  > ",menu);

    }else if(marker && marker.markerFor=='Category' && marker.categories && marker.categories.length){
      if(getSubdomain())
      {
        menu = dynamicCollections[getSubdomain()+'_menu_item_dev'].find({'items.sensis_categories': { $in: [ marker.categories[0].id ] }}, {fields: {'items.$': 1, name: 1}}).fetch();
      }
      else {
        menu = MenuItemDev.find({'items.sensis_categories': { $in: [ marker.categories[0].id ] }}, {fields: {'items.$': 1, name: 1}}).fetch();
      }
      // console.log(":: CATEGORY.menu  -  > ",menu);
    }

    if(menu && menu.length){
      menu.forEach((m, ind)=>{
        if(ind==0) menuName += m.name
        else menuName = menuName+', '+m.name

        m.items.forEach((i, ind2)=>{
          if(ind2==0) subMenuName += i.name
          else subMenuName = subMenuName+', '+i.name
        })
      })
    }
    return {menuName, subMenuName}
  }
});
