// Server entry point, imports all server code

import '/imports/startup/server';
import '/imports/startup/both';

import { _ } from 'meteor/underscore';
import { CustomLocation } from '/imports/api/custom_location/custom_location';
import { LocationData } from '/imports/api/location_data/location_data';
import { LocationDev } from '/imports/api/location_dev/location_dev';
import { MenuItemDev } from '/imports/api/menu_item_dev/menu_item_dev';
import { EventDev } from '/imports/api/event_dev/event_dev';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { Subdomain } from '/imports/api/subdomain/subdomain.js';
// import { getSubdomain } from '/imports/startup/both/global_function.js';

import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor'

/* Configuration of all account on server side */

if(Meteor.isServer){
    process.env.MAIL_URL = `smtp://${encodeURIComponent(Meteor.settings.private.smtp.username)}:${encodeURIComponent(Meteor.settings.private.password)}@${encodeURIComponent(Meteor.settings.private.smtp.server)}:${Meteor.settings.private.smtp.port}`;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"


}


// Meteor.startup(function () {

//   /*removeSubdomainsAndCollections ();*/
//   removeMaliciousRecord();

// });

// function removeMaliciousRecord() {
//   let dbResult = MenuItemDev.aggregate( [
//       { $unwind : "$items" },
//       { $project: {
//           _id: 0,
//           locationDevIds: "$items.custom_locations",
//           eventIds: "$items.events"
//       }}
//     ]);

//   let locationDevIds = _.union(_.flatten(_.pluck(dbResult, 'locationDevIds')));
//   let eventIds = _.union(_.flatten(_.pluck(dbResult, 'eventIds')));
//   LocationDev.remove({_id: { $nin: locationDevIds } });
//   EventDev.remove({_id: { $nin: eventIds } });
// }

// function removeSubdomainsAndCollections() {

//   var subdomainList = ['saransh'];
//   subdomainList.map((subdomain) => {
//     if (Subdomain.find({name: subdomain }).count() != 0){
//       Subdomain.remove({name: subdomain })
      
//     }
//     var collectionList = ['admin_settings','cache_dev','categories','clients','custom_location','enquiry','event_dev','images','links','location_data','location_dev','location_coords','location_status','menu_item_dev','routeLocations','usersdata'];
//     collectionList.map((collection) => {
//       console.log('::===> 1 ',collection)
//       if(dynamicCollections[subdomain+'_'+collection]){
//         console.log("::===> 1 inside if")
//         dynamicCollections[subdomain+'_'+collection].rawCollection().drop();
//       }
//     });
//   });
// }
