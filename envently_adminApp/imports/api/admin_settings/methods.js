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
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_admin_settings']) {
          dynamicCollections[getSubdomain(sd)+'_admin_settings'].upsert({ subDomain: sd }, { $set: setFields },{multi:true});
        } else {
          AdminSettings.upsert({ subDomain: sd }, { $set: setFields },{multi:true});
        }
    },
    'AdminSettings.uploadImage' (imagePath, sd) {
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_admin_settings']) {
          dynamicCollections[getSubdomain(sd)+'_admin_settings'].update({ subDomain: sd }, { $push: {'kioskUser.sliderImages': imagePath} },{multi:true});
        } else {
          AdminSettings.update({ subDomain: sd }, { $push: {'kioskUser.sliderImages': imagePath} },{multi:true});
        }
    },
    'AdminSettings.deleteSliderImage' (imagePath, sd) {
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_admin_settings']) {
            dynamicCollections[getSubdomain(sd)+'_admin_settings'].update({ subDomain: sd }, {
                $pull: {
                    'kioskUser.sliderImages': {
                        $in: [ imagePath]
                    }
                }
            },{
                multi: true
            });
        } else {
            AdminSettings.update({ subDomain: sd }, {
                $pull: {
                    'kioskUser.sliderImages': {
                        $in: [ imagePath]
                    }
                }
            },{
                multi: true
            });
        }
    },
    'AdminSettings.updateCacheRefreshTime' (cacheRefreshTime,sd) {
        if (!cacheRefreshTime) {
            return;
        }
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_admin_settings']) {
          dynamicCollections[getSubdomain(sd)+'_admin_settings'].upsert({ userId: Meteor.userId() }, { $set: { cacheRefreshTime: cacheRefreshTime, updatedAt: new Date() } });
        } else {
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
        if (getSubdomain() && dynamicCollections[getSubdomain()+'_admin_settings']){
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
        if (getSubdomain() && dynamicCollections[getSubdomain()+'_admin_settings']) {
          dynamicCollections[getSubdomain()+'_admin_settings'].insert(adminSetting);;
        } else {
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
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_admin_settings']) {
          status = dynamicCollections[getSubdomain(sd)+'_admin_settings'].update({subDomain: sd}, { $set: settingObj}, {upsert: true}, {multi: true});
        } else {
          status = AdminSettings.update({userId: Meteor.userId()}, { $set: settingObj}, {upsert: true});
        }
        return status;
    },
    'AdminSettings.details' (sd){
        console.log("------ AdminSettings.details Method call --------");
      if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_admin_settings']) {
        //console.log(sd," sub Domain::::::::::::::::::::::::::::::::", dynamicCollections[getSubdomain(sd)+'_admin_settings'].find({subDomain: getSubdomain(sd)}).fetch())
        return dynamicCollections[getSubdomain(sd)+'_admin_settings'].findOne({subDomain: getSubdomain(sd)});
      }
      return AdminSettings.findOne({subDomain: 'doublebay'});
    },
    'AdminSettings.fetchBySubdomain' (subDomain){
      if (getSubdomain(subDomain) && dynamicCollections[getSubdomain(subDomain)+'_admin_settings']) {
        return dynamicCollections[getSubdomain(subDomain)+'_admin_settings'].findOne({subDomain: subDomain});
      }
      return AdminSettings.findOne({subDomain: 'doublebay'});

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
                          if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_event_dev']) {
                            dynamicCollections[getSubdomain(sd)+'_event_dev'].upsert({ name:item.title }, { $set: { website:item.link, details1:item.description, updatedAt:new Date() }});
                          } else {
                            EventDev.upsert({ name:item.title }, { $set: { website:item.link, details1:item.description, updatedAt:new Date() }});
                          }
                        });
                        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_admin_settings']) {
                          return dynamicCollections[getSubdomain(sd)+'_admin_settings'].upsert({userId: Meteor.userId()}, {$set:{rssFeed:{link:url, syncedAt:new Date()}}});
                        } else {
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
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_admin_settings']) {
         dynamicCollections[getSubdomain(sd)+'_admin_settings'].upsert({ userId: userId }, { $addToSet: { adminIps: this.connection.clientAddress }});
        } else {
          AdminSettings.upsert({ userId: userId }, { $addToSet: { adminIps: this.connection.clientAddress }});
        }
    },
    deleteAdminIp(userId,sd){
        if(!userId) return
        if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_admin_settings']) {
         dynamicCollections[getSubdomain(sd)+'_admin_settings'].upsert({ userId: userId }, { $pull: { adminIps: this.connection.clientAddress }},{multi:true});
        } else {
          AdminSettings.upsert({ userId: userId }, { $pull: { adminIps: this.connection.clientAddress }},{multi:true});
        }
    },
    matchUserAppIp(subDomain){
        if(!subDomain) return false;
        if (subDomain == "admin") return true;
        if (getSubdomain() && dynamicCollections[getSubdomain()+'_admin_settings']) {
          return dynamicCollections[getSubdomain()+'_admin_settings'].findOne({ subDomain: subDomain, adminIps: { $in: [this.connection.clientAddress] } })?true:false;
        } else {
          return AdminSettings.findOne({ subDomain: subDomain, adminIps: { $in: [this.connection.clientAddress] } })?true:false;
        }
    },

    mainImageUrlDelete(deletedFieldInDB, sd) {
        console.log('deletedFieldInDB',deletedFieldInDB)
          if (getSubdomain(sd) && dynamicCollections[getSubdomain(sd)+'_admin_settings']) {
            dynamicCollections[getSubdomain(sd)+'_admin_settings'].update({ subDomain: sd }, {$unset: {[deletedFieldInDB]: ''} } );
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
