import { Meteor } from 'meteor/meteor';
// import { check, Match } from 'meteor/check';
import { RouteLocations } from './routeLocations.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';
Meteor.methods({
    'RouteLocations.update'(setFields, userId) {
        setFields['updatedAt'] = new Date();
        if(getSubdomain())
        {
          dynamicCollections[getSubdomain()+'_routeLocations'].upsert({ userId: userId }, { $set: setFields });
        }
        else {
          RouteLocations.upsert({ userId: userId }, { $set: setFields });
        }
    },

    'RouteLocations.addNewMarker'(type, setFields,sd){
    	let upsertField = {};
    	let markerId = Meteor.uuid();
    	setFields["_id"] = markerId;
    	upsertField[type] = setFields;

    	let filter = { userId: Meteor.userId() }
    	if(Meteor.user() && Meteor.user().roles && Meteor.user().roles.length){
            filter['subDomain'] = Meteor.user().roles[0]
        }
      if(getSubdomain(sd))
      {
        dynamicCollections[getSubdomain(sd)+'_routeLocations'].upsert(filter, {$push: upsertField, $set:{updatedAt: new Date()}});
      }
      else {
        RouteLocations.upsert(filter, {$push: upsertField, $set:{updatedAt: new Date()}});
      }
    	return markerId;
    },

    'RouteLocations.removeMarker'(type, markerId,sd){
        let filter = { userId: Meteor.userId() }
        if(Meteor.user() && Meteor.user().roles.length){
            filter['subDomain'] = Meteor.user().roles[0]
        }
        let upsertField = {};
        upsertField[type] = {_id:markerId};
        if(getSubdomain(sd))
        {
          dynamicCollections[getSubdomain(sd)+'_routeLocations'].update(filter, {$pull: upsertField});
        }
        else {
          RouteLocations.update(filter, {$pull: upsertField});
        }
    },
});
