import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
import { getCookie } from '/imports/startup/both/global_function.js';

import './client.html';
import '../../components/fab/fab.js';
import '../../components/bottomSheetModal/bottomSheetModal.js';
import '../../components/searchBar/searchBar.js';
import '../../components/footer/footer.js';
import '../../components/mapbox/mapbox.js';
import '../../components/sideNav/sideNav.js';

Template.client.onCreated(function clientOnCreated() {
  const { ReactiveVar }  =  require('meteor/reactive-var');
  Session.setDefault('showMap', false);
  Session.setDefault('siteSettings', false);
  Session.set('showLoadingSpinner',false);
  Session.set('selectedSubMenu', Session.get('selectedSubMenu')?Session.get('selectedSubMenu'):false);
  Session.set('isAdmin', false);
  this.selectedMenuItemName = new ReactiveVar(false);
  this.selectedMenuId = new ReactiveVar(false);
  let subDomain = document.location.hostname.split('.');
  $('.modal').modal();
  if(Meteor.settings.public.isLocal) //for testing purpose only
    subDomain = ['doublebay'];

  Meteor.call('AdminSettings.fetchBySubdomain', subDomain[0],getCookie("selectedSDForSA"), (error, result)=>{
    if(error){
      console.log(":: error in AdminSettings.fetchBySubdomain - ",error);
    }else{
      // console.log(":: subdomain settings - ",result);
      Session.set('siteSettings', result);
    }
  });

  Meteor.call('matchUserAppIp', subDomain[0],getCookie("selectedSDForSA"), (err, res)=>{
      if (err) {
          console.log(":: ERR inside matchUserAppIp - ",err);
      } else {
          console.log(":: Matching User.",res);
          Session.set('isAdminIp', res)
      }
  });
});


Template.client.onRendered(function clientOnRendered() {
  let subDomain = document.location.hostname.split('.');
  Logger.log({action: `${Meteor.settings.public.userAppActions.appLoaded} ${subDomain[0]}`});
  $('.modal').modal();
  Tracker.autorun(() => {
    Session.set('footerHeight', $('footer').height());
  });

  $('.fixed-action-btn').css('bottom', Session.get('footerHeight') + 10);
});


Template.client.helpers({
  showMap() {
    return Session.get('showMap');
  },
  currentClient() {
    return Session.get('currentClient');
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
    console.log(':: ->')
    return Session.get('showLoadingSpinner');
  },
  getMenuItemName(){
    return {
        "selectedMenuItemName": Template.instance().selectedMenuItemName,
        "selectedMenuId": Template.instance().selectedMenuId
    }
  }
});
