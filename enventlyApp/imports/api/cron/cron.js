// import { Meteor } from 'meteor/meteor';
// import { check, Match } from 'meteor/check';
// import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';

// SyncedCron.add({
//     name: 'Remove CacheDev For CacheRefreshTime',
//     schedule: function(parser) {
//         var settingsInfo = AdminSettings.find({userId: this.userId}, {fields:{cacheRefreshTime:1}, sort:{createdAt:-1}});
//         var cacheRefreshTime = settingsInfo && settingsInfo.cacheRefreshTime ? settingsInfo.cacheRefreshTime : '1';
//         var text = 'every '+cacheRefreshTime+' mins';
//         // parser is a later.parse object
//         return parser.text(text);
//     },
//     job: function() {
//         var settingsInfo = AdminSettings.find({userId: this.userId}, {fields:{cacheRefreshTime:1}, sort:{createdAt:-1}});
//         var cacheRefreshTime = settingsInfo && settingsInfo.cacheRefreshTime ? settingsInfo.cacheRefreshTime : '1';
//         var days = cacheRefreshTime;
//         var date = new Date();
//         var res = date.setTime(date.getTime() - (days * 24 * 60 * 60 * 1000));
//         // alert(res);
//         date = new Date(res);
//         // alert(date)
//         Meteor.call('CacheDev.remove', { createdAt: { $lt: date } })
//     }
// });

// SyncedCron.start();
