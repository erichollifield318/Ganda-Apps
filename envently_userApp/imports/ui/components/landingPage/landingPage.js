import './landingPage.html';
import '../searchBar/searchBar.js';

import { Meteor } from 'meteor/meteor';
import { Categories } from '/imports/api/categories/categories.js';
import { LocationDev } from '/imports/api/location_dev/location_dev.js';
import { EventDev } from '/imports/api/event_dev/event_dev.js';
import { CacheDev } from '/imports/api/cache_dev/cache_dev.js';
import { mapCentre } from '../mapbox/mapbox.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain, getCookie } from '/imports/startup/both/global_function.js';
import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';

Template.landingPage.onCreated(function() {
  require("./landingPage.css")
  
});

Template.landingPage.helpers({
  isNotKioskUser () {
    return !Roles.userIsInRole(Meteor.userId(),['kiosk'], 'kiosk');
  },
  checkDataLoad () {

    // console.log("under checkDataLoad");

    let siteSettings = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
      Meteor.call('AdminSettings.fetchBySubdomain', getCookie("selectedSDForSA"), (error, result) => {
        if (error) {
          return;
        }
        siteSettings = result;
      });
      // siteSettings = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
    } else{
      // console.log("under else");
      // console.log("under if of siteSettings");
      siteSettings = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
      // siteSettings = "";

      // console.log("siteSettings ===> " , siteSettings);
    }


    return siteSettings
  },
  checkHeadingImage (image) {
    return image != '' ? image : false;
  },
  landing () {
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
    } else{
      siteSetting = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
    }
    // $('#mainHeading').children().remove();
    let data = {
      "headingTextColor" : "#ffb866 !important",
      "subHeadingTextColor" : "#ffb866 !important",
      "landingImage": "img/coffee-cup.7bd20e84.jpg",
      "landingHeading": "",
      "landingSubHeading": "",
      "landingPageHeadingImage": ""
    };

    if (siteSetting && siteSetting.colors && siteSetting.colors.landingPageModal) {
      data = {
        "headingTextColor" : `${siteSetting.colors.landingPageModal.headingTextColor} !important` || "#ffb866 !important",
        "subHeadingTextColor" : `${siteSetting.colors.landingPageModal.subHeadingTextColor} !important` || "#ffb866 !important",
        "sideNavOpenIconColor" : `${siteSetting.colors.landingPageModal.sideNavOpenIconColor } !important`|| "#fff !important"
      }
    }
    if (siteSetting && siteSetting.branding && siteSetting.branding.landingPageObject) {
      if (window.innerWidth <= 425 && siteSetting.branding.landingPageObject.landingImageMobile){
        // mobile view
        data.landingImage = siteSetting.branding.landingPageObject.landingImageMobile;
      }
      else if (window.innerWidth <= 768 && siteSetting.branding.landingPageObject.landingImageTeblet) {
        // tab view
        data.landingImage = siteSetting.branding.landingPageObject.landingImageTeblet;
      } else {
        // desktop and kiosk view
        data.landingImage = siteSetting.branding.landingPageObject.landingImageKiosk;
      }
      data.landingPageHeadingImage = siteSetting.branding.landingPageObject.landingPageHeadingImage || '';
    }
    if (siteSetting && siteSetting.branding){
      data.landingHeading = siteSetting.branding.heading || '';
      
      data.landingSubHeading = siteSetting.branding.subHeading || '';
    }
    // console.log(":: data ",data)
    return data;
  },
  isHome(){
    if (Session.get('showMap')) {
      return false;
    }
    return true;
  },
  
  getMenuItemName(){
    return Template.instance().data.selectedMenuItemName.get() || '';
  },
  getSubDomainName() {

    // console.log("under getSubdomainname");
    if (Session.get('currentClient')!="doublebay") {
      // console.log("return true");
      return true;
    } else {
      // console.log("return false");
      return false;
    }
      
  },
  subDomainClass() {

    // console.log("session currentClient ===> " , Session.get('currentClient'));

    if (Session.get('currentClient')=="gctourism") {
      return "gcTourism-image";
    } else{
      return "doublebay-image";
    }
    
  }
});
