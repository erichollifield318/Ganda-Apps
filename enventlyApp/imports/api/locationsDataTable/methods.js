import { Meteor } from 'meteor/meteor';
import { LocationStatus } from './locationStatus.js';
import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { CustomLocation } from '/imports/api/custom_location/custom_location';
import { LocationData } from '/imports/api/location_data/location_data';
import { LocationDev } from '/imports/api/location_dev/location_dev';
import { CacheDev } from '/imports/api/cache_dev/cache_dev';
import { LocationCoords } from '/imports/api/locationCoords/locationCoords';
import { Categories } from '/imports/api/categories/categories';
import { MenuItemDev } from '/imports/api/menu_item_dev/menu_item_dev';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.methods({
  'LocationStatus.insert' (fields) {
    console.log(":: LocationStatus Insert fields - ", fields);
  },

  'getAllLocations' (sd) {
    this.unblock();

    // Get Location Records
    let locationDevRecords;
    if(getSubdomain(sd))
    {
    locationDevRecords =  dynamicCollections[getSubdomain(sd)+'_location_dev'].aggregate([
      {
        $lookup:{
          from:"location_data",
          localField:"location_ref_id",
          foreignField:"_id",
          as:"location_data"
        }
      },
      {
        $lookup:{
          from:"custom_location",
          localField:"location_ref_id",
          foreignField:"_id",
          as:"custom_location"
        }
      },
    ]);
    }
    else {
      locationDevRecords = LocationDev.aggregate([
        {
          $lookup:{
            from:"location_data",
            localField:"location_ref_id",
            foreignField:"_id",
            as:"location_data"
          }
        },
        {
          $lookup:{
            from:"custom_location",
            localField:"location_ref_id",
            foreignField:"_id",
            as:"custom_location"
          }
        },
      ]);
    }
    /*locationDevRecords = locationDevRecords.map(function(elem){
      var menu = MenuItemDev.findOne({'items.custom_locations': { $in: [elem._id] }}, {fields: {'items.$': 1, name: 1}});
      if(menu){
          elem.mainMenu = menu.name;
          elem.subMenu = menu.items[0].name;
      }
      return elem;
    });
*/
    console.log(":: locationDevRecords ======= > ",locationDevRecords.length);

    return locationDevRecords;
  },

  'changeLocationStatus' (location,sd) {
    console.log(":: Changing Location Status - ",location);
  	let locationId = location.aboutId?location.aboutId:location._id.valueOf();
  	updateLocationStatus(location.isApproved, locationId,sd);
  },

	'deleteBusinessLocation' (location) {
  	console.log(":: deleteBusinessLocation - ",location);
  	let locationId = location.aboutId?location.aboutId:location._id.valueOf();
  	console.log(":: location id - ",locationId);
  	if (location && location.type==='Custom Location' && location.location_ref==='custom_location') {
			let locationDevStatus;
			let customLocationStatus;
      if(getSubdomain())
      {
      locationDevStatus = dynamicCollections[getSubdomain()+'_location_dev'].remove({ _id: location._id });
      }
      else {
        locationDevStatus = LocationDev.remove({ _id: location._id });
      }
      if(getSubdomain())
      {
      customLocationStatus = dynamicCollections[getSubdomain()+'_custom_location'].remove({ _id: location.location_ref_id });
      }
      else {
        customLocationStatus = CustomLocation.remove({ _id: location.location_ref_id });
      }
			console.log(":: locationDevStatus ",locationDevStatus);
			console.log(":: customLocationStatus ",customLocationStatus);

		} else if (location && location.type==='Sensis Location' && location.location_ref==='location_data') {
			let locationDevStatus;
			let locationDataStatus;
      if(getSubdomain())
      {
      locationDevStatus =  dynamicCollections[getSubdomain()+'_location_dev'].remove({ _id: location._id });
      }
      else {
        locationDevStatus = LocationDev.remove({ _id: location._id });
      }
      if(getSubdomain())
      {
      locationDataStatus =  dynamicCollections[getSubdomain()+'_location_data'].remove({ _id: location.location_ref_id });
      }
      else {
        locationDataStatus = LocationData.remove({ _id: location.location_ref_id });
      }
			console.log(":: locationDevStatus ",locationDevStatus);
			console.log(":: locationDataStatus ",locationDataStatus);

		} else {
  		let cacheDevStatus;
      if(getSubdomain())
      {
      cacheDevStatus =  dynamicCollections[getSubdomain()+'_cache_dev'].remove({ _id: location._id });
      }
      else {
        cacheDevStatus = CacheDev.remove({ _id: location._id });
      }
			console.log(":: cacheDevStatus ",cacheDevStatus);

		}

  	let locationStatus;
    if(getSubdomain())
    {
    locationStatus =  dynamicCollections[getSubdomain()+'_location_status'].remove({locationId: locationId});
    }
    else {
      locationStatus = LocationStatus.remove({locationId: locationId});
    }
		console.log(":: locationStatus - ",locationStatus);
	},

  'updateBusinessLocation' (location, userId,sd) {
    console.log(":: Location record we are going to update - > ",location);

    let locationAdditionalObj = {};
    if(location.newFields.text1)
      locationAdditionalObj.text1 = location.newFields.text1;
    if(location.newFields.text2)
      locationAdditionalObj.text2 = location.newFields.text2;
    if(location.newFields.image1)
      locationAdditionalObj.image1 = location.newFields.image1;
    if(location.newFields.image2)
      locationAdditionalObj.image2 = location.newFields.image2;
    if(location.newFields.sensisID)
      locationAdditionalObj.sensisID = location.newFields.sensisID;

    locationAdditionalObj.createdAt = new Date();

    let dbLocations = [];
    if(getSubdomain(sd))
    {
    dbLocations = dynamicCollections[getSubdomain(sd)+'_location_dev'].find({_id: location._id}).fetch();
    }
    else {
      dbLocations = LocationDev.find({_id: location._id}).fetch();
    }

    if (dbLocations && dbLocations.length) {
      console.log(":: Location already exists going to update this one.");
      dbLocations.forEach((loc, i)=>{
        // location is already present in db, just update this location
        console.log(":: Updating location ",i," = ",loc);
        if (loc && loc.location_ref==='custom_location') {
          console.log(":: Going to updated custom location ");
          let locationDevStatus;
            if(getSubdomain(sd))
            {
            locationDevStatus = dynamicCollections[getSubdomain(sd)+'_location_dev'].update(
              { _id: loc._id },
              { $set: {
                name : location.newFields.name,
                address : location.newFields.address,
                phone : location.newFields.phone,
                website : location.newFields.website,
                categories : location.newFields.categories,
              }});
            }
            else {
              locationDevStatus = LocationDev.update(
                { _id: loc._id },
                { $set: {
                  name : location.newFields.name,
                  address : location.newFields.address,
                  phone : location.newFields.phone,
                  website : location.newFields.website,
                  categories : location.newFields.categories,
                }});
            }
          console.log(":: locationDevStatus --- > ",locationDevStatus);
          let customLocationStatus;
            if(getSubdomain(sd))
            {
            customLocationStatus =  dynamicCollections[getSubdomain(sd)+'_custom_location'].update(
              { _id: loc.location_ref_id },
              { $set: locationAdditionalObj });
            }
            else {
              customLocationStatus = CustomLocation.update(
                { _id: loc.location_ref_id },
                { $set: locationAdditionalObj });
            }
          console.log(":: customLocationStatus --- > ",customLocationStatus);

        } else if (loc && loc.location_ref==='location_data') {
          console.log(":: Going to updated location data");
          let locationDevStatus;
            if(getSubdomain(sd))
            {
            locationDevStatus = dynamicCollections[getSubdomain(sd)+'_location_dev'].update(
              { _id: loc._id },
              { $set: {
                name : location.newFields.name,
                address : location.newFields.address,
                phone : location.newFields.phone,
                website : location.newFields.website,
                categories : location.newFields.categories,
              }});
            }
            else {
              locationDevStatus = LocationDev.update(
                { _id: loc._id },
                { $set: {
                  name : location.newFields.name,
                  address : location.newFields.address,
                  phone : location.newFields.phone,
                  website : location.newFields.website,
                  categories : location.newFields.categories,
                }});
            }
          console.log(":: locationDevStatus --- > ",locationDevStatus);
          let locationDataStatus;
            if(getSubdomain(sd))
            {
            locationDataStatus =  dynamicCollections[getSubdomain(sd)+'_location_data'].update(
              { _id: loc.location_ref_id },
              {  $set: locationAdditionalObj });
            }
            else {
              locationDataStatus = LocationData.update(
                { _id: loc.location_ref_id },
                {  $set: locationAdditionalObj });
            }
          console.log(":: locationDataStatus --- > ",locationDataStatus);
        }
      });
    } else {
      console.log(":: Location not exists going to insert one.");
      let locationDataStatus;
      if(getSubdomain(sd))
      {
      return  dynamicCollections[getSubdomain(sd)+'_location_data'].insert(locationAdditionalObj);
      }
      else {
        locationDataStatus = LocationData.insert(locationAdditionalObj);
      }

      let locationDevStatus;
      if(getSubdomain(sd))
      {
      return  dynamicCollections[getSubdomain(sd)+'_location_dev'].insert({
        name : location.newFields.name,
        address : location.newFields.address,
        phone : location.newFields.phone,
        website : location.newFields.website,
        categories : location.newFields.categories,
        location_ref: 'location_data',
        location_ref_id: locationDataStatus,
        latitude: location.primaryAddress.latitude,
        longitude: location.primaryAddress.longitude,
        createdAt: new Date()
      });
      }
      else {
        locationDataStatus = LocationDev.insert({
          name : location.newFields.name,
          address : location.newFields.address,
          phone : location.newFields.phone,
          website : location.newFields.website,
          categories : location.newFields.categories,
          location_ref: 'location_data',
          location_ref_id: locationDataStatus,
          latitude: location.primaryAddress.latitude,
          longitude: location.primaryAddress.longitude,
          createdAt: new Date()
        });
      }
    }

  },

  'findLocationsByCategory' (catId, catName, userId,sd) {

    let settings;
    if(getSubdomain(sd))
    {
    settings =  dynamicCollections[getSubdomain(sd)+'_admin_settings'].findOne({ userId: userId });
    }
    else {
      settings = AdminSettings.findOne({ userId: userId });
    }
    let suburb = settings&&settings.suburb?settings.suburb:'';
    let subdomain = settings&&settings.subdomain?settings.subdomain:'';
    let catReqObj = {
      markerFor: 'Category',
      categories: [{id: catId, name: catName}]
    };

    let menuSubmenu = Meteor.call('getMenuSubmenuName', catReqObj);
    console.log(":: menuSubmenu ==== > ",menuSubmenu);
    console.log("***********************************************************");
    return {
      locations: performSensisSearch(catName, catId, suburb, subdomain),
      submenuName: menuSubmenu&&menuSubmenu.subMenuName?menuSubmenu.subMenuName:'',
      menuName: menuSubmenu&&menuSubmenu.menuName?menuSubmenu.menuName:'',
    }
  },

  'exportToCSV': function(data) {
    var collection = data;
    var heading = true; // Optional, defaults to true
    var delimiter = ";" // Optional, defaults to ",";
    return exportcsv.exportToCSV(collection, heading, delimiter);
  }
});

function updateLocationStatus(isApproved, locationId,sd) {
	let status;
    if(getSubdomain(sd))
    {
    status=  dynamicCollections[getSubdomain(sd)+'_location_status'].update(
      { locationId: locationId },
      { $set:
        {
          isApproved: !isApproved,
          updatedAt: new Date()
        }
      }, {
        upsert: true
      });
    }
    else {
      status = LocationStatus.update(
    		{ locationId: locationId },
    		{ $set:
    			{
    				isApproved: !isApproved,
    				updatedAt: new Date()
    			}
    		}, {
    			upsert: true
    		});
    }
	console.log(":: updateLocationStatus status - ",status);
	return status;
}

function getNewCoords(output){
  let names = _.pluck(output, 'name');
  let newLocationCoords;
  if(getSubdomain())
  {
  newLocationCoords =  dynamicCollections[getSubdomain()+'_location_coords'].find({location: { $in: names } }).fetch();
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

function performSensisSearch(query, catId, suburb, subdomain) {
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
    console.log(":: sensis search url - > ",url);
    Logger.log({action: `${Meteor.settings.public.userAppActions.sensisQuery} ${url}`});

    let response = getCompletePaginationData(url);
    Logger.log({action: `${Meteor.settings.public.userAppActions.sensisResult} ${response.length}`})
    return response;
  } catch (e) {

    if (e) {
      let content = e.response && e.response.content ? e.response.content : '';
      Logger.error({message: content, subdomain: [subdomain[0]]});
      console.log(":: exception in category search - ",JSON.stringify(e));
      return [];
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




















/*
    if (location && location.type==='Custom Location' && location.location_ref==='custom_location') {
      let locationDevStatus = LocationDev.update(
        { _id: location._id },
        { $set: {
          name : location.newFields.name,
          address : location.newFields.address,
          phone : location.newFields.phone,
          website : location.newFields.website,
          categories : location.newFields.categories,
        }});

      let customLocationStatus = CustomLocation.update(
        { _id: location.location_ref_id },
        { $set: locationAdditionalObj });
      console.log(":: locationDevStatus ",locationDevStatus);
      console.log(":: customLocationStatus ",customLocationStatus);

    } else if (location && location.type==='Custom Location' && location.location_ref==='location_data') {
      let locationDevStatus = LocationDev.update(
        { _id: location._id },
        { $set: {
          name : location.newFields.name,
          address : location.newFields.address,
          phone : location.newFields.phone,
          website : location.newFields.website,
          categories : location.newFields.categories,
        }});
      let locationDataStatus = LocationData.update(
        { _id: location.location_ref_id },
        {  $set: locationAdditionalObj });
      console.log(":: locationDevStatus ",locationDevStatus);
      console.log(":: locationDataStatus ",locationDataStatus);

    } else if (location && location.type==='Sensis Location' && location.primaryAddress && location.primaryAddress.latitude && location.primaryAddress.longitude) {
      let locationDataStatus = LocationData.insert(locationAdditionalObj);

      let locationDevStatus = LocationDev.insert(
        {
          name : location.newFields.name,
          address : location.newFields.address,
          phone : location.newFields.phone,
          website : location.newFields.website,
          categories : location.newFields.categories,
          location_ref: 'location_data',
          location_ref_id: locationDataStatus,
          latitude: location.primaryAddress.latitude,
          longitude: location.primaryAddress.longitude,
          createdAt: new Date()
        });
    } else {
      let cacheDevStatus = CacheDev.update(
        { _id: location._id },
        { $set: {
          name : location.newFields.name,
          address : location.newFields.address,
          phone : location.newFields.phone,
          website : location.newFields.website,
          categories : location.newFields.categories,
          text1: location.newFields.text1,
          text2: location.newFields.text2,
          image1: location.newFields.image1,
          image2: location.newFields.image2
        }});
      console.log(":: cacheDevStatus ",cacheDevStatus);
    }*/
