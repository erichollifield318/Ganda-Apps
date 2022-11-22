// All links-related publications

import { Meteor } from 'meteor/meteor';
import { Usersdata } from './usersdata.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.publish('usersdata.userLocations', (sd) => {
	if(!Meteor.userId()){
		return [];
	}
	if(getSubdomain(sd))
	{
		return dynamicCollections[getSubdomain(sd)+'_usersdata'].find({userId:Meteor.userId(),key:"Location"})
	}
	else {
		return Usersdata.find({userId:Meteor.userId(),key:"Location"})
	}
});
