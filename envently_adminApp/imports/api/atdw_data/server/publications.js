// All links-related publications

import { Meteor } from 'meteor/meteor';
import { AtdwData } from '../atdw_data.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.publish(
	'atdw_data', (sd) => {
		if(getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_atdw_data'])
		{
			return  dynamicCollections[getSubdomain(sd)+'_atdw_data'].find( {}, { productName: 1} );
		}
		else {
			return AtdwData.find( {}, { productName: 1} )
		}
	},
);
