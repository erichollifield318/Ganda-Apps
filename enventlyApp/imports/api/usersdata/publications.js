// All links-related publications

import { Meteor } from 'meteor/meteor';
import { Usersdata } from './usersdata.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.publish('usersdata.userLocations', () => {
	if(!Meteor.userId()){
		return [];
	}
	if(getSubdomain())
	{
		return dynamicCollections[getSubdomain()+'_usersdata'].find({userId:Meteor.userId(),key:"Location"})
	}
	else {
		return Usersdata.find({userId:Meteor.userId(),key:"Location"})
	}
});
