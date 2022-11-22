import './settings.html';
import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain,getCookie } from '/imports/startup/both/global_function.js';
Template.settingsModal.onCreated(function adminOnCreated() {
	Meteor.subscribe('admin_settings.all',getCookie("selectedSDForSA"));
    this.isSpinner = new ReactiveVar(false);
});


Template.settingsModal.onRendered(function() {
    require('./settings.css');
});


Template.settingsModal.helpers({
	adminSettings(){
        let adminSetting = {};
		let adminSettingData = {
            cacheRefreshTime: '',
            suburb: '',
            rssFeed: {
                link: '',
                syncedAt: ''
            },
            rssFeedLive: {
                link: ''
            },
            atdw: {
                baseUrl: '',
                key: '',
                numberOfRecordsPerPage:10
            },
            displaySettings: {
                callButtonOnLocationListModal: true
            },
            kioskUser:{
                screenSaverTimer: 30000
            },
            advertisement:{
                slideChangeTime: 7000
            },
        };
		if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
	       adminSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getSubdomain(getCookie("selectedSDForSA")) });
	    } else {
	       adminSetting = AdminSettings.findOne({ subDomain: 'doublebay' });
	    }
        /*let suburb = adminSetting && adminSetting.suburb ? adminSetting.suburb : undefined;
        if(suburb){
            adminSetting['suburb'] = suburb;
            // adminSetting['suburb'] = removePlus(suburb);
        }*/

        if (adminSetting) {
            adminSettingData.cacheRefreshTime = adminSetting.cacheRefreshTime || '';
            adminSettingData.suburb = adminSetting.suburb || '';
            if (adminSetting.rssFeed) {
                adminSettingData.rssFeed.link = adminSetting.rssFeed.link || '';
                adminSettingData.rssFeed.syncedAt = adminSetting.rssFeed.syncedAt || '';
            }
            if (adminSetting.rssFeedLive) {
                adminSettingData.rssFeedLive.link = adminSetting.rssFeedLive.link || '';
            }
            if (adminSetting.atdw) {
                adminSettingData.atdw.baseUrl = adminSetting.atdw.baseUrl || '';
                adminSettingData.atdw.key = adminSetting.atdw.key || '';
                adminSettingData.atdw.numberOfRecordsPerPage = adminSetting.atdw.numberOfRecordsPerPage || 10;
                adminSettingData.atdw.numberOfDaysForEvents = adminSetting.atdw.numberOfDaysForEvents || 10;
            }
            if (adminSetting.displaySettings) {
                adminSettingData.displaySettings.callButtonOnLocationListModal = adminSetting.displaySettings.callButtonOnLocationListModal || true;
            }
            if (adminSetting.displayMultiLanguageButton) {
                adminSettingData.displayMultiLanguageButton = adminSetting.displayMultiLanguageButton || false;
            }
            if (adminSetting.kioskUser) {
                adminSettingData.kioskUser.screenSaverTimer = adminSetting.kioskUser.screenSaverTimer || 30000;
            }
            if (adminSetting.advertisement) {
                adminSettingData.advertisement.slideChangeTime = adminSetting.advertisement.slideChangeTime || 7000;
            }
        }
        // console.log("adminSetting ===> ",adminSettingData)
        return adminSettingData;
	},
    sliderImages() {
        let adminSetting = {};
        if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
           adminSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getSubdomain(getCookie("selectedSDForSA")) });
        } else {
           adminSetting = AdminSettings.findOne({ subDomain: 'doublebay' });
        }
        if (adminSetting && adminSetting.kioskUser && adminSetting.kioskUser.sliderImages)
            return adminSetting.kioskUser.sliderImages;

        return [];
    },
    pageLoading () {
        return Template.instance().isSpinner.get();
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
                // console.log('error', error);
            }
        });
    },
    'change #atdwBaseUrl' (event, inst) {
        const regex = /https/;
        let atdwBaseUrl = $('#atdwBaseUrl').val();
        if (atdwBaseUrl && !regex.test(atdwBaseUrl)) {
             Bert.alert({
                title: 'Error',
                message: "Please provide 'https' url.",
                type: "danger",
                style: 'growl-top-right',
                icon: 'fa-check',
            });
        }
    },
    'submit #updateSettingsForm'(event, inst){
        event.preventDefault();
        let atdwBaseUrl = $('#atdwBaseUrl').val();
        const regex = /https/;
        if (atdwBaseUrl && !regex.test(atdwBaseUrl)) {
            Bert.alert({
                title: 'Error',
                message:  "Please provide 'https' url.",
                type: "danger",
                style: 'growl-top-right',
                icon: 'fa-check',
            });
        } else {
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
            if(atdwBaseUrl){
                setFields['atdw.baseUrl'] = atdwBaseUrl;
            }
            let atdwKey = $('#atdwKey').val();
            if(atdwKey){
                setFields['atdw.key'] = atdwKey;
            }
            let atdwPageSize = $('#atdwPageSize').val();
            if(atdwPageSize){
                setFields['atdw.numberOfRecordsPerPage'] = atdwPageSize;
            }
            let atdwEventsDays = $('#atdwEventsDays').val();
            if(atdwEventsDays){
                setFields['atdw.numberOfDaysForEvents'] = atdwEventsDays;
            }
            let kioskScreenSaver = $('#kioskScreenSaver').val();
            if(kioskScreenSaver){
                setFields['kioskUser.screenSaverTimer'] = parseInt(kioskScreenSaver);
            }
            let slideChangeTime = $('#slideChangeTime').val();
            if(slideChangeTime){
                setFields['advertisement.slideChangeTime'] = parseInt(slideChangeTime);
            }
            setFields['displaySettings.callButtonOnLocationListModal'] = $('#location_list_call_button').is(":checked");
            setFields['displayMultiLanguageButton'] = $('#multi_language_button').is(":checked");

            if(setFields && Object.keys(setFields).length>0){
                Meteor.call('AdminSettings.update', setFields, getCookie("selectedSDForSA"), (error, result) => {
                    if (error) {
                        // console.log('error', error);
                    } else {
                        Bert.alert({
                            title: 'Succcess',
                            message:  "Update successfully",
                            type: "success",
                            style: 'growl-top-right',
                            icon: 'fa-check',
                        });
                        $('#settingsModal').modal('close');
                    }
                });
            }
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
                type: 'danger',
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
                        type: 'danger',
                        style: 'growl-top-right',
                        icon: 'fa-info',
                    });
                    return;
                }
                Session.set('showLoading',false);
            });
        }
    },
    'change #sliderImages' (event) {
        const instance = Template.instance();
        instance.isSpinner.set(true);
        let isValid = validateFile('sliderImages');
        if(!isValid){
            Bert.alert({
                title: 'Ups...',
                message: 'Only image files are allowed.',
                type: 'info',
                style: 'growl-top-right',
                icon: 'fa-info',
            });
            instance.isSpinner.set(false);
        } else {
            uploadFile('sliderImages').then(function(imgPath){
                if(imgPath){
                    Meteor.call('AdminSettings.uploadImage', imgPath, getCookie("selectedSDForSA"), (err) => {
                        if (err) {
                            Bert.alert({
                                title: 'Ups...',
                                message: 'Image not uploading',
                                type: 'warning',
                                style: 'growl-top-right',
                                icon: 'fa-warning',
                            });
                        } else {
                            Bert.alert({
                                title: 'Succcess',
                                message:  "Image Upload successfully",
                                type: "success",
                                style: 'growl-top-right',
                                icon: 'fa-check',
                            });
                        }
                        instance.isSpinner.set(false);
                    }); 
                }
            });
        }
    },
    'click .dtImages' (event) {
        event.preventDefault();
        const instance = Template.instance();
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this imaginary file!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
        }, (willDelete) => {
            if (willDelete) {
                
                const imagePath = this.toString();
                const bucket = "envent.ly"
                const imageName = imagePath.replace(`https://s3-ap-southeast-2.amazonaws.com/${bucket}`, '');
                instance.isSpinner.set(true);
                deleteImage(imageName, imagePath, instance);
            }
        });
    }
});

function validateFile(id){
    let file = $(`#${id}`)[0].files;
    let regex = /[^.]+$/;
    let allowedExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'svg'];
    let isValidFile = false;
    // console.log("check name ",file[0].name)
    // console.log("test ",allowedExtension.indexOf(regex.exec(file[0].name)[0]))
    if (allowedExtension.indexOf(regex.exec(file[0].name)[0]) > -1) {
        isValidFile = true;
    }
    
    return isValidFile;
  }

function uploadFile(id){
    const q  = require('q');
    let d = q.defer();
    let file = $(`#${id}`)[0].files;
    // console.log("files Name", file)
    if(file){
        S3.upload({
                files:file,
                path:"subfolder"
            },function(e,r){
                if(e){
                    d.reject(e);
                }else{
                    d.resolve(r.secure_url);
                }
        });
    }else{
        d.resolve(instanceValue);
    }
    return d.promise;
}


function deleteImage(imageName, imagePath, instance) {
    S3.delete(imageName, function(err, result) {
        if (err) {
            Bert.alert({
                title: 'Ups...',
                message: 'Image not deleting',
                type: 'warning',
                style: 'growl-top-right',
                icon: 'fa-warning',
            });
            instance.isSpinner.set(false);
        } else {
            Meteor.call('AdminSettings.deleteSliderImage', imagePath, getSubdomain(getCookie("selectedSDForSA")), (error, result)=>{
                if (error) {
                    Bert.alert({
                        title: 'Ups...',
                        message: 'Image not deleting',
                        type: 'warning',
                        style: 'growl-top-right',
                        icon: 'fa-warning',
                    });
                } else {
                   Bert.alert({
                        title: 'Succcess',
                        message:  "Image Delete successfully",
                        type: "success",
                        style: 'growl-top-right',
                        icon: 'fa-check',
                    });
                }
                instance.isSpinner.set(false);
            });
        }
    });
}


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
