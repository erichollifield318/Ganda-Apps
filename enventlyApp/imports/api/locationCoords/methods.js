import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { LocationCoords } from './locationCoords.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.methods({
    'locationCoords.insert' (newCoords) {
        check(newCoords, Object);
        console.log(":: new location coords - ",newCoords);
        if(getSubdomain())
        {
          return dynamicCollections[getSubdomain()+'_location_coords'].upsert({ location: newCoords.location }, { $set: newCoords });
        }
        else {
          return LocationCoords.upsert({ location: newCoords.location }, { $set: newCoords });
        }
    },
});
