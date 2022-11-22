import { Meteor } from 'meteor/meteor';
import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import './sociallogin.html';
import { Usersdata } from '/imports/api/usersdata/usersdata.js';
import { AccountsTemplates } from 'meteor/useraccounts:core';
import { getSubdomain } from '/imports/startup/both/global_function.js';
import { TAPi18n } from 'meteor/tap:i18n';
import _ from 'lodash';
import { Subdomain } from '/imports/api/subdomain/subdomain.js';
//import '../components/languages/languages.js';
var modalFlag = false;

Template.sociallogin.onCreated(function() {
    const { ReactiveVar } = require('meteor/reactive-var');
    Meteor.subscribe('admin_settings.all', getSubdomain());
    Meteor.subscribe('usersdata.userLocations',getSubdomain());
    require('./sociallogin.css');

    /* Bydefault Setting Session to null. */
    Session.set("loginTemplateCall", {
        show: false, //Turned popup on/off.
        elName: null, //Dom element or DomName used with JQuery search param.
        eventName: null, //JQuery Event to trigger on Dom Element.
        callBackFn: null //Callback Handler to handle/call callback on after Login.
    });
    Session.set("currentForm","login");
    //Auto Detection.
    Tracker.autorun(()=>{
        let callBackDetails = Session.get("loginTemplateCall");
        if(callBackDetails.show){ //If Turned True Show the Modal.
            $("#sociallogin").modal({
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
            $("#sociallogin").modal('open');
        }else{ //If Turned False, Check for Any Pending event remaining.
            if(callBackDetails.elName && callBackDetails.eventName){ //Sensitive Code.
                try{
                    $(callBackDetails.elName)[callBackDetails.eventName]();

                    if(callBackDetails.callBackFn){
                        callBackDetails.callBackFn();
                    }

                    Session.set("loginTemplateCall", {
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
               Session.set("loginTemplateCall", {
                    show: false,
                    elName: null,
                    eventName: null,
                    callBackFn: null
                });
            }
        }
    });
});


Template.sociallogin.helpers({
    isLogin(){
        if (Session.get("currentForm")=="login") {
            return true;
        }
        return false;
    },
});

Template.sociallogin.events({
    'click .btn-facebook'(event, template){
      event.preventDefault();
      doLogin('Facebook',{
            requestPermissions: ['public_profile', 'email']
        });
    },
    'click .btn-google'(event,template){
      event.preventDefault();
      doLogin('Google',{});
    },
    'click .btn-twitter'(event,template){
      event.preventDefault();
      doLogin('Twitter',{
            requestPermissions: ['public_profile', 'email']
        });
    },
    'submit #loginform'(event,template){
        event.preventDefault();
        console.log("INSIDE LOGIN FORM SUBMIT EVENT");

        Session.set('showLoadingSpinner', true);
        const uemail = $("#loginEmail").val();
        const upass = $("#loginPassword").val();
        console.log("UEMAIL IS : :::  ::::", uemail, upass);


        // Validate user try to login subdomain is equal to sub domain belong to the user
        Meteor.call("validateSubdomainName", {"email": uemail, "subdomain": getSubdomain()},function(err,res){
            if (err) {
                console.log(" error occurred while logging in : ", err);
                Bert.alert({
                    title: 'Oops!',
                    message: err.message,
                    type: 'danger',
                    style: 'growl-top-right',
                    icon: 'fa-exclamation-triangle',
                });
                return false;
            } else {
                if (res) {
                    Meteor.loginWithPassword({"email":uemail},upass,function(err){
                        if (err) {
                            console.log(" error occurred while logging in : ", err);

                            // console.log(err);
                            Session.set('showLoadingSpinner', false);
                            Bert.alert({
                                title: 'Oops!',
                                message: err.message,
                                type: 'danger',
                                style: 'growl-top-right',
                                icon: 'fa-exclamation-triangle',
                            });
                            Session.set('showLoadingSpinner', true);
                            return;
                        }
                        $("#sociallogin").modal('close');
                    });
                } else {
                    Session.set('showLoadingSpinner', false);
                    Bert.alert({
                        title: 'Login failed!',
                        message: "User does not belong to current sub domain!",
                        type: 'danger',
                        style: 'growl-top-right',
                        icon: 'fa-check',
                    });
                    return false;
                }
            }
        });
    },
    'submit #registerform'(event,template){
        event.preventDefault();
        var uname = $("#registerUsername").val();
        var uemail = $("#registerEmail").val();
        var upass = $("#registerPassword").val();
             const subdomain = Subdomain.findOne({name:getSubdomain()});
            Meteor.call("register",{"email":uemail,"password":upass,"profile":{"name":uname, "subdomainName": getSubdomain(),"subdomainId":subdomain._id}},function(err,res){
                if (err) {
                    // console.log(err);
                     Bert.alert({
                        title: 'Oops!',
                        message: err.message,
                        type: 'danger',
                        style: 'growl-top-right',
                        icon: 'fa-exclamation-triangle',
                    });
                     return;
                }
                 Bert.alert({
                        title: 'Success!',
                        message: "Registered!",
                        type: 'info',
                        style: 'growl-top-right',
                        icon: 'fa-check',
                    });
                 Session.set("currentForm","login");

            })
    },
    'click .signIn'(event,template){
        event.preventDefault();
        Session.set("currentForm","login");
    },
    'click .register'(event,template){
        event.preventDefault();
        Session.set("currentForm","register");
    }
});

/**
* POPUp notify Handler to display the onGoing Tasks.
*/
function notifyUser(type, msg) {
    Bert.alert({
        title: 'Hey there!',
        message: msg,
        type: type,
        style: 'growl-top-right',
        icon: 'fa-check',
    });
};


/**
* Login Call helper method.
* @param {String} type Name of Method which will be called.
* i.e. Facebook so it will become loginWithFacebook.
* @param {Object} options optional param send to define the security permission access.
*/
function doLogin(type, options){
    if(!type){
        return false;
    }
    options = options || {};
    const methodName = `loginWith${type}`;
    Meteor[methodName](options, (err) =>{
        if (err) {
            // console.log(err);
            Session.set("loginTemplateCall", {
                show: false,
                elName: null,
                eventName: null,
                callBackFn: null
            });
            notifyUser('danger', "Login Failed Couldnt perform the task.");
        }else{
            modalFlag = true;
            $('#sociallogin').modal('close');
            notifyUser('success', "Login Successful.");

            let callBackData = Session.get("loginTemplateCall");
            Session.set("loginTemplateCall", {
                show: false,
                elName: callBackData.elName,
                eventName: callBackData.eventName,
                callBackFn: callBackData.callBackFn
            });
        }
    });
}
