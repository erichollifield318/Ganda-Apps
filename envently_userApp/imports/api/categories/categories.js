// Definition of the Categories collection
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
const _ = require('lodash');


export const Categories = new Mongo.Collection('categories');

if (Meteor.isServer) {
  Categories._ensureIndex({ name: 1, id: 1 });
}
