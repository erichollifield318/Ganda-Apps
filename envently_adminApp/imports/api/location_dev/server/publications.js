// All links-related publications

import { Meteor } from 'meteor/meteor';
import { LocationDev } from '../location_dev.js';
import { LocationStatus } from '/imports/api/locationsDataTable/locationStatus.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.publish('location_dev.all', (sd) =>{
  if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd) + '_location_dev']) {
    return dynamicCollections[getSubdomain(sd) + '_location_dev'].find();
  }
  return LocationDev.find();
});

  // Meteor.publish('location_dev.all', () => LocationDev.find());

Meteor.publish('location_dev.search', (search) => {

  let locationStatusList = LocationStatus.find({isApproved: false}).fetch();
  if (getSubdomain() && dynamicCollections[getSubdomain() + '_location_status']) {
    locationStatusList = dynamicCollections[getSubdomain() + '_location_status'].find({isApproved: false}).fetch();
  } else {
    locationStatusList = LocationStatus.find({isApproved: false}).fetch();
  }
  let locationIds = [];

  if (locationStatusList && locationStatusList.length) {
    let ids = _.pluck(locationStatusList, 'locationId');
    locationIds = locationIds.concat(ids);
  }
  // console.log(":: LOCATION :: NON-APPROVED LOCATIONS IDS - > ",locationIds);

  try {
    check(search, Match.OneOf(String));

    let query = {},
        projection = { limit: 100, sort:{ name: 1 } };

    if (search) {
      let regex = new RegExp(search, 'i');

      query = {
        _id: { $nin: locationIds },
        $or: [
          { name: regex }
        ],
      };
      projection.limit = 100;
    }

    if (getSubdomain() && dynamicCollections[getSubdomain() + '_location_dev']) {
      return dynamicCollections[getSubdomain() + '_location_dev'].find(query, projection);
    }
    return LocationDev.find(query, projection);
  } catch(e) {
    return;
  }
});
