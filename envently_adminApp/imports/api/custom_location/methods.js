// Methods related to Menus and their contents
import { Meteor } from 'meteor/meteor';
// import { check, Match } from 'meteor/check';
import { CustomLocation } from './custom_location.js';
import { LocationDev } from '/imports/api/location_dev/location_dev.js';
import { LocationData } from '/imports/api/location_data/location_data.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.methods({
  'custom_location.findLocationDev'(locationName) {
    Logger.log({action: `${Meteor.settings.public.userAppActions.localQuery}`, context: `${JSON.stringify({name:locationName})}`});
    var locationInfo;
    if (getSubdomain() && dynamicCollections[getSubdomain()+'_location_dev']) {
     locationInfo =  dynamicCollections[getSubdomain()+'_location_dev'].findOne({name:locationName}, {sort:{_id:-1}});
    } else {
       locationInfo = LocationDev.findOne({name:locationName}, {sort:{_id:-1}});
    }
    Logger.log({action: `${Meteor.settings.public.userAppActions.localResult}`, context: `${LocationDev.find({name:locationName}).fetch().length}`});
    return locationInfo;
  },

  'custom_location.findLocationCustom'(location_ref_id, collectionName){
    if(collectionName=='custom_location'){
      if (getSubdomain() && dynamicCollections[getSubdomain()+'_custom_location']) {
        return dynamicCollections[getSubdomain()+'_custom_location'].findOne({_id:location_ref_id});
      }
      return CustomLocation.findOne({_id:location_ref_id});
    }else if(collectionName=='location_data'){
      if(getSubdomain() && dynamicCollections[getSubdomain()+'_location_data']) {
        return dynamicCollections[getSubdomain()+'_location_data'].findOne({_id:location_ref_id});
      }
      return LocationData.findOne({_id:location_ref_id});
    }
    return;
  }
});
