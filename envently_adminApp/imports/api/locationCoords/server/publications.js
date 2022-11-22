// All links-related publications

import { Meteor } from 'meteor/meteor';
import { LocationCoords } from '../locationCoords.js';

/*Meteor.publish('cache_dev.all', () => CacheDev.find());


Meteor.publish('cache_dev.search', (search) => {
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

    return CacheDev.find(query, projection);
  }catch(e){
    // console.log(":: Exception: inside cache_dev.search publication - ",e.message);
    return
  }
});
*/
