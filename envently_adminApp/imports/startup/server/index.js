// Import server startup through a single index entry point

import './fixtures.js';
import './register-api.js';
import './social-login-conf.js';
// import { Subdomain } from '/imports/api/subdomain/subdomain.js';
// import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';

Meteor.startup(function(){
	const startTime = Date.now();
	process.env.MAIL_URL = 'smtp://' + encodeURIComponent(Meteor.settings.private.smtp.username) + ':' + encodeURIComponent(Meteor.settings.private.smtp.password) + '@' + encodeURIComponent(Meteor.settings.private.smtp.server) + ':' + Meteor.settings.private.smtp.port;

	let subDomain = Meteor.absoluteUrl().split("/")[2].split(".")[0];
	Logger.log({ action: `${Meteor.settings.public.userAppActions.appStart}`, subdomain: `${subDomain}` });

	//Meteor.call('menuItemDev.upsertCustomIndex');
	//Meteor.call('menuItemDev.upsertCustomIndexInSubMenuItems');
	const endTime = Date.now() - startTime;
	console.log("app start server index.js startup took", endTime, "ms");

	// Subdomain.find().fetch().forEach((dd,ii)=>{
	// 	var collectionList = ['admin_settings','cache_dev','categories','clients','custom_location','enquiry','event_dev','images','links','location_data','location_dev','location_coords','location_status','menu_item_dev','routeLocations','usersdata'];
	// 	collectionList.forEach((d,i)=>{
	// 		dynamicCollections[dd.name+"_"+d] = new Mongo.Collection(dd.name+'_'+d);
	//
	// 		if(d == 'categories')
	// 		{
	// 			if (Meteor.isServer) {
	// 				dynamicCollections[dd.name+'_'+d]._ensureIndex({ name: 1, id: 1 });
	// 			}
	// 		}
	//
	// 		dynamicCollections[dd.name+'_'+d].allow({
	// 			insert(userId, doc, fields, modifier) {
	// 				return true;
	// 			},
	// 			update(userId, doc, fields, modifier) {
	// 				return true;
	// 			},
	// 			remove(userId, doc, fields, modifier) {
	// 				return true;
	// 			},
	// 		});
	// 	})
	// });

})
