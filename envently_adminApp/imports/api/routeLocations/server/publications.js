// All links-related publications

import { Meteor } from 'meteor/meteor';
import { RouteLocations } from '../routeLocations.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.publish('routeLocations.current', (userId,sd) =>{
  if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_routeLocations']) {
    return  dynamicCollections[getSubdomain(sd)+'_routeLocations'].find({userId: userId});
  }
  return  RouteLocations.find({userId: userId});
  });

Meteor.publish('routeLocations.currentDomain', (subDomain) =>{
  console.log(subDomain, "routeLocation ")
  if (getSubdomain(subDomain) && dynamicCollections[getSubdomain(subDomain)+'_routeLocations']) {
    return  dynamicCollections[getSubdomain(subDomain)+'_routeLocations'].find({subDomain: subDomain});
  }
  return  RouteLocations.find({subDomain: subDomain});
  });
