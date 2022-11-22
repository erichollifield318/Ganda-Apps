import { Mongo } from 'meteor/mongo';

export const RouteLocations = new Mongo.Collection('routeLocations');

RouteLocations.allow({
  insert(userId, doc, fields, modifier) {
    return true;
  },
  update(userId, doc, fields, modifier) {
    return true;
  },
  remove(userId, doc, fields, modifier) {
    return true;
  },
});
