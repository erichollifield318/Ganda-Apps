// Methods related to Menus and their contents
import { Meteor } from 'meteor/meteor';
import { Categories } from '/imports/api/categories/categories';
import { CustomLocation } from '/imports/api/custom_location/custom_location';
import { EventDev } from '/imports/api/event_dev/event_dev';
import { LocationData } from '/imports/api/location_data/location_data';
import { LocationDev } from '/imports/api/location_dev/location_dev';
import { MenuItemDev } from '/imports/api/menu_item_dev/menu_item_dev';
import { CacheDev } from '/imports/api/cache_dev/cache_dev';
import Fibers from 'fibers';
import Future from 'fibers/future';
import MapboxClient from 'mapbox';
import { LocationCoords } from '/imports/api/locationCoords/locationCoords';
import { LocationStatus } from '/imports/api/locationsDataTable/locationStatus.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

_.mixin({
  like: function(text, likeExpr) {
    var regex = new RegExp(text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
    return regex.test(likeExpr);
  }
});

Meteor.methods({
  'bottomSheetModal.getMarkersForItem'(item, suburb, subdomain) {
    let future = new Future();
    // new Fibers(()=> {

      let markers = [], eventMarkers=[], categoryMarkers=[], locationMarkers=[];
      // for events
      if(item.events && item.events.length){
        item.events.forEach((id, key)=>{
          let event = EventDev.findOne({_id: id});
          if(getSubdomain())
          {
            event = dynamicCollections[getSubdomain()+'_event_dev'].findOne({_id: id});
          }
          if(event){
            event.markerFor = 'Event';
            eventMarkers.push(event);
          }
        });
        markers = markers.concat(eventMarkers);
      }

      // commented out temporarily
        // for categories
        /*if(item.sensis_categories && item.sensis_categories.length){
          item.sensis_categories.forEach((id, key)=>{
            let category = Categories.findOne({id: parseInt(id)});
            if(category){
              categories = performSensisSearch(category.name, category.id, suburb, subdomain);
              console.log(":: Searched = ",category.name," Result length = ",categories.length);
              categories.forEach(function(obj) { obj.markerFor = "Category" });
              categoryMarkers = categoryMarkers.concat(categories);
            }
          });
          // check if locations obtained by categorySearch is already present in database
          // markers = markers.concat(fetchLocationsFromDb(categoryMarkers));
          markers = markers.concat(categoryMarkers);
          console.log(":: CATEGORY MARKERS - > ",categoryMarkers.length);
        }*/
      // commented out temporarily

      // for locations
      if(item.custom_locations && item.custom_locations.length){
        item.custom_locations.forEach((id, key)=>{
          let locationDevData;
          if(getSubdomain())
          {
            locationDevData = dynamicCollections[getSubdomain()+'_location_dev'].findOne({_id: id});
          }
          else {
            locationDevData = LocationDev.findOne({_id: id})
          }
          let refData = null;
          if(locationDevData){
            if(locationDevData.location_ref=='custom_location')
            {
              if(getSubdomain())
              {
                refData = dynamicCollections[getSubdomain()+'_custom_location'].findOne({_id: locationDevData.location_ref_id});
              }
              else {
                refData = CustomLocation.findOne({_id: locationDevData.location_ref_id});
              }
            }
            if(locationDevData.location_ref=='location_data')
            {
              if(getSubdomain())
              {
                refData = dynamicCollections[getSubdomain()+'_location_data'].findOne({_id: locationDevData.location_ref_id});
              }
              else {
                refData = LocationData.findOne({_id: locationDevData.location_ref_id});

              }
            }
            if(refData){
              locationDevData.text1 = refData.text1;
              locationDevData.text2 = refData.text2;
              locationDevData.image1 = refData.image1;
              locationDevData.image2 = refData.image2;
            }
            locationDevData.markerFor = 'Location';
            locationDevData.parentMenuIcon = item.preference.icon;
            locationMarkers.push(locationDevData);
          }
        });
        markers = markers.concat(locationMarkers);
      }
      markers = UniqueArraybyId(markers ,"name");
      future.return(markers);
    // }).run();
    return future.wait();
  },

  'bottomSheetModal.getMarkersForSearchedItem'(searchedString, suburb, subdomain) {
    console.log("-----------------------------getMarkersForSearchedItem-------------------------------");
    let future = new Future();
    new Fibers(()=> {
      let markers = [];
      let subMenus =[];
      if(getSubdomain())
      {
        subMenus = dynamicCollections[getSubdomain()+'_menu_item_dev'].find({'items.name': {'$regex':searchedString, '$options':'i'}},{fields:{'items.$': 1,'preference':1}}).fetch();
      }
      else {
        subMenus = MenuItemDev.find({'items.name': {'$regex':searchedString, '$options':'i'}},{fields:{'items.$': 1,'preference':1}}).fetch();
      }
      let menuItems = _.pluck(subMenus, 'items');
      let menuPrefrence;
      if (subMenus.length)
      menuPrefrence=subMenus[0].preference;
      menuItems = [].concat.apply([], menuItems);
      menuItems = UniqueArraybyId(menuItems ,"_id");
      //fetching markers for sub-menu items

      if(menuItems && menuItems.length){
        menuItems.forEach((menu)=>{
          let menuItemMarkers = Meteor.call('bottomSheetModal.getMarkersForItem', menu, suburb, subdomain );
          //console.log(":: markers for <",menu.name,"> sub-menu = > ",menuItemMarkers.length);
          // markers = markers.concat(menuItemMarkers)
          // we dont have to concatinate submenu-item markers with other marker results because we are not suppose to search anywhere else in this case
          markers = menuItemMarkers;

        });

      } else {
        let event = [];
        if(getSubdomain())
        {
          event = dynamicCollections[getSubdomain()+'_event_dev'].find({name: {'$regex':searchedString, '$options':'i'}}).fetch();
        }
        else {
          event = EventDev.find({name: {'$regex':searchedString, '$options':'i'}}).fetch();
        }
        if(event.length){
          event[0].markerFor = 'Event';
          markers = markers.concat(event);
        }

        let location = [];
        if(getSubdomain())
        {
          location = dynamicCollections[getSubdomain()+'_location_dev'].find({name: {'$regex':searchedString, '$options':'i'}}).fetch();
        }
        else {
          location = LocationDev.find({name: {'$regex':searchedString, '$options':'i'}}).fetch();
        }
        console.log(":: matched location - ",location.length);

        // Fetching marker icon for a single marker
        //If location not available adding condition because if the search is not available in db it was crashing the application
        if (location.length) {
            let searchItem = location[0]._id;
            let subMenu;
            if(searchItem) {
              if(getSubdomain())
              {
                subMenu = dynamicCollections[getSubdomain()+'_menu_item_dev'].find({'items.custom_locations': searchItem},{fields: {'items': 1, 'preference': 1}}).fetch();
              }
              else {
                subMenu = MenuItemDev.find({'items.custom_locations': searchItem},{fields: {'items': 1, 'preference': 1}}).fetch();
              }
            }
            location[0].baseMenuColor = subMenu[0].preference.color;
            // subMenu[0].items.map(item => {
            //   if(item.custom_locations.find(val => val==searchItem)) {
            //     location[0].parentMenuIcon = item.preference.icon;
            //     return;
            //   }
            // })
            let subMenuItem = subMenu[0].items;
            for(item in subMenuItem) {
              if(subMenuItem[item].custom_locations.find(val => val==searchItem)) {
                location[0].parentMenuIcon = subMenuItem[item].preference.icon;
                break;
              }
            }

          // fetching markers for matched locations
            let refData = null
            if(location[0].location_ref=='custom_location')
            {
              if(getSubdomain())
              {
                refData = dynamicCollections[getSubdomain()+'_custom_location'].findOne({_id: location[0].location_ref_id});
              }
              else {
                refData = CustomLocation.findOne({_id: location[0].location_ref_id});
              }
            }
            if(location[0].location_ref=='location_data')
            {
              if(getSubdomain())
              {
                refData = dynamicCollections[getSubdomain()+'_location_data'].findOne({_id: location[0].location_ref_id});
              }
              else {
                refData = LocationData.findOne({_id: location[0].location_ref_id});
              }
            }
              if(locationDevData.location_ref=='location_data')

            if(refData){
              location[0].text1 = refData.text1;
              location[0].text2 = refData.text2;
              location[0].image1 = refData.image1;
              location[0].image2 = refData.image2;
            }

            location[0].markerFor = 'Location';
            markers = markers.concat(location);

        }

        // Commented out temporarily
          /*let category = Categories.find({name: {'$regex':searchedString, '$options':'i'}}).fetch();
          console.log(":: matched category - ",category.length);
          // for added categories, performing sensis search by category
          if(category.length){
            let categories = performSensisSearch(category[0].name, category[0].id, suburb, subdomain);
            categories.forEach(function(obj) { obj.markerFor = "Category"; });
            markers = markers.concat(categories);
            // future.return(categories);
          }

          // Performing name search on sensis api for entered string
          let searchResults = performSensisSearch(searchedString, null, suburb, subdomain);
          let filteredArray = _.filter(UniqueArraybyId(searchResults, "name"), function(item) {
            return _.like(searchedString, item.name);
          });
          markers = markers.concat(filteredArray);
          console.log(":: matched nameSearchResults length - > ",searchResults.length,":: Names are - > ",_.pluck(searchResults, 'name'));*/
        // Commented out temporarily
      }
      if (menuPrefrence && menuPrefrence.color && markers.length)
        markers[0].baseMenuColor=menuPrefrence.color;

      /*console.log(":: Before Normalization: Markers length - > ",markers);*/
      markers = UniqueArraybyId(markers ,"name");
      console.log("markers",markers)
      //console.log(":: After Normalization: Markers length - > ",markers.length);
      future.return(markers);

    }).run();
    return future.wait();
  },

  'bottomSheetModal.sensisNameSearch'(searchedString, suburb, subdomain) {
    let searchResults = performSensisSearch(searchedString, null, suburb, subdomain);
    let filteredArray = _.filter(UniqueArraybyId(searchResults ,"name"), function(item) {
      return _.like(searchedString, item.name);
    });
    return filteredArray;
  },

  'bottomSheetModal.getRssFeedEvents'(settings) {
    let future = new Future();
    if(settings && settings.rssFeedLive && settings.rssFeedLive.link){
      var parseString = require('xml2js').parseString;

      try {
        let result =  HTTP.get(settings.rssFeedLive.link);
        // console.log(":: result - > ",result);
        if (result.statusCode!=200) {
          throw new Meteor.Error('No result found for this RSS Feed.');
        } else {
          if (!result || !result.content) {
            throw new Meteor.Error('No result found for this RSS Feed.');
          } else {
            let xml = result.content.replace(/[\n\r]/g, '\\n')
              .replace(/&/g,"&amp;")
              .replace(/-/g,"&#45;");

            parseString(xml, { explicitArray : false, ignoreAttrs : true }, function (err, result) {
              if (result && result.rss && result.rss.channel && result.rss.channel.item && result.rss.channel.item.length) {
                future.return(result.rss.channel.item);
              } else {
                future.return([]);
              }
            });
          }
        }
      } catch (error) {
        console.log(":: events.search > error - ",error);
        throw new Meteor.Error('No result found for this RSS Feed.');
      }
    }
    // console.log(":: result - ",result&&result.length?result[0]:'');
    return UniqueArraybyTitle(future.wait(), 'title');
  },

  searchLocationOnSensis(text, suburb, subdomain) {
    return performSensisSearch(text, null, suburb, subdomain);
  }

});

function fetchLocationsFromDb(sensisLocationArray) {
  return sensisLocationArray.map((loc) => {
    let dbLoc = {};
    if(getSubdomain())
    {
      dbLoc =  dynamicCollections[getSubdomain()+'_location_dev'].findOne({name: {'$regex': loc.name, '$options':'i'}});
    }
    else {
       dbLoc = LocationDev.findOne({name: {'$regex': loc.name, '$options':'i'}});
    }
    // fetching markers for matched locations
    if (dbLoc) {
      let refData = null
      if (dbLoc.location_ref=='custom_location') {
        if(getSubdomain())
        {
          refData =  dynamicCollections[getSubdomain()+'_custom_location'].findOne({_id: dbLoc.location_ref_id});
        }
        else {
          refData = CustomLocation.findOne({_id: dbLoc.location_ref_id});
        }
      }
      if (dbLoc.location_ref=='location_data') {
        if(getSubdomain())
        {
          refData =  dynamicCollections[getSubdomain()+'_location_data'].findOne({_id: dbLoc.location_ref_id});
        }
        else {
          refData = LocationData.findOne({_id: dbLoc.location_ref_id});
        }
      }
      if (refData) {
        dbLoc.text1 = refData.text1;
        dbLoc.text2 = refData.text2;
        dbLoc.image1 = refData.image1;
        dbLoc.image2 = refData.image2;
      }
      dbLoc.markerFor = 'Location';
    }
    return dbLoc;
  });
}

function performSensisSearch(query, catId, suburb, subdomain){
  try {
    var url = undefined;
    if(Meteor.settings.public.isLocal){
      url = `${Meteor.settings.public.devSensisUrl}search?key=${Meteor.settings.public.devSensisKey}&query=${query}`;
    }else{
      url = `${Meteor.settings.public.prodSensisUrl}search?key=${Meteor.settings.public.prodSensisKey}&query=${query}`;
    }
    if(catId) url+=`&categoryId=${catId}`
    url += suburb;
    url = encodeURI(url);
    Logger.log({action: `${Meteor.settings.public.userAppActions.sensisQuery} ${url}`});
    // let response = HTTP.get(url);

    // if(response.data && (response.data.code==400 || response.data.code==404)){
    //   return [];
    // }
    let response = getCompletePaginationData(url);
    Logger.log({action: `${Meteor.settings.public.userAppActions.sensisResult} ${response.length}`})
    insertToCacheDev(response)
    return response; /*.data.results*/
  } catch (e) {
    if (e) {
      let content = e.response && e.response.content ? e.response.content : '';
      Logger.error({message: content, subdomain: [subdomain[0]]});
      return []
        // throw new Meteor.Error(e);
    }
  }
}

function getCompletePaginationData(url){
  var results = [];
  let response = HTTP.get(url);
  if(response.data && (response.data.code==400 || response.data.code==404)){
    return [];
  }
  var data = response.data.results;
  results = results.concat(data);
  var currentPage = response.data.currentPage;
  var totalPages = response.data.totalPages;
  for (var i = currentPage+1; i <= totalPages; i++) {
    url = replaceUrlParam(url, 'page', i);
    let response = HTTP.get(url);
    data = response.data.results;
    results = results.concat(data);
  }
  return results;
}

function insertToCacheDev(cacheRecords) {
  new Fibers(function() {
    if (!cacheRecords) {
        return;
    }
    if (!Array.isArray(cacheRecords)) {
        cacheRecords = [cacheRecords];
    }

    let writeData = [];
    cacheRecords.map(function(cacheRecord) {
      if(cacheRecord && cacheRecord.name){
        cacheRecord['createdAt'] = new Date();
        writeData.push({
          updateOne: {
            "filter": {
              name: cacheRecord.name
            },
            "update": { $set: cacheRecord },
            "upsert": true
          }
        });
      }
    });

    CacheDev
      .rawCollection()
      .bulkWrite(writeData);
  }).run()
}

function replaceUrlParam(url, paramName, paramValue){
    if(paramValue == null)
        paramValue = '';
    var pattern = new RegExp('\\b('+paramName+'=).*?(&|$)')
    if(url.search(pattern)>=0){
        return url.replace(pattern,'$1' + paramValue + '$2');
    }
    return url + (url.indexOf('?')>0 ? '&' : '?') + paramName + '=' + paramValue
}

function UniqueArraybyId(collection, keyname) {
  // removing unapproving markers
  collection = filterOutUnapprovedMarkers(collection);

  var output = [],
      keys = [];
  collection.forEach((item)=> {
      var key = item[keyname];
      if(keys.indexOf(key) === -1) {
          keys.push(key);
          output.push(item);
      }else{
          let outputItem = _.where(output, {name: item.name});
          if(outputItem && outputItem.length){
            outputItem = outputItem[0];
            if(outputItem.name == item.name){
              let i = output.findIndex(x => x.name==item.name);
              if(outputItem.aboutId && item._id){
                output[i] = item
              }
            }
          }
      }
  });
  // console.log(":: Collection after - ",_.pluck(output, 'name'))
  return getNewCoords(output);
};

function UniqueArraybyTitle(collection, keyname) {
  var output = [],
      keys = [];
  collection.forEach((item)=> {
    var key = item[keyname];
    if(keys.indexOf(key) === -1) {
      keys.push(key);
      output.push(item);
    }
  });
  return output;
};

function filterOutUnapprovedMarkers(collection) {
  let locationStatusRecords = [];
  if(getSubdomain())
  {
  locationStatusRecords = dynamicCollections[getSubdomain()+'_location_status'].find({}).fetch();
  }
  else {
    locationStatusRecords = LocationStatus.find({}).fetch();
  }

  return collection.map((location)=>{

    if (location) {
      let recordId = location._id?((typeof location._id)==='String'?location._id:location._id.valueOf()):false;
      let locationId = location.aboutId?location.aboutId:recordId;
      if(!locationId) {
        location.isApproved = false;
        return location;
      }
      let locationStatus = _.where(locationStatusRecords, { locationId: locationId });
      if (locationStatus && locationStatus.length && !locationStatus[0].isApproved) {
        location.isApproved = locationStatus[0].isApproved;
      } else {
        location.isApproved = true;
      }

      return location;
    }
  });
}

function getNewCoords(output){
  let names = _.pluck(output, 'name');
  let newLocationCoords = LocationCoords.find({location: { $in: names } }).fetch();
  if(getSubdomain())
  {
  newLocationCoords = dynamicCollections[getSubdomain()+'_location_coords'].find({location: { $in: names } }).fetch();
  }
  else {
    newLocationCoords = LocationCoords.find({location: { $in: names } }).fetch();
  }
  if(!newLocationCoords || newLocationCoords.length==0)
    return output

  return output.map((location)=>{
    let temp = _.where(newLocationCoords, { location: location.name });
    if(temp && temp.length && temp[0].newCoords && temp[0].newCoords.latitude && temp[0].newCoords.longitude){
      location.newCoords = temp[0].newCoords
    } return location
  });
}
