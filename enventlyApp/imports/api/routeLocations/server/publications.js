// All links-related publications

import { Meteor } from 'meteor/meteor';
import { RouteLocations } from '../routeLocations.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.publish('routeLocations.current', (userId,sd) =>{
  if(getSubdomain(sd))
  {
  return  dynamicCollections[getSubdomain(sd)+'_routeLocations'].find({userId: userId})
  }
  else {
  return  RouteLocations.find({userId: userId})
  }
  });

Meteor.publish('routeLocations.currentDomain', (subDomain,sd) =>{
  if(getSubdomain(sd))
  {
  return  dynamicCollections[getSubdomain(sd)+'_routeLocations'].find({subDomain: subDomain})
  }
  else {
  return  RouteLocations.find({subDomain: subDomain})
  }
  });
