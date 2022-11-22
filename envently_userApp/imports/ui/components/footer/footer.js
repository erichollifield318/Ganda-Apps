// import moment from 'moment';
import '../brandingModal/brandingModal.js';
import './footer.html';
import '../searchBar/searchBar.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain, getCookie } from '/imports/startup/both/global_function.js';
import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import '../languages/languages.js';
import { TAPi18n } from 'meteor/tap:i18n';
import _ from 'lodash';

Template.dynamicFooter.onCreated(function() {
    require('./footer.css');
    this.image2 = new ReactiveVar(null);
    // $( document ).ready(function() {

    //   $(".select-dropdown").click(function (){
    //       // $("#MainMenues").hide();
    //       $('#overlay-box, #mainMenuList').css('display', 'none');
    //       $('.fixed-action-btn').closeFAB();
    //   });
  // });
    /*if (Session.get('categsArray').length === 0) {
      alert("not");
    }*/
});

Template.dynamicFooter.onRendered(function() {
  this.autorun(()=> {
    $(".select-dropdown").click(function (){
        $('#overlay-box, #mainMenuList').css('display', 'none');
        $('.fixed-action-btn').closeFAB();
    });
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
    } else{
      siteSetting = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
    }
    let branding = siteSetting && siteSetting.branding ? siteSetting.branding : {};
    let images = branding.images || [];
    images.map((image, index) => {
        if(image && image.path && index === 0){
             this['image2'].set(image.path);
        }
    });
  });
})

Template.dynamicFooter.helpers({
  isNotKioskUser () {
    return !Roles.userIsInRole(Meteor.userId(),['kiosk'], 'kiosk');
  },
  isMultiLanguage() {
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
    } else{
      siteSetting = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });

    }
    if (siteSetting && siteSetting.displayMultiLanguageButton) {
      return true;
    } else {
      return false;
    }
    
  },
  /*currentYear() {
    return moment().format('YYYY');
  },*/
  // getMenuItemName(){
  //   return Template.instance().data.selectedMenuItemName.get() || '';
  // },
  checkDataLoad () {
    let siteSettings = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
      siteSettings = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
    } else{
      siteSettings = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
    }
    return siteSettings;
  },
  footer () {
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
    } else{
      siteSetting = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
    }
    let colors = {
      "footerBackgroundColor" : "#939597"
    };

    if (siteSetting && siteSetting.colors && siteSetting.colors.landingPageModal) {
      colors = {
        "footerBackgroundColor" : siteSetting.colors.landingPageModal.footerBackgroundColor || "#939597"
      }
    }
         

    return colors;
  },
  currentClient() {
    return Session.get('currentClient');
  },
  getFooterImage(){
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
    } else{
      siteSetting = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
    }
    let branding = siteSetting && siteSetting.branding && siteSetting.branding.footerLogos ? siteSetting.branding.footerLogos : {};
    if(branding.logo1){
      return branding.logo1;
    }
    return '/img/no-logo.png';
  },
  getFooterImage2(){
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
    } else{
      siteSetting = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
    }
    let branding = siteSetting && siteSetting.branding && siteSetting.branding.footerLogos ? siteSetting.branding.footerLogos : {};

    if(branding.logo2){
      return branding.logo2;
    }
    return undefined;
  },

 /* isVisibleText() {
    var arr = Session.get('categsArray');
    if (arr){
      if (arr.length > 0 ) {
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }*/
});

Template.dynamicFooter.events({
    'click #branding'(event){
      let siteSetting = {};
      if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
        siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
      } else{
        siteSetting = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
      }
        let branding = siteSetting && siteSetting.branding ? siteSetting.branding : {};
        if(branding.body && branding.header){
          $('#brandingModal').modal();
          $("#brandingModal").modal('open');
        }
    },
    'click .select-dropdown' (event , Template){
      console.log("=======>Ji");
    }
    /*,
    'click .heading-list' (event, inst) { 
        $('#bottomSheetModalId').modal('open');
        Session.set("currentMenu", null);
    }*/

})