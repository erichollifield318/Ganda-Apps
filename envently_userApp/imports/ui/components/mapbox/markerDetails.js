import './markerDetails.html';
import '../../pages/businessLocation/businesslocation.js';
import {Usersdata} from '/imports/api/usersdata/usersdata.js';
import {dynamicCollections} from '/imports/startup/both/dynamic_collections.js';
import {getSubdomain, getCookie} from '/imports/startup/both/global_function.js';
import {AdminSettings} from '/imports/api/admin_settings/admin_settings.js';

const moment = require('moment');

Template.markerDetails.onCreated(function () {
  require('./markerDetails.css');
  this.menuName = new ReactiveVar(null);
  this.subMenuName = new ReactiveVar(null);
  this.refreshFlag = new ReactiveVar(Math.random());
  this.imagePreLoader = new ReactiveVar(true);
  this.loginPopupFlag = new ReactiveVar(false);
  Template.instance().activeTemplate = new ReactiveVar(false);
  Meteor.subscribe('usersdata.userLocations', getSubdomain());
  this.autorun(() => {
    Meteor.call('getMenuSubmenuName', this.data, this.refreshFlag.get(), (err, result) => {
      if (err) {
        // console.log(":: err inside getMenuSubmenuName. ", err);
      } else {
        this.menuName.set((result && result.menuName) ? result.menuName : null);
        this.subMenuName.set((result && result.subMenuName) ? result.subMenuName : null);
      }
    })
  });
});
Template.markerDetails.onRendered(function () {

  this.autorun(() => {
    if (Roles.userIsInRole(Meteor.userId(), ['kiosk'], 'kiosk')) {
      $("div.modal-overlay").remove();
    }
  });

  //calculate modal content height on resize
  $(window).resize(function () {
    const markerModal = $("#markerDetailModal");
    const modalImageBox = markerModal.find("div.modal-content.modal-imginfo > div.imginfo-mainbox").outerHeight();
    const modalFooter = markerModal.find("div.modal-footer").outerHeight();
    const modalContainerHeight = window.innerHeight - (modalImageBox + modalFooter);
    $("#style-2").outerHeight(modalContainerHeight);
    //console.log("resize ModalContentHeight: ", modalContainerHeight)
  });

});
Template.markerDetails.helpers({
  bottomLocationDetails() {
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings'].findOne({subDomain: getCookie("selectedSDForSA")});
    } else {
      siteSetting = AdminSettings.findOne({subDomain: getCookie("selectedSDForSA")});
    }
    let colors = {
      "modalBackgroundColor": "#484848",
      "modalFooterBackgroundColor": "#484848",
      "directionButtonColor": "#00a2e8",
      "websiteButtonColor": "#22b14c",
      "callButtonColor": "#ff7f27",
      "saveButtonColor": "#ff7f27",
      "shareButtonColor": "#484848",
      "shareButtonTextColor": "#fff",
      "infoFontColor": "#ffffff",
      "headingFontColor": "#ffffff",
      "imageBackgroundColor": "#484848",
      "horizontalLineColor": "3px solid #ff7f27",
      "keyTextColor": "#ffffff",
      "valuetextColor": "#ffffff",
      "closeButtonTextColor": "#ffffff"
    };

    if (siteSetting && siteSetting.colors && siteSetting.colors.bottomLocationDetails) {
      colors = {
        "modalBackgroundColor": siteSetting.colors.bottomLocationDetails.modalBackgroundColor || "#484848",
        "modalFooterBackgroundColor": siteSetting.colors.bottomLocationDetails.modalFooterBackgroundColor || "#484848",
        "directionButtonColor": siteSetting.colors.bottomLocationDetails.directionButtonColor || "#00a2e8",
        "websiteButtonColor": siteSetting.colors.bottomLocationDetails.websiteButtonColor || "#22b14c",
        "callButtonColor": siteSetting.colors.bottomLocationDetails.callButtonColor || "#ff7f27",
        "saveButtonColor": siteSetting.colors.bottomLocationDetails.saveButtonColor || "#ff7f27",
        "shareButtonColor": siteSetting.colors.bottomLocationDetails.shareButtonColor || "#484848",
        "shareButtonTextColor": siteSetting.colors.bottomLocationDetails.shareButtonTextColor || "#484848",
        "infoFontColor": siteSetting.colors.bottomLocationDetails.infoFontColor || "#ffffff",
        "headingFontColor": siteSetting.colors.bottomLocationDetails.headingFontColor || "#ffffff",
        "imageBackgroundColor": siteSetting.colors.bottomLocationDetails.imageBackgroundColor || "#484848",
        "horizontalLineColor": `3px solid ${siteSetting.colors.bottomLocationDetails.horizontalLineColor}` || "3px solid #ff7f27",
        "keyTextColor": siteSetting.colors.bottomLocationDetails.keyTextColor || "#ffffff",
        "valuetextColor": siteSetting.colors.bottomLocationDetails.valuetextColor || "#ffffff",
        "closeButtonTextColor": siteSetting.colors.bottomLocationDetails.closeButtonTextColor || "#ffffff"
      }
    }

    return colors;
  },
  saved() {
    let inst = Template.instance(),
      data = inst.data || null,
      styleStr = 'background-color: transparent;',
      savedLocationList = [],
      isSavedData = null;
    if (getSubdomain()) {
      savedLocationList = dynamicCollections[getSubdomain() + '_usersdata'].find({}).fetch()
    } else {
      savedLocationList = Usersdata.find({}).fetch()
    }
    if (data) {
      data.isSaved = false;
      isSavedData = savedLocationList.find((item) => {
        return item.content.locationid === data._id;
      });
      if (isSavedData) {
        styleStr += 'color:#EB992A;';
        data.isSaved = true;
        data.savedLocationId = isSavedData._id;
      }
    }
    return styleStr;
  },
  markerDetails() {
    let inst = Template.instance();
    inst.refreshFlag.set(Math.random());
    let data = inst.data ? inst.data : null;
    if (data && data.imageGallery && data.imageGallery.length > 0) {
      data.image1 = data.imageGallery[0].thumbnailUrl;
      data.image2 = data.imageGallery[0].largeUrl;
    }
    return data;
  },
  getPrimaryContacts(primaryContact) {
    return primaryContact[0].type + ": " + primaryContact[0].value
  },
  getBeginDate() {
    const beginEndDate = Session.get('selectedMarker');
    const beginDate = beginEndDate.from;
    return moment(beginDate).format('MMMM Do YYYY, h:mm:ss a');
  },

  getEndDate() {

    const beginEndDate = Session.get('selectedMarker');
    const endDate = beginEndDate.to;
    return moment(endDate).format('MMMM Do YYYY, h:mm:ss a');
  },

  getTrimmedPhone(primaryContacts) {
    let inst = Template.instance();
    let data = inst.data ? inst.data : null;
    if (primaryContacts && primaryContacts.length) {
      let phoneNum = _.where(primaryContacts, {
        type: "PHONE"
      });
      if (phoneNum && phoneNum.length) {
        return phoneNum[0].value.replace(/\D+/g, '');
      } else if (data && data.secondaryContacts && data.secondaryContacts['Toll Free'] && data.secondaryContacts['Toll Free'].length) {
        let phoneNum = _.where(data.secondaryContacts['Toll Free'], {
          type: "PHONE"
        });
        return phoneNum[0].value.replace(/\D+/g, '');
      } else {
        return 0;
      }
    } else {
      return 0
    }
  },
  getPrimaryAddress(address) {
    return `${address.addressLine}, ${address.state}`
  },
  isImage2Exist(image2) {
    let inst = Template.instance();
    // console.log(":: image2 ===> ",image2)
    if (!image2 || image2.indexOf("http") == -1) {
      // $('#markerDetailModal').css('max-height',300+"px");
      // console.log('-------------------------------------------')
      // image2 = "/img/maki-white/art-gallery-15.svg";
      // image2 = "/img/no-image.svg";
      return false;
    }
    inst.imagePreLoader.set(true);
    $('.imginfo-mainbox').children().remove('img');
    var image = new Image("100%", "auto");
    image.src = image2;
    image.style = "position = absolute";
    // $(image).addClass("responsive-img");
    image.onload = function () {
      inst.imagePreLoader.set(false);
      $('.imginfo-mainbox').append(image)
      // return true;
    }
    return true;
    // if( image2.indexOf("http") == 0 ) {
    //     return true;
    // }
  },
  isImageNotLoaded() {
    let inst = Template.instance();
    return inst.imagePreLoader.get();
  },
  isImageExists(image1, image2) {
    if (image1 || image2) {
      return true;
    } else {
      return false;
    }
  },
  menuName() {
    let inst = Template.instance(), currentLang = Session.get('lang');
    let menuName = inst.menuName ? inst.menuName.get() : null;
    return menuName[currentLang];
  },
  subMenuName() {
    let inst = Template.instance(), currentLang = Session.get('lang');
    let subMenuName = inst.subMenuName ? inst.subMenuName.get() : null;
    return subMenuName[currentLang];
  },
  getCategory(categ1, categ2) {
    if (Array.isArray(categ1) && categ1.length) {
      return categ1[0].name ? categ1[0].name : ''
    } else {
      return categ1 ? categ1 : ''
    }
  },
  getProperUrl(website) {
    let protocol = website.slice(0, 4);
    if (protocol !== 'http') {
      return `http://${website}`;
    } else return website;
  },
  getDetails1() {
    if (this.text1) return this.text1;
    if (this.details1) return this.details1;
  },
  getDetails2() {
    if (this.text2) return this.text2;
    if (this.details2) return this.details2;
  },
  isKioskUser() {
    return !Roles.userIsInRole(Meteor.userId(), ['kiosk'], 'kiosk');
  },
  isEventTypeMarkers() {
    if (Session.get('eventTypeMarkers'))
      return true
  }
});
Template.markerDetails.events({
  'click #shareBusinessLocation'(event, inst) {
    event.preventDefault();
    if (!Meteor.userId()) {
      Session.set("loginTemplateCall", {
        show: true,
        elName: '#shareBusinessLocation',
        eventName: 'click'
      });

      inst.find('.close-modal').click();
      return false;
    }

    // Data for email subject and body
    let data = inst.data || {},
      subject = data.name,
      body = `
                ${data.text1}    
                ${data.address}    
                ${data.phone}    
                ${data.website}    
                ${data.latitude},${data.longitude}
            `;
    // Making session object for formating business location inside share business location email
    let businessLocationEmailData = {
      locatedAt: data.latitude,
      name: data.name,
      address: data.address,
      phone: data.phone,
      website: data.website
    }
    Session.set("businessLocationEmailData", businessLocationEmailData);

    Session.set("businessLocationData", {
      flag: true,
      subject: subject,
      body: body.trim(),
    });
    inst.find('.close-modal').click();
    $("#businesslocation").modal();
    $("#businesslocation").modal('open');
  },
  'click #saveBusinessLocation'(event, inst) {
    event.preventDefault();
    if (!Meteor.userId()) {
      inst.loginPopupFlag.set(true);
      Session.set("loginTemplateCall", {
        show: true,
        elName: '#saveBusinessLocation',
        eventName: 'click'
      });
      inst.find('.close-modal').click()
      return false;
    }
    var data = inst.data,
      payload = {
        "userId": Meteor.userId(),
        "key": "Location",
        "content": {
          "address": data.address,
          "name": data.name,
          "latitude": data.latitude,
          "longitude": data.longitude,
          "locationid": data._id
        }
      };
    if (data.isSaved) {
      if (inst.loginPopupFlag.get()) {
        notifyUser("success", "The location is already saved.");
        inst.loginPopupFlag.set(false);
        return;
      }
      swal({
        title: `Remove ${data.name} ?`,
        text: `Are you sure that you want to remove ${data.name} from Saved List?`,
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      }, (willDelete) => {
        if (willDelete) {
          Meteor.call("usersdata.remove", data.savedLocationId, (err, data) => {
            if (err) {
              // console.log(err);
              notifyUser("danger", "Failed to remove location from Saved List.");
            } else {
              notifyUser("success", "Location removed from Saved List successfully.");
            }
          });
        }
      });
    } else {
      if (inst.loginPopupFlag.get()) {
        inst.loginPopupFlag.set(false);
      }
      Meteor.call("usersdata.insert", payload, (err, data) => {
        if (!err) {
          // console.log(err);
          notifyUser("success", "Location saved successfully.");
        } else {
          notifyUser("danger", "Failed to  save location.");
        }
      });
    }
  },
  /*'click #showPath' (event, inst) {
      $('#markerDetailModal').modal('close');
      Logger.log({action: `${Meteor.settings.public.userAppActions.directionsButtonPressed}`});
      if (inst.data ? inst.data : null){
          if(inst.data.longitude && inst.data.latitude){
              Session.set('selectedDestination', [inst.data.longitude, inst.data.latitude]);
          }
          if(inst.data.primaryAddress && inst.data.primaryAddress.latitude && inst.data.primaryAddress.longitude){
              Session.set('selectedDestination', [inst.data.primaryAddress.longitude, inst.data.primaryAddress.latitude]);
          }
      }
  },*/
  'click .details-link'(event) {
    const link = event.target.name;
    var subdomain = document.location.hostname.split('.');
    // Logger.log({
    //   action: `${Meteor.settings.public.userAppActions.externalLinkPressed}`, context: `${link}`
    // });
    var usage_log = {
      action: `${Meteor.settings.public.userAppActions.externalLinkPressed}`,
      subDomain: `${subdomain[0]}`,
      context: `${link}`
    };

    Meteor.call('UsageLog.insert', usage_log, (error, result) => {
      if (error) {
        console.log('error usage_log', error);
        return;
      }
      console.log('success usage_log', result);
    });
  },
  'click .website-link'(event) {
    const link = event.target.name;
    var subdomain = document.location.hostname.split('.');
    // Logger.log({
    //   action: `${Meteor.settings.public.userAppActions.externalLinkPressed}`, context: `${link}`
    // });
    var usage_log = {
      action: `${Meteor.settings.public.userAppActions.externalLinkPressed}`,
      subDomain: `${subdomain[0]}`,
      context: `${link}`
    };
    Meteor.call('UsageLog.insert', usage_log, (error, result) => {
      if (error) {
        console.log('error usage_log', error);
        return;
      }
      console.log('success usage_log', result);
    });
  },
  'click .close-modal'(event, inst) {
    let markerDetailModal = $(inst.find('#markerDetailModal'));
    markerDetailModal.removeClass('open');
    markerDetailModal.removeAttr('style').css("display", "none");
    $('.modal-overlay:last').remove();
  },
  'click .direct-icon'(event, inst) {
    // console.log(":: event - ", event.currentTarget.id);
    var subdomain = document.location.hostname.split('.');

    $('#bottomSheetModalId').modal('close');
    let markerDetailModal = $(inst.find('#markerDetailModal'));
    markerDetailModal.removeClass('open');
    markerDetailModal.removeAttr('style').css("display", "none");
    $('.modal-overlay:last').remove();
    $('.button-collapse').sideNav('hide');
    // Logger.log({
    //   action: `${Meteor.settings.public.userAppActions.directionsButtonPressed}`
    // });
    var usage_log = {
      action: `${Meteor.settings.public.userAppActions.directionsButtonPressed}`,
      subDomain: `${subdomain[0]}`,
    };
    Meteor.call('UsageLog.insert', usage_log, (error, result) => {
      if (error) {
        console.log('error usage_log', error);
        return;
      }
      console.log('success usage_log', result);
    });
    if (inst.data ? inst.data : null) {
      let markerDetails = inst.data;
      if (markerDetails && markerDetails.longitude && markerDetails.latitude) {
        Session.set('selectedDestination', {
          latLng: [markerDetails.longitude, markerDetails.latitude],
          profile: event.currentTarget.id
        });
      }
      if (markerDetails && markerDetails.primaryAddress && markerDetails.primaryAddress.latitude && markerDetails.primaryAddress.longitude) {
        Session.set('selectedDestination', {
          latLng: [markerDetails.primaryAddress.longitude, markerDetails.primaryAddress.latitude],
          profile: event.currentTarget.id
        });
      }
      // if admin has provided custom-coordinates, then we will prefer them
      if (markerDetails && markerDetails.newCoords && markerDetails.newCoords.latitude && markerDetails.newCoords.longitude) {
        Session.set('selectedDestination', {
          latLng: [markerDetails.newCoords.longitude, markerDetails.newCoords.latitude],
          profile: event.currentTarget.id
        });
      }
      // Here setting marker-id into singleMarker variable for shwoing a single marker on map when I clicked on Direction button
      Session.set('singleMarker', inst.data._id);
    }
  }
});

function notifyUser(type, msg) {
  Bert.alert({
    title: 'Hey there!',
    message: msg,
    type: type,
    style: 'growl-top-right',
    icon: 'fa-check',
  });
};
