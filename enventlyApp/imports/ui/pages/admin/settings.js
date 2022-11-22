import './settings.html';
import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain,getCookie } from '/imports/startup/both/global_function.js';
Template.settingsModal.onCreated(function adminOnCreated() {
	Meteor.subscribe('admin_settings.all',getCookie("selectedSDForSA"));
});


Template.settingsModal.onRendered(function adminOnRendered() {
});


Template.settingsModal.helpers({
	adminSettings(){
		debugger
		let adminSetting = {};
		if(getSubdomain(getCookie("selectedSDForSA")))
	  {
	    adminSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ userId: Meteor.userId() });
	  }
	  else {
	    adminSetting = AdminSettings.findOne({ userId: Meteor.userId() });
	  }
        let suburb = adminSetting && adminSetting.suburb ? adminSetting.suburb : undefined;
        if(suburb){
            adminSetting['suburb'] = suburb;
            // adminSetting['suburb'] = removePlus(suburb);
        }
        return adminSetting;
	},

    dateFormat(timeStamp){
        if(!timeStamp){
          return 'Not synced yet';
        }
        var currentdate = new Date(timeStamp);
        var datetime = currentdate.getDate() + "/"
                  + (currentdate.getMonth()+1)  + "/"
                  + currentdate.getFullYear() + " "
                  + currentdate.getHours() + ":"
                  + currentdate.getMinutes() + ":"
                  + currentdate.getSeconds();
        return datetime;
    },
});

Template.settingsModal.events({
    'change #cacheRefreshTime'(event, inst){
        Meteor.call('AdminSettings.updateCacheRefreshTime', $('#cacheRefreshTime').val(),getCookie("selectedSDForSA"), (error, result) => {
            if (error) {
                console.log('error', error);
            }
        });
    },
    'click #updateSettings'(event, inst){
        let setFields = {};
        let suburb = $('#suburb').val()
        if(suburb){
            // setFields['suburb'] = addPlus(suburb);
            setFields['suburb'] = suburb;
        }else{
            setFields['suburb'] = '&suburb=';
        }
        let rssFeedLink = $('#rssfeed').val();
        if(rssFeedLink){
            setFields['rssFeed.link'] = rssFeedLink;
        }
        let liveRssFeedLink = $('#liveRssFeed').val();
        if(liveRssFeedLink){
            setFields['rssFeedLive.link'] = liveRssFeedLink;
        }
        if(setFields && Object.keys(setFields).length>0){
            Meteor.call('AdminSettings.update', setFields,getCookie("selectedSDForSA"), (error, result) => {
                if (error) {
                    console.log('error', error);
                }
                $('#settingsModal').modal('close');
            });
        }
    },

    'click #sync'(event, inst){
        Session.set('showLoading',true);
        let rssFeedLink = $('#rssfeed').val();
        if(!rssFeedLink){
            Session.set('showLoading',false);
            Bert.alert({
                title: 'Ups...',
                message: 'Please provide value of RSS Feed',
                type: 'info',
                style: 'growl-top-right',
                icon: 'fa-info',
            });
        }else{
            Meteor.call('AdminSettings.upsertEventsOnRSSFeed', rssFeedLink,getCookie("selectedSDForSA"), (error, result) => {
                if (error) {
                    Session.set('showLoading',false);
                    error = error.error ? error.error : error;
                    Bert.alert({
                        title: 'Ups...',
                        message: error,
                        type: 'info',
                        style: 'growl-top-right',
                        icon: 'fa-info',
                    });
                    return;
                }
                Session.set('showLoading',false);
            });
        }
    }
});

//please dont remove this functions

/*function removePlus(suburb){
    let indexOfEqual = suburb.indexOf('=');
    suburb = indexOfEqual>=0 ?  suburb.substring(indexOfEqual+1) : suburb;
    let suberbSplit = suburb.split('+');
    let suberbText = ''
    _.each(suberbSplit, function(split, index, suberbSplit) {
      suberbText+=split
      if(index<suberbSplit.length-1){
        suberbText+=' '
      }

    });
    return suberbText;
}

function addPlus(suburb){
    let suberbSplit = suburb.split(' ');
    let suberbText = '&suburb=';
    _.each(suberbSplit, function(split, index, suberbSplit) {
      suberbText+=split
      if(index<suberbSplit.length-1){
        suberbText+='+'
      }
    });
    return suberbText;
}*/
