// Server entry point, imports all server code

import '/imports/startup/server';
import '/imports/startup/both';

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
  // Meteor.startup(function () {
    process.env.MAIL_URL = `smtp://${encodeURIComponent(Meteor.settings.private.smtp.username)}:${encodeURIComponent(Meteor.settings.private.password)}@${encodeURIComponent(Meteor.settings.private.smtp.server)}:${Meteor.settings.private.smtp.port}`;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
    // Accounts.config({
    //     forbidClientAccountCreation : true,
    // });
  // })


}


Meteor.startup(function () {



  /*var subdomainList = ['gctourism'];
  subdomainList.map((subdomain) => {
    if (Subdomain.find({name: subdomain }).count() != 0){
      Subdomain.remove({name: subdomain })
      
    }
    var collectionList = ['admin_settings','cache_dev','categories','clients','custom_location','enquiry','event_dev','images','links','location_data','location_dev','location_coords','location_status','menu_item_dev','routeLocations','usersdata'];
    collectionList.map((collection) => {
      dynamicCollections[subdomain+'_'+collection]?dynamicCollections[subdomain+'_'+collection].rawCollection().drop():'';
    });
  });*/

  
	removeMaliciousRecord();

  // get super admin collection
  const checkSuperAdmin = Meteor.users.findOne({
    'emails.0.address': 'superadmin@envent.ly'
  });
  console.log(':: checkSuperAdmin ',checkSuperAdmin)
  // check super amdin is available or not
  if (!checkSuperAdmin) {
    // call function to add super admin, if not available
    addSuperAdmin ();
  }
});

function removeMaliciousRecord() {
  let dbResult;

  // if(getSubdomain())
  // {
  //   dbResult = dynamicCollections[getSubdomain()+'_menu_item_dev'].aggregate( [
  //     { $unwind : "$items" },
  //     { $project: {
  //         _id: 0,
  //         locationDevIds: "$items.custom_locations",
  //         eventIds: "$items.events"
  //     }}
  //   ]);
  // }
  // else {
    dbResult = MenuItemDev.aggregate( [
      { $unwind : "$items" },
      { $project: {
          _id: 0,
          locationDevIds: "$items.custom_locations",
          eventIds: "$items.events"
      }}
    ]);
  // }

  let locationDevIds = _.union(_.flatten(_.pluck(dbResult, 'locationDevIds')));
  let eventIds = _.union(_.flatten(_.pluck(dbResult, 'eventIds')));
  // console.log(":: locationDevIds ===>  ",locationDevIds.length,locationDevIds);
  // console.log(":: eventIds ===>  ",eventIds.length,eventIds);
  // if(getSubdomain())
  // {
  //   dynamicCollections[getSubdomain()+'_location_dev'].remove({_id: { $nin: locationDevIds } });
  // }
  // else {
    LocationDev.remove({_id: { $nin: locationDevIds } });
  // }

  // if(getSubdomain())
  // {
  //   dynamicCollections[getSubdomain()+'_event_dev'].remove({_id: { $nin: eventIds } });
  // }
  // else {
    EventDev.remove({_id: { $nin: eventIds } });
  // }
}


function addSuperAdmin () {
  // Create new super admin
  const superAdminId = Accounts.createUser({
    email : 'superadmin@envent.ly',
    password : "fTR&390@",
    profile  : {
      fname: "Super Admin",
      status:'active'
    }
  });

  // Verife auper admin's email id
  Meteor.users.update(superAdminId,{$set:{'emails.0.verified':true}});
  // Set super-admin role for global group
  Roles.addUsersToRoles(superAdminId, ['super-admin'], Roles.GLOBAL_GROUP);
}
