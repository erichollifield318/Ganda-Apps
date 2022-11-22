// Methods related to Menus and their contents
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { LocationDev } from './location_dev.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.methods({
  'LocationDev.insert'(locationDevData, locationDevId, subdomain) {
    check(locationDevData, Object);
    if(!locationDevId){
      locationDevData["createdAt"] = new Date()
      if(getSubdomain(subdomain) && dynamicCollections[getSubdomain(subdomain)+'_location_dev']) {
        return dynamicCollections[getSubdomain(subdomain)+'_location_dev'].insert(locationDevData);
      }
      return LocationDev.insert(locationDevData);
    }
    else{
      locationDevData["updatedAt"] = new Date()

         if( getSubdomain() && dynamicCollections[getSubdomain()+'_location_dev']) {
          dynamicCollections[getSubdomain()+'_location_dev'].update({'_id': locationDevId},
             { $set: locationDevData });
         } else {
           LocationDev.update({'_id': locationDevId},
              { $set: locationDevData });
         }
      return locationDevId
    }
  },

  'LocationDev.update'(locationDevId, newLocationObject, subdomain) {
    check(newLocationObject, Object);
    if (getSubdomain(subdomain) && dynamicCollections[getSubdomain(subdomain)+'_location_dev']) {
      return dynamicCollections[getSubdomain(subdomain)+'_location_dev'].update({ '_id': locationDevId},
      { $set: newLocationObject });
    }
    return LocationDev.update({ '_id': locationDevId},
        { $set: newLocationObject });
  },


});
