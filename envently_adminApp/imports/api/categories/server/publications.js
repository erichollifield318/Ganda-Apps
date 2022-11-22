// All category-related publications

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Categories } from '../categories.js';
import { MenuItemDev } from '/imports/api/menu_item_dev/menu_item_dev';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.publish('categories', () => {
  if (getSubdomain() && dynamicCollections[getSubdomain()+'_categories']) {
    return dynamicCollections[getSubdomain()+'_categories'].find();
  }
  return Categories.find();
});

Meteor.publish('categoryNames', function (Id) {
  console.log("Id", Id);

  // check(categoryId, Number);
  console.log('Categories.find()', Categories.find({}, { fields: { count: 0, createdAt: 0 } }).fetch());
  if (!this.Id) {
    return this.ready();
  }
  if (getSubdomain() && dynamicCollections[getSubdomain()+'_categories']) {
    return dynamicCollections[getSubdomain()+'_categories'].find({},
      { fields:
      {
        count: 0,
        createdAt: 0,
      },
    });
  }
  return Categories.find({},
    { fields:
    {
      count: 0,
      createdAt: 0,
    },
  });

});

Meteor.publish('categoriesSearch', (search) => {
  try{
    check(search, Match.OneOf(String));
    // getting the categoryIds added by admin
    let dbResult;
      if (getSubdomain() && dynamicCollections[getSubdomain()+'_menu_item_dev']) {
        dbResult = dynamicCollections[getSubdomain()+'_menu_item_dev'].aggregate( [
          { $unwind : "$items" },
          { $project: {
              _id: 0,
              categoryId: "$items.sensis_categories",
          }}
        ]);
      } else {
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
    let query = {id: {$in: categoryIds}},
        projection = { limit: 100, sort:{ name: 1 } };

    if (search) {
      let regex = new RegExp(search, 'i');

      query = {
        id: {$in: categoryIds},
        $or: [
          { name: regex }
        ]
      };
      projection.limit = 100;
    }
    if (getSubdomain() && dynamicCollections[getSubdomain()+'_categories']) {
      return dynamicCollections[getSubdomain()+'_categories'].find(query, projection);
    }
    return Categories.find(query, projection);
  }catch(e){
    // console.log(":: Exception: inside categoriesSearch publication - ",e.message);
    return
  }
});

Meteor.publish('adminCategoriesSearch', (search) => {
  check(search, Match.OneOf(String, null, undefined));

  let query = {},
      projection = { limit: 100, sort:{ name: 1 } };

  if (search) {
    let regex = new RegExp(search, 'i');

    query = {
      $or: [
        { name: regex }
      ],
    };
    projection.limit = 100;
  }
  if (getSubdomain() && dynamicCollections[getSubdomain()+'_categories']) {
    return dynamicCollections[getSubdomain()+'_categories'].find(query, projection);
  }
  return Categories.find(query, projection);
});
