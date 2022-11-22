
import { Images   } from '../lib/common/image.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';


 Meteor.publish('image_pub', function imagePublication() {
  if(getSubdomain())
  {
    return dynamicCollections[getSubdomain()+'_images'].find()
  }
  else {
    return Images.find();
  }
});
