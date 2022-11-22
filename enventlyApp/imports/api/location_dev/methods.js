// Methods related to Menus and their contents
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { LocationDev } from './location_dev.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.methods({
  'LocationDev.insert'(locationDevData, locationDevId) {
    check(locationDevData, Object);
    if(!locationDevId){
      locationDevData["createdAt"] = new Date()
      if(getSubdomain())
      {
      return dynamicCollections[getSubdomain()+'_location_dev'].insert(locationDevData);
      }
      else {
        return LocationDev.insert(locationDevData);
      }
    }
    else{
      locationDevData["updatedAt"] = new Date()

         if(getSubdomain())
         {
          dynamicCollections[getSubdomain()+'_location_dev'].update({'_id': locationDevId},
             { $set: locationDevData });
         }
         else {
           LocationDev.update({'_id': locationDevId},
              { $set: locationDevData });
         }
      return locationDevId
    }
  },

  'LocationDev.update'(locationDevId, newLocationObject) {
    check(newLocationObject, Object);
    if(getSubdomain())
    {
    return dynamicCollections[getSubdomain()+'_location_dev'].update({ '_id': locationDevId},
      { $set: newLocationObject });
    }
    else {
      return LocationDev.update({ '_id': locationDevId},
        { $set: newLocationObject });
    }
  },


});
