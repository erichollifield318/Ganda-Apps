// All category-related publications

import { Meteor } from 'meteor/meteor';
// import { check } from 'meteor/check';
import { Clients } from '../clients.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.publish('clients', () => {
  if (getSubdomain() && dynamicCollections[getSubdomain()+'_clients']) {
    return dynamicCollections[getSubdomain()+'_clients'].find()
  }
  return Clients.find();
});

// Meteor.publish('categoriesSearch', (search) => {
//   check(search, Match.OneOf(String, null, undefined));
//
//   let query = {},
//       projection = { limit: 100, sort:{ name: 1 } };
//
//   if (search) {
//     let regex = new RegExp(search, 'i');
//
//     query = {
//       $or: [
//         { name: regex }
//       ],
//     };
//     projection.limit = 100;
//   }
//
//   return Categories.find(query, projection);
// });
