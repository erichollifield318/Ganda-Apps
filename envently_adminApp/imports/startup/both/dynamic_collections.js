/**** code added ****/
import { Meteor } from 'meteor/meteor';
import { MenuItemDev } from '/imports/api/menu_item_dev/menu_item_dev.js';
import { Subdomain } from '/imports/api/subdomain/subdomain.js';

import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { Categories } from '/imports/api/categories/categories.js';
import { CacheDev } from '/imports/api/cache_dev/cache_dev.js';
import { Clients } from '/imports/api/clients/clients.js';
import { CustomLocation } from '/imports/api/custom_location/custom_location.js';
import { Enquiry } from '/imports/api/enquiry/enquiry.js';
import { EventDev } from '/imports/api/event_dev/event_dev.js';
// import { Images } from '/imports/api/startup/lib/common/image.js';
import { Links } from '/imports/api/links/links.js';
import { LocationData } from '/imports/api/location_data/location_data.js';
import { LocationDev } from '/imports/api/location_dev/location_dev.js';
import { LocationCoords } from '/imports/api/locationCoords/locationCoords.js';
import { LocationStatus } from '/imports/api/locationsDataTable/locationStatus.js';
import { RouteLocations } from '/imports/api/routeLocations/routeLocations.js';
import { Usersdata } from '/imports/api/usersdata/usersdata.js';






export const dynamicCollections = {};

if(Meteor.isClient){
  Tracker.autorun(() => {
  var handle=Meteor.subscribe('subdomain.all')
  if(handle.ready())
  {
    Subdomain.find().fetch().forEach(function(dd,ii){
      var collectionList = ['admin_settings','cache_dev','categories','clients','custom_location','enquiry','event_dev','images','links','location_data','location_dev','location_coords','location_status','menu_item_dev','routeLocations','usersdata', 'usage_log', 'advertisement','atdw_data'];
      collectionList.forEach((d,i)=>{
        // if(!Mongo.Collection.get(dd.name+"_"+d) || !dynamicCollections[dd.name+"_"+d])
        if(!dynamicCollections[dd.name+"_"+d])
        {
          dynamicCollections[dd.name+"_"+d] = new Mongo.Collection(dd.name+'_'+d);

          dynamicCollections[dd.name+'_'+d].allow({
            insert(userId, doc, fields, modifier) {
              return true;
            },
            update(userId, doc, fields, modifier) {
              return true;
            },
            remove(userId, doc, fields, modifier) {
              return true;
            },
          });
         }
      })
    })
  }
});
}
if(Meteor.isServer) {
  Subdomain.find().fetch().forEach(function(dd,ii){
    var collectionList = ['admin_settings','cache_dev','categories','clients','custom_location','enquiry','event_dev','images','links','location_data','location_dev','location_coords','location_status','menu_item_dev','routeLocations','usersdata', 'usage_log', 'advertisement','atdw_data'];
    collectionList.forEach((d,i)=>{
      if(!dynamicCollections[dd.name+"_"+d]){
        dynamicCollections[dd.name+"_"+d] = new Mongo.Collection(dd.name+'_'+d);

        dynamicCollections[dd.name+'_'+d].allow({
          insert(userId, doc, fields, modifier) {
            return true;
          },
          update(userId, doc, fields, modifier) {
            return true;
          },
          remove(userId, doc, fields, modifier) {
            return true;
          },
        });
      }
    })
  })
}
// console.log('dynamicCollections initial',dynamicCollections)
//
// Meteor.methods({
//   'create_dynamic_collection' (subdomainName) {
// //   var collectionList = ['admin_settings','cache_dev','categories','clients','custom_location','enquiry','event_dev','images','links','location_data','location_dev','location_coords','location_status','menu_item_dev','routeLocations','usersdata'];
// //   collectionList.forEach((d,i)=>{
// //     dynamicCollections[subdomainName+"_"+d] = new Mongo.Collection(subdomainName+'_'+d);
// //
// //     if(d == 'categories')
// //     {
// //       if (Meteor.isServer) {
// //         dynamicCollections[subdomainName+'_'+d]._ensureIndex({ name: 1, id: 1 });
// //       }
// //     }
// //
// //     dynamicCollections[subdomainName+'_'+d].allow({
// //       insert(userId, doc, fields, modifier) {
// //         return true;
// //       },
// //       update(userId, doc, fields, modifier) {
// //         return true;
// //       },
// //       remove(userId, doc, fields, modifier) {
// //         return true;
// //       },
// //     });
// //   })
// //
// // MenuItemDev.find().fetch().forEach((d,i)=>{
// //   dynamicCollections[subdomainName+'_menu_item_dev'].insert({
// //       name: d.name,
// //       preference: {
// //           icon: d.preference.icon,
// //           color: d.preference.color
// //       },
// //       items: [],
// //       createdAt: new Date(),
// //       customIndex : new Date().getTime()
// //   });
// //
// // })
//
//
//   }
// });

export function create_dynamic_collection(subdomainName){
    var collectionList = ['admin_settings','cache_dev','categories','clients','custom_location','enquiry','event_dev','images','links','location_data','location_dev','location_coords','location_status','menu_item_dev','routeLocations','usersdata', 'usage_log', 'advertisement'];
    collectionList.forEach((d,i)=>{
      if(!dynamicCollections[subdomainName+"_"+d]){
        dynamicCollections[subdomainName+"_"+d] = new Mongo.Collection(subdomainName+'_'+d);

        console.log("Subdomain ===> " ,dynamicCollections[subdomainName+"_"+d]);
        console.log(':: 3 ==> ',d)
        if(d == 'categories')
        {
          if (Meteor.isServer) {
            dynamicCollections[subdomainName+'_'+d]._ensureIndex({ name: 1, id: 1 });
          }
        }

        dynamicCollections[subdomainName+'_'+d].allow({
          insert(userId, doc, fields, modifier) {
            return true;
          },
          update(userId, doc, fields, modifier) {
            return true;
          },
          remove(userId, doc, fields, modifier) {
            return true;
          },
        });
      }
    });

  if (dynamicCollections[subdomainName+'_admin_settings']) {
    var entry = {
      "adminIps": "",
      "branding": "",
      "cacheRefreshTime": "",
      "copyright": "",
      "createdAt": new Date(),
      "geoFence" : {
        "zoomLevel" : 14,
        "defaultCords" : {
          "id" : "b0e1e7144ac57cbf35923ba45ce662c2",
          "type" : "Feature",
          "properties" : {

          },
          "geometry" : {
            "coordinates" : [
              151.2428284863807,
              -33.87659929440507
            ],
            "type" : "Point"
          }
        }
      },
      "privacypolicy": "",
      "rssFeed": "",
      "rssFeedLive": "",
      "subDomain": subdomainName,
      "suburb": "",
      "termsservice": "",
      "updateAt": new Date(),
      "updatedAt": new Date(),
      "userId": ""
    };
    dynamicCollections[subdomainName+'_admin_settings'].insert(entry);
  }

 /* MenuItemDev.find().fetch().forEach((d,i)=>{
    if (dynamicCollections[subdomainName+'_menu_item_dev']) {
      dynamicCollections[subdomainName+'_menu_item_dev'].insert({
          name: d.name,
          preference: {
              icon: d.preference.icon,
              color: d.preference.color
          },
          items: [],
          createdAt: new Date(),
          customIndex : new Date().getTime()
      });
    }
  })
*/
  // MenuItemDev.find().fetch().forEach((d,i)=>{
  //   if (dynamicCollections[subdomainName+'_menu_item_dev'])
  //     dynamicCollections[subdomainName+'_menu_item_dev'].insert(d);
  //
  // });
  //  AdminSettings.find().fetch().forEach((d,i)=>{
  //   if (dynamicCollections[subdomainName+'_admin_settings']) {
  //     if (d.subDomain) {
  //       d.subDomain = subdomainName;
  //     }
  //     dynamicCollections[subdomainName+'_admin_settings'].insert(d);
  //   }
  //
  //  });
  // Categories.find().fetch().forEach((d,i)=>{
  //   if (dynamicCollections[subdomainName+'_categories'])
  //     dynamicCollections[subdomainName+'_categories'].insert(d);
  //
  // });
  // CacheDev.find().fetch().forEach((d,i)=>{
  //   if (dynamicCollections[subdomainName+'_cache_dev'])
  //     dynamicCollections[subdomainName+'_cache_dev'].insert(d);
  //
  // });
  // Clients.find().fetch().forEach((d,i)=>{
  //   if (dynamicCollections[subdomainName+'_clients']) {
  //     if (d.client) {
  //       d.client = subdomainName;
  //     }
  //     dynamicCollections[subdomainName+'_clients'].insert(d);
  //   }
  //
  // });
  // CustomLocation.find().fetch().forEach((d,i)=>{
  //   if (dynamicCollections[subdomainName+'_custom_location'])
  //     dynamicCollections[subdomainName+'_custom_location'].insert(d);
  //
  // });
  /*Enquiry.find().fetch().forEach((d,i)=>{
    if (dynamicCollections[subdomainName+'_enquiry'])
      dynamicCollections[subdomainName+'_enquiry'].insert(d);

  });*/
  // EventDev.find().fetch().forEach((d,i)=>{
  //   if (dynamicCollections[subdomainName+'_event_dev'])
  //     dynamicCollections[subdomainName+'_event_dev'].insert(d);
  //
  // });
  // Links.find().fetch().forEach((d,i)=>{
  //   if (dynamicCollections[subdomainName+'_links'])
  //     dynamicCollections[subdomainName+'_links'].insert(d);
  //
  // });
  // LocationData.find().fetch().forEach((d,i)=>{
  //   if (dynamicCollections[subdomainName+'_location_data'])
  //     dynamicCollections[subdomainName+'_location_data'].insert(d);
  //
  // });
  // LocationDev.find().fetch().forEach((d,i)=>{
  //   if (dynamicCollections[subdomainName+'_location_dev'])
  //     dynamicCollections[subdomainName+'_location_dev'].insert(d);

  // });
  // LocationStatus.find().fetch().forEach((d,i)=>{
  //   if (dynamicCollections[subdomainName+'_location_status'])
  //     dynamicCollections[subdomainName+'_location_status'].insert(d);
  //
  // });
  // LocationCoords.find().fetch().forEach((d,i)=>{
  //   if (dynamicCollections[subdomainName+'_location_coords'])
  //     dynamicCollections[subdomainName+'_location_coords'].insert(d);
  //
  // });
  // RouteLocations.find().fetch().forEach((d,i)=>{
  //   if (dynamicCollections[subdomainName+'_routeLocations']) {
  //     if (d.subDomain) {
  //       d.subDomain = subdomainName;
  //     }
  //     dynamicCollections[subdomainName+'_routeLocations'].insert(d);
  //   }
  //
  // });
  // Usersdata.find().fetch().forEach((d,i)=>{
  //   if (dynamicCollections[subdomainName+'_usersdata'])
  //     dynamicCollections[subdomainName+'_usersdata'].insert(d);
  //
  // });
}

export function remove_dynamic_collection(subDomainName) {
  var collectionList = ['admin_settings','cache_dev','categories','clients','custom_location','enquiry','event_dev','images','links','location_data','location_dev','location_coords','location_status','menu_item_dev','routeLocations','usersdata', 'usage_log', 'advertisement'];
  collectionList.forEach((d,i)=>{
    if (dynamicCollections[subDomainName+"_"+d]) {
      dynamicCollections[subDomainName+"_"+d].rawCollection().drop();

    }
  });
}
/*** end added ***/
