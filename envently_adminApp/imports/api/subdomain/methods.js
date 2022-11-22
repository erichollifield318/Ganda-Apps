// Methods related to Menus and their contents
import { Meteor } from 'meteor/meteor';

import { Subdomain } from './subdomain.js';
import { create_dynamic_collection, remove_dynamic_collection }  from '/imports/startup/both/dynamic_collections.js';
Meteor.methods({
	'subdomain.insert' (subdomainData) {

		// console.log("subdomain.insert method is called");
		check (subdomainData, Object);
		if (Subdomain.find({name: subdomainData.name}).count() === 0) {
			const subdomainId = Subdomain.insert(subdomainData);
			/**** code added ****/

			// Meteor.call('create_dynamic_collection',subdomainData.name)
			create_dynamic_collection(subdomainData.name);

			/*** end added ***/
			return subdomainId;
		} else {
			return {
				'status': 'failed',
				'message': 'Subdomain already exists.',
			};
		}
	},
	'subdomain.delete' (subdomainId, subDomainName) {
		check (subdomainId, String)
		Meteor.users.remove({ 'profile.subdomainId': subdomainId }, { multi:true });

		Subdomain.remove(subdomainId);

    remove_dynamic_collection(subDomainName);

		return true
	},
	'subdomain.changeStatus' (subdomainId, newStatus) {
		check (subdomainId, String);
		check (newStatus, String);
		Subdomain.update(subdomainId, {
			$set: {
				status: newStatus,
			},
		});
		return true;
	},
	'subdomain.edit' (subdomainData) {
		check(subdomainData, Object);
		const checkUpdate = Subdomain.update(subdomainData.subDomainId, {
			$set:{
				name: subdomainData.name,
        title: subdomainData.title,
        contactEmail: subdomainData.contactEmail,
			},
		});
		return true
	},
	'checkSubdomainExist' (subdomain){
		if(Subdomain.find({name: subdomain}).count() === 0)
		{
			return false;
		}else {
			return subdomain;
		}
	}
});
