import { Meteor } from 'meteor/meteor';
import { Enquiry } from '../enquiry.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.publish('enquiry.all', (sd) =>{
  if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_enquiry']) {
    return dynamicCollections[getSubdomain(sd)+'_enquiry'].find();
  }
  return Enquiry.find();
  });
