// Methods related to Menus and their contents
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { EventDev } from './event_dev.js';
import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

// import xml2json from 'xml2json';
// var convert = require('xml-to-json-promise');
import Future from 'fibers/future';

Meteor.methods({
  'EventDev.insert'(newEvent, eventId) {
    check(newEvent, Object);
    if(!eventId){
      newEvent["createdAt"] = new Date()
      if(getSubdomain())
      {
        return dynamicCollections[getSubdomain()+'_event_dev'].insert(newEvent);
      }
      else {
        return EventDev.insert(newEvent);
      }
    }
    else{
      newEvent["updatedAt"] = new Date()

         if(getSubdomain())
         {
           dynamicCollections[getSubdomain()+'_event_dev'].update({'_id': eventId},
              { $set: newEvent });
         }
         else {
           EventDev.update({'_id': eventId},
              { $set: newEvent });
         }
      return eventId
    }
  },

  'EventDev.update'(eventId, newEventObject) {
    check(newEventObject, Object);
    if(getSubdomain())
    {
      return dynamicCollections[getSubdomain()+'_event_dev'].update({ '_id': eventId},
        { $set: newEventObject });
    }
    else {
      return EventDev.update({ '_id': eventId},
        { $set: newEventObject });
    }
  },

  'events.getName'(ids) {
    check(ids, Array);
    let event;
    if(getSubdomain())
    {
        event = dynamicCollections[getSubdomain()+'_event_dev'].find(
        { _id: { $in: ids } },
      ).fetch();
    }
    else {
      event = EventDev.find(
        { _id: { $in: ids } },
      ).fetch();
    }
    return event[0].name;
  },

  'events.search' (eventName, userId) {
    let future = new Future();
    let settings = {};
    if(getSubdomain())
    {
        settings = dynamicCollections[getSubdomain()+'_admin_settings'].findOne({userId: userId});
    }
    else {
    settings = AdminSettings.findOne({userId: userId});
    }
    if(settings && settings.rssFeedLive && settings.rssFeedLive.link){
      var parseString = require('xml2js').parseString;

      try {
          let result =  HTTP.get(settings.rssFeedLive.link);

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
                      // console.log(':: err - ',err);
                      // console.log(':: result - ',result.rss.channel.item);
                      let item = _.filter(result.rss.channel.item, (term)=>{
                        console.log(":: term - > ",term.title.toLowerCase());
                        console.log(":: string - > ",eventName.toLowerCase());
                        console.log(":: is Matched ? - > ",term.title.toLowerCase().includes(eventName.toLowerCase()));

                        return term.title.toLowerCase().includes(eventName.toLowerCase());
                      });
                      future.return(item);
                  });
              }
          }
      } catch (error) {
          console.log(":: events.search > error - ",error);
          throw new Meteor.Error('No result found for this RSS Feed.');
      }
    }
    Logger.log({action: `${Meteor.settings.public.userAppActions.localQuery} ${JSON.stringify({name:eventName})}`});
    Logger.log({action: `${Meteor.settings.public.userAppActions.localResult} ${EventDev.find({name:eventName}).fetch().length}`});
    let result = future.wait()?future.wait():[];
    return result;
  }
});
