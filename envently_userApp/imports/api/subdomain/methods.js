// Methods related to Menus and their contents
import { Meteor } from 'meteor/meteor';

import { Subdomain } from './subdomain.js';

Meteor.methods({
	
	'checkSubdomainExist' (subdomain){
		if(Subdomain.find({name: subdomain, status: "active"}).count() === 0)
		{
			return false;
		} else {
			return subdomain;
		}
	}
});
