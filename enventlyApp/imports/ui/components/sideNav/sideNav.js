import './sideNav.html';
import { MapData } from '../mapbox/mapbox.js';
import { Usersdata } from '/imports/api/usersdata/usersdata.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain,deleteAllCookies } from '/imports/startup/both/global_function.js';
Template.sideNav.onCreated(() => {
    //this.activeTemplate = new ReactiveVar("");
    //this is not working here no idea why, If you find reason do let me know.
    Template.instance().activeTemplate = new ReactiveVar(false);
    Meteor.subscribe('usersdata.userLocations');
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

    updateTime();
});
Template.sideNav.onRendered(function() {
    require('./sideNav.css');
    $(".button-collapse").sideNav();
});
Template.sideNav.helpers({
    currentClient(){
        switch(Session.get("currentClient")){
            case 'doublebay':
                return "Double Bay";
                break;
            case 'paddington':
                return "Paddington";
                break;
            default:
                return "Double Bay";
                break;

        }
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
        if(userData && userData.profile && userData.profile.username){
            return userData.profile.username;
        }
        return "No Name";
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
        },
        deviceLocation = Geolocation.currentLocation();

        if(!Meteor.settings.public.isLocal && deviceLocation){
            apiParam.lat = deviceLocation.coords.latitude;
            apiParam.lon = deviceLocation.coords.longitude;
        }

        Meteor.call('usersdata.getWeatherDetail',apiParam, (err, resp)=>{
            if(err){
                console.log("Weather Failed===>",err);
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
    }
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
        import ('../../pages/termsofservice/termsservice.js').then(() => {
            inst.activeTemplate.set("termsservice");
            Meteor.setTimeout(() => {
                $("#termsservice").modal();
                $("#termsservice").modal('open');
            }, 200)
        });
    },
    'click #privacyPolicyBtn' (event, inst) {
        import ('../../pages/privacypolicy/privacypolicy.js').then(() => {
            inst.activeTemplate.set("privacypolicy");
            Meteor.setTimeout(() => {
                $("#privacypolicy").length;
                $("#privacypolicy").modal();
                $("#privacypolicy").modal('open');
            }, 200)
        });
    },
    'click #copyrightBtn' (event, inst) {
        import ('../../pages/copyright/copyright.js').then(() => {
            inst.activeTemplate.set("copyright");
            Meteor.setTimeout(() => {
                $("#copyright").modal();
                $("#copyright").modal('open');
            }, 200)
        });
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

        import ('../../pages/savedLocations/savedlocations.js').then(() => {
            inst.activeTemplate.set("savedlocations");
            Meteor.setTimeout(() => {
                $("#savedlocations").modal();
                $("#savedlocations").modal('open');
            }, 200)
        });
    },
    'click #shareCurrentLocation' (event, inst) {
        event.preventDefault();
        if(!Meteor.userId()){
            Session.set("loginTemplateCall", {
               show: true,
               elName: '#shareCurrentLocation',
               eventName: 'click'
            });
            //window.location.href="signin";
            return false;
        }
        let map = MapData.getMapObj(),
            deviceLocation = Geolocation.currentLocation(),
            deviceCords = [151.24128056575296, -33.8761822273128]; //sydney
        currentCords = "-33.8761822273128,151.24128056575296",
            subject = "Current Location",
            body = "";
        if (deviceLocation && !Meteor.settings.public.isLocal) {
            deviceCords = [deviceLocation.coords.longitude, deviceLocation.coords.latitude];
        }
        body = `
            ${window.location.href}${deviceCords.join(',')}
        `;
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    },
    'click #sendFeedBackBtn' (event, inst) {
        event.preventDefault();
        import ('../../pages/feedback/sendfeedback.js').then(() => {
            inst.activeTemplate.set("sendfeedback");
            Meteor.setTimeout(() => {
                $("#sendfeedback").modal();
                $("#sendfeedback").modal('open');
            }, 200)
        });
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
                            Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.username": username}});
                            bAlertFunction('Success!','info','fa-check',"Details updated successfully!");
                             $('#oldpassword').val('');
                             $('#newpassword').val('');
                             $('#confirmpassword').val('');
                            $("#edit-user-detail").modal('close');
                        })
                    }
                }else{
                   var res = Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.username": username}});
                   if (res) {
                    bAlertFunction('Success!','info','fa-check',"Username updated successfully!");
                    $("#edit-user-detail").modal('close');
                   }
                }
            }else{
                bAlertFunction('Oops!','danger','fa-exclamation-triangle',"Please enter username field!");
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
                    Meteor.logout();
                    $("#edit-user-detail").modal('close');
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
