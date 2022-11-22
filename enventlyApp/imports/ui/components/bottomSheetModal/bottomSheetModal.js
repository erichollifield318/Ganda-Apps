import './bottomSheetModal.html';
const { MenuItemDev } =  require('/imports/api/menu_item_dev/menu_item_dev.js');
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

import { Random } from 'meteor/random';

Template.bottomSheetModal.onCreated(function bottomSheetModalOnCreated() {
  const { ReactiveVar }  =  require('meteor/reactive-var');
  this.clients = new ReactiveVar(false);
  this.menus = new ReactiveVar(false);
  this.currentEvents = new ReactiveVar(false);
  this.autorun(()=> {
    let menuHandle = Meteor.subscribe('menu_item_dev.all');
    let menuName = Session.get('selectedMenuName');

    if (menuName === 'CURRENT EVENTS') {

      try {
        let siteSettings = Session.get('siteSettings');
        Session.set('showLoadingSpinner', true);
        Meteor.call("bottomSheetModal.getRssFeedEvents", siteSettings,  (error, eventList)=>{
          Session.set('showLoadingSpinner', false);
          if (error) {
            console.log(":: error inside getMarkersForItem Meteor call.",error);
          } else {
            // Session.set('categsArray', eventList);
            console.log(":: CURRENT EVENT LOCATIONS ARRAY - > ",eventList);
            this.currentEvents.set(eventList);
          }
        });
      } catch (exception) {
        console.log( ":: current events fetch exception - > ",exception );
      } finally {
        console.log(":: current events finally called");
      }
    } else {
      this.currentEvents.set(false);
    }
  });
});
Template.bottomSheetModal.onRendered(function() {
 /* destination = {
    latLng: [0, 0],
    profile: 'driving-traffic'
}*/
 }); 

Template.bottomSheetModal.helpers({
  currentClient() {
    return Session.get('currentClient');
  },

  selectedMenu() {
    var selectedMenuId = Template.instance().data && Template.instance().data.selectedMenuId ? Template.instance().data.selectedMenuId.get() : undefined
    if (selectedMenuId) {

      var selectedMenuData = {};
      if(getSubdomain())
      {
        selectedMenuData = dynamicCollections[getSubdomain()+'_menu_item_dev'].findOne({ "_id":selectedMenuId, "publishDetails":{ $exists:true }});
      }
      else {
        selectedMenuData = MenuItemDev.findOne({ "_id":selectedMenuId, "publishDetails":{ $exists:true }});
      }
      var items = selectedMenuData.items || [];
        items = _.sortBy(items, 'customIndex');
        selectedMenuData['items'] = items;
      Template.instance().menus.set(selectedMenuData);
      if(selectedMenuData.items.length == 1)
        Session.set("currentMenu", null);
      return selectedMenuData;
    } else {

      return {};
    }
  },

  menuId() {
    return Session.get("currentMenu");
  },

  isPublish(itemId){
    var menu = Template.instance().menus.get()
    // var menu = _.findWhere(menus, {_id: menuId});
    var lastPublishDetail = menu && menu.publishDetails && menu.publishDetails.length>0 ? _.last(menu.publishDetails) : undefined;
    var itemIds = lastPublishDetail ? lastPublishDetail.itemsIds : [];
    return _.contains(itemIds, itemId);
  },

  getMenuItemIcon(preference) {

    if(preference && preference.icon){
      return preference.icon;
    }
    return 'city-15'
  },

  getMenuItemColor(preference) {

    if(preference && preference.colors){
      return preference.colors;
    }
  },
  getBaseMenuColor(preference) {

    if(preference && preference.color){
      return preference.color;
    }
  },
  getFooterImage() {
    let siteSettings = Session.get('siteSettings');
    let branding = siteSettings && siteSettings.branding ? siteSettings.branding : {};
    if(branding.mainImage){
      return "img/DoubleBay_Brandmark_Black.svg";
    }
    return "img/DoubleBay_Brandmark_Black.svg";
  },

  currentEvents() {
    let inst = Template.instance();
    return inst.currentEvents.get();
  },

  markers() {
      return Session.get('markers');
  },

  currentMenu (){
    return Session.get("currentMenu");
  }

});

Template.bottomSheetModal.events({
  'click .locate' (event, inst) {
    console.log("locate")
    // event.preventDefault();
    if(!Session.get('showMap')){
      Session.set('showMap', true);
    }

    Session.set('showLoadingSpinner', true);
    $('.fixed-action-btn').closeFAB();
    let itemId = $(event.target).attr('id');
    /*let item = _(inst.menus.get()).chain().
                pluck('items').
                flatten()*//*.
                findWhere({_id: itemId}).
                value();*/
    var menu = inst.menus.get();
    console.log(menu, "menues")
    var items = menu && menu.items && menu.items.length>0 ? menu.items : [];
    let item =  _.findWhere(items, {_id: itemId});
    if(menu)
      item.baseMenuColor = menu.preference.color;
    console.log(':::::: item ',item)
    Session.set('selectedSubMenu', item)
    let itemName = item.name;
    Session.set('menuItemSelected', itemName);
    inst.data.selectedMenuItemName.set(itemName);
    var subdomain = document.location.hostname.split('.');
    Logger.log({action: `${Meteor.settings.public.userAppActions.subMenuItemSelected} ${subdomain[0]} ${itemName}`});
    try {
      let siteSettings = Session.get('siteSettings');
          let suburb = siteSettings && siteSettings.suburb ? siteSettings.suburb : '';
          var subdomain = document.location.hostname.split('.');
      Meteor.call("bottomSheetModal.getMarkersForItem", item, suburb, subdomain,  (error, markersArray)=>{
        if(error){
          console.log(":: error inside getMarkersForItem Meteor callaaaaaaaaaaa.",error);
        }else{
          Session.set('categsArray', markersArray);
          Session.set("currentMenu", null);
        }
      })

    } catch (exception) {
        console.log( ":: locate sensis exception - > ",exception );
    } finally {
      // $('#autocomplete-input').val(category)
      console.log("finally called.............")
      Session.set('singleMarker',false);
      if (item.custom_locations.length===0) {
        $('.modal.bottom-sheet').modal('close');
      }
      /*$('.modal.bottom-sheet').modal('close');*/
    }
  },
  'click .locate-event' (event, inst) {
    console.log("locate event")
    if(!Session.get('showMap')){
      Session.set('showMap', true);
    }
    $('.fixed-action-btn').closeFAB();

    let title = event.currentTarget.dataset.title;
    let item =  _.findWhere(inst.currentEvents.get(), { title: title });
    let newItemObj = {};

    /* Code to set base menu color for marker BG */
    let menu = inst.menus.get();
    // if(menu)
    //   item.baseMenuColor = menu.preference.color;

    /* This code to set base manu color and icon */
    if(menu && menu.preference.color && menu.preference.icon) {
      newItemObj.baseMenuColor = menu.preference.color;
      newItemObj.parentMenuIcon = menu.preference.icon;
    }

    newItemObj.markerFor = 'CurrentEvent';
    newItemObj._id = Random.id();
    newItemObj.isApproved = true;

    if(item && item.title){
      newItemObj.name = item.title;
    }
    if(item && item.address){
      newItemObj.address = item.address;
    }
    if(item && item.link){
      newItemObj.website = item.link;
    }
    if(item && item.phone){
      newItemObj.phone = item.phone;
    }
    if(item && item.image && item.image.url){
      newItemObj.image1 = item.image.url;
    }
    if(item && item.description){
      newItemObj.details1 = item.description;
    }
    if(item && item.location && item.location.lat){
      newItemObj.latitude = item.location.lat;
    }
    if(item && item.location && item.location.lng){
      newItemObj.longitude = item.location.lng;
    }
    if (item && item.begin) {
      newItemObj.from = new Date(item.begin);
    }
    if (item && item.end) {
      newItemObj.to = new Date(item.end);
    }


    // Find and insert item from currentEvents in here
    Session.set('selectedSubMenu', item);

    let itemName = item.name;
    Session.set('menuItemSelected', itemName);
    inst.data.selectedMenuItemName.set(itemName);

    var subdomain = document.location.hostname.split('.');
    Logger.log({action: `${Meteor.settings.public.userAppActions.subMenuItemSelected} ${subdomain[0]} ${itemName}`});

    // form a new object similiar to the one required in markers array
    // $('.modal.bottom-sheet').modal('close');

    Session.set('categsArray', [newItemObj]);
    Session.set("currentMenu", null);
    Session.set('singleMarker',false);
    // $('.modal.bottom-sheet').modal('close');
  },

  'click .mapboxgl-canvas' (event) {
    console.log("mapboxgl-canvas")
      Template.mapbox.__eventMaps[0]["click .mapboxgl-canvas"].call({templateInstance: function() {}}, event);
  },
  'click .marker'(event){
    console.log("marker")
      Template.mapbox.__eventMaps[0]["click .marker"].call({templateInstance: function() {}}, event);
  },
  'click .marker-edit-icon' (event, inst) {
    console.log("marker-edit-icon")
      Template.mapbox.__eventMaps[0]["click .marker-edit-icon"].call({templateInstance: function() {}}, event);
  },
  'click .more-info' (event, inst) {
    console.log("more-info")
      Template.mapbox.__eventMaps[0]["click .more-info"].call({templateInstance: function() {return Template.mapbox}}, event);
  },
  'click .directions' (event, inst) {
     Template.mapbox.__eventMaps[0]["click .directions"].call({templateInstance: function() {return Template.mapbox}}, event, inst);
      $('#bottomSheetModalId').modal('close');
  },
  'click .call' (event, inst){
    console.log("call")
      Template.mapbox.__eventMaps[0]["click .call"].call({templateInstance: function() {}}, event);
  }
});

function fetchRssFeedEvents(){
  try {
    let siteSettings = Session.get('siteSettings');
    Meteor.call("bottomSheetModal.getRssFeedEvents", siteSettings,  (error, markersArray)=>{
      if (error) {
        console.log(":: error inside getMarkersForItem Meteor call.",error);
      } else {
        // Session.set('categsArray', markersArray);
        console.log(":: CURRENT EVENT MARKERS ARRAY - > ",markersArray);
      }
    });
  } catch (exception) {
    console.log( ":: current events fetch exception - > ",exception );
  } finally {
    console.log(":: current events finally called");
  }
}
