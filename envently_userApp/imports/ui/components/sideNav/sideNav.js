import './sideNav.html';
import { Meteor } from 'meteor/meteor';
import { MapData } from '../mapbox/mapbox.js';
import { Usersdata } from '/imports/api/usersdata/usersdata.js';
import { Subdomain } from '/imports/api/subdomain/subdomain.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain, getCookie, deleteAllCookies, setCookie } from '/imports/startup/both/global_function.js';
import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import '/imports/ui/components/fab/fab.js';

import '../languages/languages.js';
import { TAPi18n } from 'meteor/tap:i18n';
import _ from 'lodash';

Template.sideNav.onCreated(() => {
    //this.activeTemplate = new ReactiveVar("");
    //this is not working here no idea why, If you find reason do let me know.
    Template.instance().activeTemplate = new ReactiveVar(false);
    Meteor.subscribe('usersdata.userLocations',getSubdomain());
    $(document).on("keydown", (e) => { //General Listener.
        if ((e.keyCode === 69 || e.code === 'KeyE' || e.which === 69) && (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA')) {
            $(".button-collapse").click();
        }
    });

    var updateTime = ()=>{
        var date = new Date(),
            hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours(),
            am_pm = date.getHours() >= 12 ? "PM" : "AM",
            minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes(),
            seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

        hours = hours < 10 ? "0" + hours : hours;
        time = hours + ":" + minutes + " " + am_pm;
        Session.set("time", time);
    };

    Meteor.setInterval(()=>{
        updateTime();
    },60000);
    
    $('#overlay-box').css('display', 'none');
    updateTime();
});
Template.sideNav.onRendered(function() {
    require('./sideNav.css');
    $(".button-collapse").sideNav();
});
Template.sideNav.helpers({
    kioskModeClass () {
   if(Roles.userIsInRole(Meteor.userId(),['kiosk'], 'kiosk')) {
      return 'kioskScreen';
   } else {
      '';
   }
    
  },
    isKiosk () {
        return !Roles.userIsInRole(Meteor.userId(),['kiosk'], 'kiosk');
    },
    sideNavModal () {
        let siteSetting = {};
        if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
          siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
        } else{
          siteSetting = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
        }
        let colors = {
            "modalBackgroundColor": "#484848 !important",
            'textColor': '#ffffff !important',
            'headingTextColor': '#ffffff !important',
            "sideNavOpenIconColor": "#fff !important"
        };

        if (siteSetting && siteSetting.colors && siteSetting.colors.sideNavModal && siteSetting.colors.landingPageModal) {
            colors = {
                "modalBackgroundColor" : `${siteSetting.colors.sideNavModal.modalBackgroundColor} !important` || "#484848 !important",
                 "textColor" : `${siteSetting.colors.sideNavModal.textColor} !important` || "#ffffff !important",
                 "headingTextColor" : `${siteSetting.colors.sideNavModal.headingTextColor} !important` || "#ffffff !important",
                 "sideNavOpenIconColor" : `${siteSetting.colors.landingPageModal.sideNavOpenIconColor} !important` || "#ffffff !important"
            };
        }

        return colors;
    },
    adminModalImage () {
        let siteSetting = {};
        if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
          siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
        } else{
          siteSetting = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
        }
        if (siteSetting && siteSetting.branding && siteSetting.branding.adminModalLogo)
            return siteSetting.branding.adminModalLogo;

        return false;
    },
    currentClient(){
      if (Subdomain.findOne({ name: Session.get("currentClient")})) {
        return Subdomain.findOne({ name: getSubdomain(getCookie("selectedSDForSA"))}).title;
      } else {
        return 'Double Bay';
      }
        // switch(Session.get("currentClient")){
        //     case 'doublebay':
        //         return "Double Bay";
        //         break;
        //     case 'paddington':
        //         return "Paddington";
        //         break;
        //     case 'gctourism':
        //         return "Gold Coast";
        //         break;
        //     default:
        //         return "Double Bay";
        //         break;
        //
        // }
    },
    markers() {
        return _.sortBy(Session.get('markers'), marker => marker.markerName);
    },
    userData() {

        let userData = Meteor.user() || {};
        if(userData){
            return userData;
        }
        /*let userData = Meteor.user() || {};
        if(userData && userData.profile && userData.profile.name){
            return userData.profile.name;
        }*/
        return "";
    },
    userName(){
        let userData = Meteor.user() || {};
        if(userData && userData.profile && userData.profile.name){
            return userData.profile.name.toUpperCase();
        }
        return "";
    },
    counts() {
        var count = [];
        if(getSubdomain())
        {
          count = dynamicCollections[getSubdomain()+'_usersdata'].find({}).fetch();
        }
        else {
          count = Usersdata.find({}).fetch();
        }
        return count.length || 0;
    },
    englishImg() {
        return "img/english.svg";
    },
    getPadding() {
        let retString = "";
        if (Session.get('markers') && Session.get('markers').length) {
            retString = "padding-top:13px;padding-bottom:13px;";
        }
        return retString;
    },
    loadTemplate() {
        return Template.instance().activeTemplate.get();
    },

    isLoggedIn(){
        return Meteor.userId();
    },

    fullDate(){
        var today = new Date(),
         date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        return date;
    },

    fullTime(){
        return Session.get('time');
    },

    weather(){
        let apiParam = {
            lat: -33.877,
            lon: 151.2412,
            units: "metric"
        };
        let deviceLocation = '';
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

        if(!Meteor.settings.public.isLocal && deviceLocation){
            apiParam.lat = deviceLocation.coords.latitude;
            apiParam.lon = deviceLocation.coords.longitude;
        }

        Meteor.call('usersdata.getWeatherDetail',apiParam, (err, resp)=>{
            if(err){
                // console.log("Weather Failed===>",err);
            }else{
                let prepString = ``;
                if(resp.main && resp.main.temp){
                    prepString += resp.main.temp + "C";
                }

                if(resp.weather.length){
                    prepString +=', ' + resp.weather[0].main;
                }
                $('#weatherlbl').html(prepString);
            }
        });
    },

    isKioskUser() {
        return !Roles.userIsInRole(Meteor.userId(),['kiosk'], 'kiosk');
    },
    isMultiLanguage() {
        // Initialize site setting variable
        let siteSetting = {};
        // Get site setting data
        if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
          siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
        } else{
          siteSetting = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
        }
        if (siteSetting && siteSetting.displayMultiLanguageButton) {
            // Return multilanguage result
            return true;
        } else {
            // Return false
            return false;
        }
    },
});
Template.sideNav.events({
    'click .mapboxgl-canvas' (event) {
        Template.mapbox.__eventMaps[0]["click .mapboxgl-canvas"].call({
            templateInstance: function() {}
        }, event);
    },
    'click .marker' (event) {
        Template.mapbox.__eventMaps[0]["click .marker"].call({
            templateInstance: function() {}
        }, event);
    },
    'click .marker-edit-icon' (event, inst) {
        Template.mapbox.__eventMaps[0]["click .marker-edit-icon"].call({
            templateInstance: function() {}
        }, event);
    },
    'click .more-info' (event, inst) {
        Template.mapbox.__eventMaps[0]["click .more-info"].call({
            templateInstance: function() {
                return Template.mapbox
            }
        }, event);
    },
    'click .directions' (event, inst) {
        $('.button-collapse').sideNav('hide');
        // Here setting marker-id into singleMarker variable for shwoing a single marker on map when I clicked on Direction button
        Session.set('singleMarker', event.target.id);
        Template.mapbox.__eventMaps[0]["click .directions"].call({
            templateInstance: function() {}
        }, event);
    },
    'click .call' (event, inst) {
        Template.mapbox.__eventMaps[0]["click .call"].call({
            templateInstance: function() {}
        }, event);
    },
    'click #termsOfServiceBtn' (event, inst) {
        require('../../pages/termsofservice/termsservice.js')
            inst.activeTemplate.set("termsservice");
            Meteor.setTimeout(() => {
                $("#termsservice").modal({
                    dismissible: true,
                });
                $("#termsservice").modal('open');
            }, 200);
        
    },
    'click #login-btn' (event, inst) {
        event.preventDefault();
        if(!Meteor.userId()){
            Session.set("loginTemplateCall", {
               show: true,
               elName: '#savedLocationsBtn',
               eventName: 'click'
            });
        }
    },
    'click #privacyPolicyBtn' (event, inst) {
        require('../../pages/privacypolicy/privacypolicy.js')
            inst.activeTemplate.set("privacypolicy");
            Meteor.setTimeout(() => {
                $("#privacypolicy").length;
                $("#privacypolicy").modal({
                    dismissible: true,
                });
                $("#privacypolicy").modal('open');
            }, 300);
    },
    'click #copyrightBtn' (event, inst) {
        require('../../pages/copyright/copyright.js')
            inst.activeTemplate.set("copyright");
            Meteor.setTimeout(() => {
                $("#copyright").modal({
                    dismissible: true,
                });
                $("#copyright").modal('open');
            }, 200);
    },
    'click #savedLocationsBtn' (event, inst) {
        event.preventDefault();
        if(!Meteor.userId()){
            Session.set("loginTemplateCall", {
               show: true,
               elName: '#savedLocationsBtn',
               eventName: 'click'
            });
            //window.location.href="signin";
            return false;
        }

        require('../../pages/savedLocations/savedlocations.js')
            inst.activeTemplate.set("savedlocations");
            Meteor.setTimeout(() => {
                $("#savedlocations").modal();
                $("#savedlocations").modal('open');
            }, 200);
        },
    'click #shareCurrentLocation' (event, inst) {
        event.preventDefault();
        if(!Meteor.userId()){
            Session.set("loginTemplateCall", {
                show: true,
                elName: '#shareCurrentLocation',
                eventName: 'click'
            });
            return false;
        }
        require ('../../pages/shareCurrentLocation/sharelocation.js')
            inst.activeTemplate.set("sharelocation");
            Meteor.setTimeout(() => {
                $("#sharelocation").modal();
                $("#sharelocation").modal('open');
            }, 200);
    },
    'click #sendFeedBackBtn' (event, inst) {
        event.preventDefault();
        require('../../pages/feedback/sendfeedback.js')
            inst.activeTemplate.set("sendfeedback");
            Meteor.setTimeout(() => {
                $("#sendfeedback").modal();
                $("#sendfeedback").modal('open');
            }, 200);
    },
    'click .edit-userdetails-icon'(event,template){
        event.preventDefault();
         Meteor.setTimeout(() => {
                $("#edit-user-detail").modal();
                $("#edit-user-detail").modal('open');
            }, 200)
        //$("#edit-user-detail").modal('show');
    },
    'click .update-user'(event,template){
        event.preventDefault();
        var oldpass = $('#oldpassword').val();
            newpass = $('#newpassword').val();
            confirmpass = $('#confirmpassword').val();
            username = $('#updateUsername').val();
            var flag = oldpass || newpass || confirmpass;
            if (username) {
                if (flag) {
                    if (!oldpass || !newpass || !confirmpass) {
                        bAlertFunction('Oops!','danger','fa-exclamation-triangle',"Please enter all password fields!");
                    }else if(newpass != confirmpass){
                        bAlertFunction('Oops!','danger','fa-exclamation-triangle',"New password and confirm password dont match!");
                    }else if(newpass){
                        Accounts.changePassword(oldpass,newpass,err=>{
                            if (err) {
                                bAlertFunction('Oops!','danger','fa-exclamation-triangle',err.message);
                                return;
                            }
                            Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.name": username}});
                            bAlertFunction('Success!','info','fa-check',"Details updated successfully!");
                             $('#oldpassword').val('');
                             $('#newpassword').val('');
                             $('#confirmpassword').val('');
                            $("#edit-user-detail").modal('close');
                        })
                    }
                }else{
                   var res = Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.name": username}});
                   if (res) {
                    bAlertFunction('Success!','info','fa-check',"Username updated successfully!");
                    $("#edit-user-detail").modal('close');
                   }
                }
            }else{
                bAlertFunction('Oops!','danger','fa-exclamation-triangle',"Please enter user's name field!");
            }
    },
    'click .log-out'(event,template){
        event.preventDefault();
         swal({
              title: "Are you sure?",
              text: "You want to logout!",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Yes",
              cancelButtonText: "No",
              closeOnConfirm: true,
              closeOnCancel: true
            }, (isConfirm) => {
                if (isConfirm) {
                  deleteAllCookies();
                  console.log("inside confirm :::::::", Meteor.userId());
                    Meteor.logout(function(err){
                        console.log("error is : :::: :", err);
                    });
                    $("#edit-user-detail").modal('close');
                    setCookie("selectedSDForSA", getSubdomain(), 30);
                }
            });
    }
});

function bAlertFunction(title,type,icon,message){
    Bert.alert({
        title: title,
        message: message,
        type: type,
        style: 'growl-top-right',
        icon: icon,
    });
}
