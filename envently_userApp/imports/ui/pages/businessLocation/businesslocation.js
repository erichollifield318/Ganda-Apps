import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { Usersdata } from '/imports/api/usersdata/usersdata.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain, getCookie } from '/imports/startup/both/global_function.js';
import './businesslocation.html';

Template.businesslocation.onCreated(function() {
    const instance = this;
    const { ReactiveVar }  =  require('meteor/reactive-var');
    Meteor.subscribe('admin_settings.all',getCookie("selectedSDForSA"));
    require('./businesslocation.css');

    // Create reactive variable
    instance.businessLocationData = new ReactiveVar();

    // Run subscription in autorun
    instance.autorun(() => {
        // Get business location session data
        let businessLocationData = Session.get('businessLocationData');

        // Assign business location data to reactive var
        instance.businessLocationData.set(businessLocationData);
    });
});

Template.businesslocation.onRendered(function() {
    require('./jquery.ml-keyboard.js');
    require('./jquery.ml-keyboard.css');
    Meteor.setTimeout( function() {
        $(".slKeyboard").slKeyboard({layout: 'en_US'});
    },100);
});


Template.businesslocation.helpers({
    businesslocationModalColor () {
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
        if (siteSettings && siteSettings.colors && siteSettings.colors.businesslocationModal) {
            colors = {
                "backgroundColor" : `${siteSettings.colors.businesslocationModal.backgroundColor} !important` || "#fafafa !important",
                "footerBackgroundColor" : `${siteSettings.colors.businesslocationModal.footerBackgroundColor } !important`|| "#fff !important",
                "footerTopBorderColor" : `1px solid ${siteSettings.colors.businesslocationModal.footerTopBorderColor} !important` || "1px solid #bbbbbb !important",
                "closeButtonTextColor" : `${siteSettings.colors.businesslocationModal.closeButtonTextColor} !important` || "#262626 !important",
                "headingTextColor" : `${siteSettings.colors.businesslocationModal.headingTextColor} !important` || "#262626 !important",
                "bodyTextColor" : `${siteSettings.colors.businesslocationModal.bodyTextColor} !important` || "#262626 !important",
                "inputBoxBorderColor" : `1px solid ${siteSettings.colors.businesslocationModal.inputBoxBorderColor} !important` || "1px solid #262626 !important",
                "SentButtonTextColor" : `${siteSettings.colors.businesslocationModal.SentButtonTextColor} !important` || "#262626 !important"
            }
        }


        return colors;
    },
    getbusinesslocation () {
        // Return Business location data
        return Template.instance().businessLocationData.get();
    },
    isKiosk () {
        return (Roles.userIsInRole(Meteor.userId(),['kiosk'], 'kiosk')) 
    },
});

Template.businesslocation.events({
    "click .businesslocation"(event,Template){
        event.preventDefault();
        // Get share location form value
        const location = $("#businesslocationText").val();
        const userEmail = $("#userEmail").val();
        const subject = $('#locationSubject').text();
        const businessEmailData = Session.get("businessLocationEmailData");
        const userDeviceCords = Session.get('deviceLocation');
        Session.set('showLoadingSpinner', true);

        // Construct email settings object
        const emailSettings = {
            "async": true,
            "crossDomain": true,
            "url": `https://api.mapbox.com/v4/geocode/mapbox.places/${userDeviceCords[0]},${userDeviceCords[1]}.json?access_token=${Meteor.settings.public.mapboxglKey}`,
            "method": "GET",
            "headers": {
              "Cache-Control": "no-cache",
              "Postman-Token": "f826355c-01c7-e8a4-9770-eef82adb0486"
            }
        };

        // Getting user street name by using lat and lag
        $.ajax(emailSettings).done(function(response) {
            let locatedAt = '';
            if (response && response.features[0] && response.features[0].place_name) {
                locatedAt = `You are located at ${response.features[0].place_name}.\n`
            }
            // Construct email body message
            const emailData = `
             ${locatedAt}
             You are viewing ${businessEmailData.name}.\n
             Its address is ${businessEmailData.address}.\n
             Its phone number is ${businessEmailData.phone}.\n
             Website: ${businessEmailData.website}.\n
            `;
            // Server method call for send email to the user
            Meteor.call("usersdata.sendLocation", userEmail , subject, emailData,function(err,data){
                Session.set('showLoadingSpinner', false);
                if(err){
                    // console.log('errors=====>', err);
                    showAlert("danger","something went wrong!");
                }else{
                    showAlert("success", "Share location send is successfully.");
                    $('#businesslocation').modal('close');
                }
            });
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
