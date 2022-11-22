import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { CacheDev } from './cache_dev.js';
import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { getSubdomain} from '/imports/startup/both/global_function.js';
Meteor.methods({
    'CacheDev.getLocationInfo' (searchObject) {
        check(searchObject, Object);
      	var query = {};
      	if(searchObject.query){
      		query['name'] = {'$regex':searchObject.query, '$options':'i'};
      	}
      	if(searchObject.suburb){
      		query['primaryAddress.suburb'] = searchObject.suburb;
      	}
        var locationInfo = {}
        if(getSubdomain())
        {
         locationInfo = dynamicCollections[getSubdomain()+'_cache_dev'].findOne(query);
        }
        else {
          locationInfo = CacheDev.findOne(query);
        }
        if (locationInfo) {
            return locationInfo;
        } else {
            return findSensisLocation(searchObject)
        }
    },

    'CacheDev.remove' (filter,sd) {
        var removed;
        if(getSubdomain(sd))
        {
        removed = dynamicCollections[getSubdomain(sd)+'_cache_dev'].remove(filter)
        }
        else {
          removed = CacheDev.remove(filter);
        }
    },
});

function findSensisLocation(searchObject) {
    let searchParams = '';
    for (var index in searchObject) {
        searchParams += '&' + index + '=' + searchObject[index];
    }
    var url = undefined;
    if (Meteor.settings.public.isLocal) {
        url = Meteor.settings.public.devSensisUrl + 'search?key=' + Meteor.settings.public.devSensisKey + searchParams
    } else {
        url = Meteor.settings.public.prodSensisUrl + 'search?key=' + Meteor.settings.public.prodSensisKey + searchParams
    }
    url+=getSuburbValue();
    // url += '&suburb=Double+Bay+NSW';
    Logger.log({action: `${Meteor.settings.public.userAppActions.sensisQuery} ${url}`});
    var result = HTTP.get(url);
    var data = result.data;
    if (data.code != 200) {
        throw new Meteor.Error(data.message);
    }
    result = data.results && data.results.length ? data.results[0] : undefined;
    if (!result) {
        throw new Meteor.Error('No Data Found using sensis api...');
    }
    Logger.log({action: `${Meteor.settings.public.userAppActions.sensisResult} ${data.results.length}`});
    console.log(":: search results - > ",data.results);
    insertToCacheDev(data.results);
    return result;
}

function insertToCacheDev(cacheRecords) {
    if (!cacheRecords) {
        return;
    }
    if (!Array.isArray(cacheRecords)) {
        cacheRecords = [cacheRecords];
    }
    console.log(":: cacheRecords - > ",cacheRecords," ==== ",cacheRecords[0].categories," ==== ",cacheRecords[0].primaryContacts);
    cacheRecords.forEach((cacheRecord)=>{
        cacheRecord['createdAt'] = new Date();
        console.log(":: cacheRecord - > ",cacheRecord);
	    // CacheDev.insert(cacheRecord);
	});
}

function getSuburbValue(){
    let adminSetting = {};
    if(getSubdomain())
    {
    adminSetting = dynamicCollections[getSubdomain()+'_admin_settings'].findOne({ userId: Meteor.userId() });
    }
    else {
      adminSetting = AdminSettings.findOne({ userId: Meteor.userId() });
    }
    if (adminSetting && adminSetting.suburb) {
        return adminSetting.suburb;
    }else{
        return '';
    }
}
