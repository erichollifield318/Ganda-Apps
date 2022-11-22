// Methods related to Menus and their contents
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { LocationData } from './location_data.js';
import { CustomLocation } from '/imports/api/custom_location/custom_location.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.methods({
  'LocationData.insert'(newLocation, sessisID, locationRefId) {
    check(newLocation, Object);
    newLocation["createdAt"] = new Date()
    let id = undefined;
    let ref = undefined;
    if(!sessisID){
      ref = 'custom_location'
      if(!locationRefId){
        if(getSubdomain())
        {
        id = dynamicCollections[getSubdomain()+'_custom_location'].insert(newLocation);
        }
        else {
          id =  CustomLocation.insert(newLocation);
        }
      }
      else{
        id=locationRefId;
      }
    }else{
      ref = 'location_data'
      if(!locationRefId){
        newLocation['sessisID'] = sessisID;

        if(getSubdomain())
        {
          id = dynamicCollections[getSubdomain()+'_location_data'].insert(newLocation);
        }
        else {
            id =  LocationData.insert(newLocation);
        }
      }else{
        id=locationRefId;
      }
    }
    return {
      id,
      ref
    }
  },

  'LocationData.update'(locationRefId, newLocationObject, location_ref) {
    check(newLocationObject, Object);
    if(location_ref=='custom_location'){

          if(getSubdomain())
          {
          return dynamicCollections[getSubdomain()+'_custom_location'].update({ '_id': locationRefId},
              { $set: newLocationObject });
          }
          else {
            return CustomLocation.update({ '_id': locationRefId},
                { $set: newLocationObject });
          }
    }else if(location_ref=='location_data'){
      return LocationData.update({ '_id': locationRefId},
      { $set: newLocationObject });
      if(getSubdomain())
      {
        return dynamicCollections[getSubdomain()+'_location_data'].update({ '_id': locationRefId},
        { $set: newLocationObject });
      }
      else {
        return LocationData.update({ '_id': locationRefId},
        { $set: newLocationObject });
      }
    }
  }

});
