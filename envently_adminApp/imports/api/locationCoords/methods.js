import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { LocationCoords } from './locationCoords.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.methods({
    'locationCoords.insert' (newCoords) {

        check(newCoords, Object);
        if (getSubdomain() && dynamicCollections[getSubdomain()+'_location_coords']) {

          return dynamicCollections[getSubdomain()+'_location_coords'].upsert({ location: newCoords.location }, { $set: newCoords });
        }

      	return dynamicCollections[newCoords.currentSelectedSubdomain+'_location_dev'].update({_id: newCoords.currentLocationID}, { $set: 
        	{'latitude': newCoords.newCoords.latitude,
	         'longitude': newCoords.newCoords.longitude
	       	}  });
    },
});