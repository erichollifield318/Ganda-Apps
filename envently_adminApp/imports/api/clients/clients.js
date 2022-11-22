// Definition of the Categories collection
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Clients = new Mongo.Collection('clients');

if (Meteor.isServer) {
  // Clients._ensureIndex({ name: 1, id: 1 });
}
