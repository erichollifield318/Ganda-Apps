import { Meteor } from 'meteor/meteor';
import { Advertisement } from '../advertisement.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.publish(
	'advertisement', (sd) => {
		if(getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_advertisement'])
		{
		return  dynamicCollections[getSubdomain(sd)+'_advertisement'].find()
		}
		else {
			return Advertisement.find()
		}
	},
);
