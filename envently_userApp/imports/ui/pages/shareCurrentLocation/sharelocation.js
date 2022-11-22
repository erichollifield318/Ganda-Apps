import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { Usersdata } from '/imports/api/usersdata/usersdata.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain, getCookie } from '/imports/startup/both/global_function.js';
import './sharelocation.html';
import { MapData } from '../../components/mapbox/mapbox.js';

var modalFlag = false;
Template.sharelocation.onCreated(function() {
    const { ReactiveVar }  =  require('meteor/reactive-var');
    Meteor.subscribe('admin_settings.all',getCookie("selectedSDForSA"));
    require('./sharelocation.css');

    /* Bydefault Setting Session to null. */
    Session.set("sharelocation", {
        show: false, //Turned popup on/off.
        elName: null, //Dom element or DomName used with JQuery search param.
        eventName: null, //JQuery Event to trigger on Dom Element.
        callBackFn: null //Callback Handler to handle/call callback on after Login.
    });

    //Auto Detection.
    Tracker.autorun(()=>{
        let callBackDetails = Session.get("sharelocation");
        if(callBackDetails.show){ //If Turned True Show the Modal.
            $("#sharelocation").modal({
                complete: ()=>{
                    if(!modalFlag){ //It wasn't functionally closed so clear the session.
                        Session.set("loginTemplateCall", {
                            show: false,
                            elName: null,
                            eventName: null,
                            callBackFn: null
                        });
                    }
                }
            });
            $("#sharelocation").modal('open');

        }else{ //If Turned False, Check for Any Pending event remaining.
            if(callBackDetails.elName && callBackDetails.eventName){ //Sensitive Code.
                try{
                    $(callBackDetails.elName)[callBackDetails.eventName]();

                    if(callBackDetails.callBackFn){
                        callBackDetails.callBackFn();
                    }

                    Session.set("sharelocation", {
                        show: false,
                        elName: null,
                        eventName: null,
                        callBackFn: null
                    });
                }catch(e){
                    // console.log("== PostCallBackLoginErro ==> ",e);
                }
            }

            if(callBackDetails.callBackFn){
                callBackDetails.callBackFn();
                Session.set("sharelocation", {
                    show: false,
                    elName: null,
                    eventName: null,
                    callBackFn: null
                });
            }
        }
    });
});

Template.sharelocation.onRendered(function() {
    require('./jquery.ml-keyboard.js');
    require('./jquery.ml-keyboard.css');
    Meteor.setTimeout( function() {
        $(".slKeyboard").slKeyboard({layout: 'en_US'});
    },100);
});


Template.sharelocation.helpers({
    shareLocationModalColor () {
        let siteSettings = Session.get('siteSettings');
        let colors = {
            "backgroundColor" : "#fafafa !important",
            "footerBackgroundColor" : "#fff !important",
            "footerTopBorderColor" : "1px solid #bbbbbb !important",
            "closeButtonTextColor" : "#262626 !important",
            "headingTextColor" : "#262626 !important",
            "bodyTextColor" : "#262626 !important",
            "inputBoxBorderColor" : "1px solid #262626 !important",
            "SentButtonTextColor" : "#262626 !important"
        };
        if (siteSettings && siteSettings.colors && siteSettings.colors.sharelocationModal) {
            colors = {
                "backgroundColor" : `${siteSettings.colors.sharelocationModal.backgroundColor} !important` || "#fafafa !important",
                "footerBackgroundColor" : `${siteSettings.colors.sharelocationModal.footerBackgroundColor } !important`|| "#fff !important",
                "footerTopBorderColor" : `1px solid ${siteSettings.colors.sharelocationModal.footerTopBorderColor} !important` || "1px solid #bbbbbb !important",
                "closeButtonTextColor" : `${siteSettings.colors.sharelocationModal.closeButtonTextColor} !important` || "#262626 !important",
                "headingTextColor" : `${siteSettings.colors.sharelocationModal.headingTextColor} !important` || "#262626 !important",
                "bodyTextColor" : `${siteSettings.colors.sharelocationModal.bodyTextColor} !important` || "#262626 !important",
                "inputBoxBorderColor" : `1px solid ${siteSettings.colors.sharelocationModal.inputBoxBorderColor} !important` || "1px solid #262626 !important",
                "SentButtonTextColor" : `${siteSettings.colors.sharelocationModal.SentButtonTextColor} !important` || "#262626 !important"
            }
        }

        // Return share location modal color fro css use
        return colors;
    },
    getShareLocation () {
        let locationData = Session.get('locationData');
        if(locationData && locationData.flag) {
            const data = locationData.subject;
            Session.set("locationData", {
                flag: false,
                data: null,
                subject: null,
                body: null
            });
            return data;
        } else {
            // Get map data object
            let map = MapData.getMapObj(),
                deviceLocation = '',
                deviceCords = [151.24128056575296, -33.8761822273128]; //sydney
                currentCords = "-33.8761822273128,151.24128056575296",
                subject = "Current Location",
                body = "";
            if(Meteor.isCordova) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    deviceLocation = position;
                });
            } else {
                deviceLocation = Geolocation.currentLocation();
            }
            if(!deviceLocation && Meteor.user() && Roles.userIsInRole(Meteor.userId(),['kiosk'], 'kiosk')) {
                if(Meteor.user().profile.coordinates && Meteor.user().profile.coordinates.long !== '' && Meteor.user().profile.coordinates.lat !== '') {
                    deviceLocation = [parseFloat(Meteor.user().profile.coordinates.long), parseFloat(Meteor.user().profile.coordinates.lat)]
                }
            }
            if (deviceLocation && !Meteor.settings.public.isLocal) {
                deviceCords = [deviceLocation.coords.longitude, deviceLocation.coords.latitude];
            }

            // Concatenate domain name with current Geo location
            body = `${deviceCords.join(',')}`;

            // Return current user location
            return body.trim();
        }
    },
    isKiosk () {
        return (Roles.userIsInRole(Meteor.userId(),['kiosk'], 'kiosk'))
    },
});

Template.sharelocation.events({
    "click .shareLocation"(event,Template){
        event.preventDefault();
        // Get share location form value
        const location = $("#shareLocationText").val();
        const userEmail = $("#userEmail").val();
        const subject = 'User location';
        Session.set('showLoadingSpinner', true);

        // Method call for send email to the user
        Meteor.call("usersdata.sendLocation", userEmail , subject, location,getCookie("selectedSDForSA"),function(err,data){
            Session.set('showLoadingSpinner', false);
            if(err){
                showAlert("danger","something went wrong!");
            }else{
                showAlert("success", "Share location send is successfully.");
                $('#sharelocation').modal('close');
            }
        });
    }
});

function showAlert(type, message) {
    Bert.alert({
        title: 'Hey there!',
        message: message,
        type: type,
        style: 'growl-top-right',
        icon: 'fa-check',
    });
}
