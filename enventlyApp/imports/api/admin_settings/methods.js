// Methods related to Menus and their contents
import { Meteor } from 'meteor/meteor';
// import { check, Match } from 'meteor/check';
import { AdminSettings } from './admin_settings.js';
import { EventDev } from '/imports/api/event_dev/event_dev.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.methods({
    'AdminSettings.update'(setFields,sd) {
        setFields['updatedAt'] = new Date();
        console.log(getSubdomain(sd),':=== ',sd)
        if(getSubdomain(sd))
        {
          dynamicCollections[getSubdomain(sd)+'_admin_settings'].upsert({ userId: Meteor.userId() }, { $set: setFields })
        }
        else {
          AdminSettings.upsert({ userId: Meteor.userId() }, { $set: setFields })
        }
    },

    'AdminSettings.updateCacheRefreshTime' (cacheRefreshTime,sd) {
        if (!cacheRefreshTime) {
            return;
        }
        if(getSubdomain(sd))
        {
          dynamicCollections[getSubdomain(sd)+'_admin_settings'].upsert({ userId: Meteor.userId() }, { $set: { cacheRefreshTime: cacheRefreshTime, updatedAt: new Date() } }
          )
        }
        else {
          AdminSettings.upsert({ userId: Meteor.userId() }, { $set: { cacheRefreshTime: cacheRefreshTime, updatedAt: new Date() } }
          )
        }

        let cronName = 'CacheDev-'+Meteor.userId()
        SyncedCron.remove(cronName);
        cronName = 'CacheDev-'+Meteor.userId()
        cronCreate(cacheRefreshTime, cronName,sd);
        SyncedCron.start();     // this require to call from one place only, otherwise called cron multiple times.
    },

    'AdminSettings.isUserExists' () {
        let isSettingsExists = AdminSettings.findOne({ userId: Meteor.userId() });
        if(getSubdomain())
        {
          isSettingsExists = dynamicCollections[getSubdomain()+'_admin_settings'].findOne({ userId: Meteor.userId() });
        }

        if (isSettingsExists) {
            return;
        }
        // Create default settings for user
        let subDomain = 'doublebay';
        if(this.user&&this.user.roles.length) subDomain = this.user.roles[0]
        let adminSetting = {
            cacheRefreshTime: 7,
            userId: this.userId,
            subDomain: subDomain,
            createdAt: new Date()
        }
        if(Meteor.user() && Meteor.user().roles && Meteor.user().roles.length>0){
            adminSetting['subDomain'] = Meteor.user().roles[0];
        }
        if(getSubdomain())
        {
          dynamicCollections[getSubdomain()+'_admin_settings'].insert(adminSetting);;
        }
        else {
          AdminSettings.insert(adminSetting);
        }
        let cronName = 'CacheDev-'+Meteor.userId();
        cronCreate(7, cronName);
        SyncedCron.start();     // this require to call from one place only, otherwise called cron multiple times.
    },
    'AdminSettings.updateGeoFence'(geoFenceObj,sd){
        let settingObj = {
            'geoFence.zoomLevel': geoFenceObj.zoom,
            'geoFence.shape': geoFenceObj.shape,
            'geoFence.defaultCords': geoFenceObj.point,
            userId: Meteor.userId(),
            updateAt: new Date()
        }
        if(Meteor.user() && Meteor.user().roles.length){
            settingObj.subDomain = Meteor.user().roles[0]
        }

        let status;
        if(getSubdomain(sd))
        {
          status = dynamicCollections[getSubdomain(sd)+'_admin_settings'].update({userId: Meteor.userId()}, { $set: settingObj}, {upsert: true});
        }
        else {
          status = AdminSettings.update({userId: Meteor.userId()}, { $set: settingObj}, {upsert: true});
        }
        return status;
    },
    'AdminSettings.details' (sd){
      if(getSubdomain(sd))
      {
        return dynamicCollections[getSubdomain(sd)+'_admin_settings'].findOne({userId: Meteor.userId()});
      }
      else {
        return AdminSettings.findOne({userId: Meteor.userId()});
      }
    },
    'AdminSettings.fetchBySubdomain' (subDomain){
      if(getSubdomain())
      {
        return dynamicCollections[getSubdomain()+'_admin_settings'].findOne({subDomain: subDomain});
      }
      else {
        console.log('::===')
        return AdminSettings.findOne({subDomain: subDomain});
      }

    },
    'AdminSettings.upsertEventsOnRSSFeed'(url,sd){
        try{
            let result =  HTTP.get(url);
            if(result.statusCode!=200){
                throw new Meteor.Error('No result found for this RSS Feed.');
            }else{
                if(!result.content){
                    throw new Meteor.Error('No result found for this RSS Feed.');
                }else{
                    const xml2json = require('xml2json');
                    let jsonData = xml2json.toJson(result.content, { object: true });
                    if(jsonData && jsonData.rss && jsonData.rss.channel && jsonData.rss.channel.item && jsonData.rss.channel.item.length>0){
                        let items = jsonData.rss.channel.item;
                        items.map(function(item, index) {
                          if(getSubdomain(sd))
                          {
                            dynamicCollections[getSubdomain(sd)+'_event_dev'].upsert({ name:item.title }, { $set: { website:item.link, details1:item.description, updatedAt:new Date() }});
                          }
                          else {
                            EventDev.upsert({ name:item.title }, { $set: { website:item.link, details1:item.description, updatedAt:new Date() }});
                          }
                        });
                        if(getSubdomain(sd))
                        {
                          return dynamicCollections[getSubdomain(sd)+'_admin_settings'].upsert({userId: Meteor.userId()}, {$set:{rssFeed:{link:url, syncedAt:new Date()}}});
                        }
                        else {
                          AdminSettings.upsert({userId: Meteor.userId()}, {$set:{rssFeed:{link:url, syncedAt:new Date()}}});
                        }

                    }else{
                        throw new Meteor.Error('No result found for this RSS Feed.');
                    }
                }
            }
        }catch(error){
            throw new Meteor.Error('No result found for this RSS Feed.');
        }
    },
    saveAdminIp(userId,sd){
        if(!userId) return
        if(getSubdomain(sd))
        {
         dynamicCollections[getSubdomain(sd)+'_admin_settings'].upsert({ userId: userId }, { $addToSet: { adminIps: this.connection.clientAddress }});
        }
        else {
          AdminSettings.upsert({ userId: userId }, { $addToSet: { adminIps: this.connection.clientAddress }});
        }
    },
    deleteAdminIp(userId,sd){
        if(!userId) return
        if(getSubdomain(sd))
        {
         dynamicCollections[getSubdomain(sd)+'_admin_settings'].upsert({ userId: userId }, { $pull: { adminIps: this.connection.clientAddress }},{multi:true});
        }
        else {
          AdminSettings.upsert({ userId: userId }, { $pull: { adminIps: this.connection.clientAddress }},{multi:true});
        }
    },
    matchUserAppIp(subDomain){
        if(!subDomain) return false;
        if (subDomain == "admin") return true;
        if(getSubdomain())
        {
          return dynamicCollections[getSubdomain()+'_admin_settings'].findOne({ subDomain: subDomain, adminIps: { $in: [this.connection.clientAddress] } })?true:false;
        }
        else {
          return AdminSettings.findOne({ subDomain: subDomain, adminIps: { $in: [this.connection.clientAddress] } })?true:false;
        }
    }
});

function cronCreate(cacheRefreshTime, name,sd){
    //create cron for user
    SyncedCron.add({
        name: name,
        schedule: function(parser) {
            // parser is a later.parse object
            var text = undefined;
            if (Meteor.settings.public.isLocal) {
                var text = 'every '+cacheRefreshTime+' mins'
            } else {
                var text = 'every '+cacheRefreshTime+' days'
            }
            return parser.text(text);
        },
        job: function() {
            var days = cacheRefreshTime;
            var date = new Date();
            var res = date.setTime(date.getTime() - (days * 24 * 60 * 60 * 1000));
            date = new Date(res);
            Meteor.call('CacheDev.remove', { createdAt: { $lt: date } },sd)
        }
    });
}
