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
import { getSubdomain, getSubdomainUserApp } from '/imports/startup/both/global_function.js';

_.mixin({
  like: function(text, likeExpr) {
    var regex = new RegExp(text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
    return regex.test(likeExpr);
  }
});

Meteor.methods({
  
  'bottomSheetModal.sensisNameSearch'(searchedString, suburb, subdomain) {
    let searchResults = performSensisSearch(searchedString, null, suburb, subdomain);
    let filteredArray = _.filter(UniqueArraybyId(searchResults ,"name"), function(item) {
      return _.like(searchedString, item.name);
    });
    return filteredArray;
  },

 

  searchLocationOnSensis(text, suburb, subdomain) {
    return performSensisSearch(text, null, suburb, subdomain);
  }

});

function fetchLocationsFromDb(sensisLocationArray) {
  return sensisLocationArray.map((loc) => {
    let dbLoc = {};
    if (getSubdomain() && dynamicCollections[getSubdomain()+'_location_dev']) {
      dbLoc =  dynamicCollections[getSubdomain()+'_location_dev'].findOne({name: {'$regex': loc.name, '$options':'i'}});
    } else {
       dbLoc = LocationDev.findOne({name: {'$regex': loc.name, '$options':'i'}});
    }
    // fetching markers for matched locations
    if (dbLoc) {
      let refData = null
      if (dbLoc.location_ref=='custom_location') {
        if (getSubdomain() && dynamicCollections[getSubdomain()+'_custom_location']) {
          refData =  dynamicCollections[getSubdomain()+'_custom_location'].findOne({_id: dbLoc.location_ref_id});
        } else {
          refData = CustomLocation.findOne({_id: dbLoc.location_ref_id});
        }
      }
      if (dbLoc.location_ref=='location_data') {
        if (getSubdomain() && dynamicCollections[getSubdomain()+'_location_data']) {
          refData =  dynamicCollections[getSubdomain()+'_location_data'].findOne({_id: dbLoc.location_ref_id});
        } else {
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
    Logger.log({action: `${Meteor.settings.public.userAppActions.sensisQuery}`, context: `${url}`});
    // let response = HTTP.get(url);

    // if(response.data && (response.data.code==400 || response.data.code==404)){
    //   return [];
    // }
    let response = getCompletePaginationData(url);
    Logger.log({action: `${Meteor.settings.public.userAppActions.sensisResult}`, context: `${response.length}`})
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
  if (getSubdomain() && dynamicCollections[getSubdomain()+'_location_status']) {
    locationStatusRecords = dynamicCollections[getSubdomain()+'_location_status'].find({}).fetch();
  } else {
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
  if (getSubdomain() && dynamicCollections[getSubdomain()+'_location_coords']) {
    newLocationCoords = dynamicCollections[getSubdomain()+'_location_coords'].find({location: { $in: names } }).fetch();
  } else {
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
