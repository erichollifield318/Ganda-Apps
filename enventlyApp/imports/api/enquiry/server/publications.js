import { Meteor } from 'meteor/meteor';
import { Enquiry } from '../enquiry.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.publish('enquiry.all', () =>{
  if(getSubdomain())
  {
    dynamicCollections[getSubdomain()+'_enquiry'].find()
  }
  else {
    Enquiry.find()
  }
  });
