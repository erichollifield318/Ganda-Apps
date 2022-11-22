import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
//import { Reloader } from 'meteor/jamielob:reloader';
import { getSubdomain, getCookie, setCookie } from '/imports/startup/both/global_function.js';
import { screensaver } from '/imports/startup/client/globalHelpers.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { Subdomain } from '/imports/api/subdomain/subdomain.js';

import './client.html';
import '../../components/fab/fab.js';
import '../../components/bottomSheetModal/bottomSheetModal.js';
import '../../components/landingPage/landingPage.js';
import '../../components/footer/footer.js';
import '../../components/mapbox/mapbox.js';
import '../../components/sideNav/sideNav.js';
import '../slider/slider.js';

import { showScreenSaver } from '/imports/startup/client/reactiveVar.js';

Template.client.onCreated(function clientOnCreated() {
  const { ReactiveVar }  =  require('meteor/reactive-var');
  Session.setDefault('showMap', false);
  Session.setDefault('siteSettings', false);
  Session.set('subCategoryHeader', false);
  Session.set('showLoadingSpinner',false);
  Session.set('selectedSubMenu', Session.get('selectedSubMenu')?Session.get('selectedSubMenu'):false);
  Session.set('isAdmin', false);
  this.selectedMenuItemName = new ReactiveVar(false);
  this.selectedMenuId = new ReactiveVar(false);
  this.siteSettings = new ReactiveVar(false);
  // let subDomain = getSubdomain(getCookie("selectedSDForSA"));
  let subDomain = document.location.hostname.split('.')[0];
  if (Meteor.settings.public.isLocal) {
    subDomain = Meteor.absoluteUrl().split('.')[0].replace('http://','').replace('https://','');
  }
  setCookie("selectedSDForSA", subDomain, 30);
  $('.modal').modal();
  Meteor.call('AdminSettings.fetchBySubdomain', subDomain, (error, result)=>{
    if(error){
      Session.set('siteSettings', true);
    }else{
      Session.set('siteSettings', result || true);
      this.siteSettings.set(result || false);
    }
  });
  this.autorun(() => {
    
    this.subscribe('admin_settings.all', subDomain);
  });

   this.autorun(() => {
  if (Roles.userIsInRole(Meteor.userId(),['kiosk'], 'kiosk')) {
     Session.set('showMap', true);
   } else {
      Session.set('showMap', false);
   }
   }); 
   var init_lang = Session.get('lang');
   if(! init_lang)
   {
      Session.set('lang','en');
   }
  //}
});


Template.client.onRendered(function clientOnRendered() {
  let subDomain = document.location.hostname.split('.');
  // Logger.log({action: `${Meteor.settings.public.userAppActions.appLoaded}`, subDomain: `${subDomain[0]}`});

  var usage_log = {
    action: `${Meteor.settings.public.userAppActions.appLoaded}`,
    subDomain: `${subDomain[0]}`,
  };

  Meteor.call('UsageLog.insert', usage_log, (error, result) => {
    if (error) {
      console.log('error usage_log', error);
      return;
    }
    console.log('success usage_log', result);
  });

  $('.modal').modal();
  this.autorun(() => {
    let dynamicCss = Session.get('siteSettings');
    if (dynamicCss && dynamicCss.branding) {
      let cssAdd = dynamicCss.branding.cssField;
      var css = `${cssAdd}`,
      head = document.head || document.getElementsByTagName('head')[0],
      style = document.createElement('style');

      style.type = 'text/css';
      if (style.styleSheet){
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
      head.appendChild(style);
    }
  
    /*Session.set('footerHeight', $('footer').height());
    let $style = $("<style type='text/css'></style>");
    let dynamicCss = siteSettings();
    let cssAdd = dynamicCss.branding.cssField;
    $style.text(`body { ${cssAdd} `);
    $("head").append($style);
   */
  });

  $('.fixed-action-btn').css('bottom', Session.get('footerHeight') + 10);
});


Template.client.helpers({
  isOnline() {
    return Session.get("isOnline");
  },
  isNotKioskUser () {
   if(Roles.userIsInRole(Meteor.userId(),['kiosk'], 'kiosk')) {
      return 'kioskScreen';
   } else {
      '';
   }
    
  },
  ifKiosk() {

    return !Roles.userIsInRole(Meteor.userId(),['kiosk'], 'kiosk');
  },
  isSlider () {
    return showScreenSaver.get() || false;
  },
  showMap() {
    return Session.get('showMap');
  },
  currentClient() {
    return Session.get('currentClient');
  },

  customCss() {
    
    let branding = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
      branding = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
    } else{
      branding = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
    }
    if (branding && branding.colorValue) {
      return branding.colorValue;
    } else {
      return '';
    }
  },
  // markers() {
  //     return Session.get('markers');
  // },
  pageLoading(){
    // If for some reason our spinner dont gets vanished then we will stop showing that after 10seconds
    if(Session.get('showLoadingSpinner')){
      Meteor.setTimeout(()=>{
        Session.set('showLoadingSpinner',false)
      },30000);
    }
    return Session.get('showLoadingSpinner');
  },
  getMenuItemName(){
    return {
        "selectedMenuItemName": Template.instance().selectedMenuItemName,
        "selectedMenuId": Template.instance().selectedMenuId
    }
  },
  /*updateAvailable (){
    
    if (Meteor.isCordova) {
      console.log("Reloader.reload ", Reloader.updateAvailable.get())
      if(Reloader.updateAvailable.get()){
        swal({
            title: 'Update Available',
            text: 'A new version is available, Do you want to update the app?',
            type: "info",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
        }, (ok) => {
          if(ok)
            Reloader.reload();
        });

      }
    }
  }*/

});



Template.client.events({
  'click .client-page' () {
    screensaver();
  }
});
