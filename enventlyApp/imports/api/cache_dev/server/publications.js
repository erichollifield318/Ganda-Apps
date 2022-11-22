// All links-related publications

import { Meteor } from 'meteor/meteor';
import { CacheDev } from '../cache_dev.js';
import { LocationStatus } from '/imports/api/locationsDataTable/locationStatus.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.publish('cache_dev.all', () => {
  if(getSubdomain())
  {
    dynamicCollections[getSubdomain()+'_cache_dev'].find()
  }
  else {
    CacheDev.find()
  }
  });

Meteor.publish('cache_dev.search', (search) => {
  /*We are creating array of not approved locationIds*/
  let locationStatusList = [];
  if(getSubdomain())
  {
    locationStatusList = dynamicCollections[getSubdomain()+'_location_status'].find({ isApproved: false }).fetch();
  }
  else {
    locationStatusList = LocationStatus.find({ isApproved: false }).fetch();
  }
  let locationIds = [];

  if(locationStatusList && locationStatusList.length){
    let ids = _.pluck(locationStatusList, 'locationId');
    locationIds = locationIds.concat(ids);
  }
  // console.log(":: CACHE :: NON-APPROVED LOCATIONS IDS - > ",locationIds);
  try{
    check(search, Match.OneOf(String));

    let query = {},
        projection = { limit: 100, sort:{ name: 1 } };

    if (search) {
      let regex = new RegExp(search, 'i');

      query = {
        _id: { $nin: locationIds },
        aboutId: { $nin: locationIds },
        $or: [
          { name: regex }
        ]
      };
      projection.limit = 100;
    }
    if(getSubdomain())
    {
      dynamicCollections[getSubdomain()+'_cache_dev'].find(query, projection);
    }
    else {
      return CacheDev.find(query, projection);
    }

  }catch(e){
    // console.log(":: Exception: inside cache_dev.search publication - ",e.message);
    return
  }
});
