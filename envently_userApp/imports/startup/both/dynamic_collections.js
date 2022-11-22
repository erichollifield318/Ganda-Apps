/**** code added ****/
import { Meteor } from 'meteor/meteor';
import { MenuItemDev } from '/imports/api/menu_item_dev/menu_item_dev.js';
import { Subdomain } from '/imports/api/subdomain/subdomain.js';

console.log(" dynamic collections js runs when server starts");

export const dynamicCollections = {};

if(Meteor.isClient){

  // console.log("is client is called");
  Tracker.autorun(() => {
  var handle=Meteor.subscribe('subdomain.all')
  if(handle.ready())
  {

    // console.log("handle is ready");
    Subdomain.find().fetch().forEach(function(dd,ii){

      // console.log(" Dynamic collection js Runs when server starts");

      var collectionList = ['admin_settings','cache_dev','categories','clients','custom_location','enquiry','event_dev','images','links','location_data','location_dev','location_coords','location_status','menu_item_dev','routeLocations', 'usage_log', 'usersdata','advertisement','atdw_data'];


      
      collectionList.forEach((d,i)=>{
        // if(!Mongo.Collection.get(dd.name+"_"+d) || !dynamicCollections[dd.name+"_"+d])
        if(!dynamicCollections[dd.name+"_"+d])
        {
          dynamicCollections[dd.name+"_"+d] = new Mongo.Collection(dd.name+'_'+d);

          // console.log("allowing the access data");

          // console.log("name ===> " , dd.name)
          // console.log("d ===> " , d);

          dynamicCollections[dd.name+'_'+d].allow({
            insert(userId, doc, fields, modifier) {
              // console.log("insert is allowed");
              return true;
            },
            update(userId, doc, fields, modifier) {
              // console.log("update is allowed");
              return true;
            },
            remove(userId, doc, fields, modifier) {
              // console.log("remove is allowed");
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

    var collectionList = ['admin_settings','cache_dev','categories','clients','custom_location','enquiry','event_dev','images','links','location_data','location_dev','location_coords','location_status','menu_item_dev','routeLocations', 'usage_log', 'usersdata','advertisement','atdw_data'];

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
