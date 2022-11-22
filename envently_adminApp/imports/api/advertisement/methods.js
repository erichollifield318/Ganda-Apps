import { Meteor } from 'meteor/meteor';
import { Advertisement } from './advertisement.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.methods({
	'Advertisement.insert'(advertisementData, sd) {
		if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_advertisement']) {
          dynamicCollections[getSubdomain(sd)+'_advertisement'].insert( advertisementData );
        } else {
          Advertisement.insert( advertisementData );
        }
	},

	'Advertisement.update'(advertisementId, setFields, sd) {
		if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_advertisement']) {
          dynamicCollections[getSubdomain(sd)+'_advertisement'].update(advertisementId, { $set: setFields } );
        } else {
          Advertisement.update( { advertisementId }, { $set: { setFields } } );
        }
	},

	'Advertisement.delete'(advertisementId, sd) {
		if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_advertisement']) {
          dynamicCollections[getSubdomain(sd)+'_advertisement'].remove( { _id: advertisementId } );
        } else {
          Advertisement.remove( { _id: advertisementId } );
        }
	},
})