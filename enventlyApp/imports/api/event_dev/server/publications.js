// All links-related publications

import { Meteor } from 'meteor/meteor';
import { EventDev } from '../event_dev.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.publish('event_dev.all', (sd) => {
  if(getSubdomain(sd))
  {
    dynamicCollections[getSubdomain(sd)+'_event_dev'].find()
  }
  else {
    EventDev.find()
  }
  });

Meteor.publish('event_dev.filtered', (clientMenus) => {
  check(clientMenus, Array);
  if(getSubdomain())
  {
    return dynamicCollections[getSubdomain()+'_event_dev'].find(clientMenus)
  }
  else {
    return EventDev.find(clientMenus);
  }
});

Meteor.publish('event_dev.search', (search) => {
  try{
    check(search, Match.OneOf(String));

    let query = {},
        projection = { limit: 100, sort:{ name: 1 } };

    if (search) {
      let regex = new RegExp(search, 'i');

      query = {
        $or: [
          { name: regex }
        ],
      };
      projection.limit = 100;
    }
    if(getSubdomain())
    {
      return dynamicCollections[getSubdomain()+'_event_dev'].find(query, projection)
    }
    else {
      return EventDev.find(query, projection);
    }
  }catch(e){
    // console.log(":: Exception: inside event_dev.search publication - ",e.message);
    return
  }
});
