import './brandingModal.html';
import '/imports/ui/components/enquiry/enquiry.js'
import {AdminSettings} from '/imports/api/admin_settings/admin_settings.js';
import {dynamicCollections} from '/imports/startup/both/dynamic_collections.js';
import {getSubdomain, getCookie} from '/imports/startup/both/global_function.js';

Template.brandingModal.onCreated(function () {
  require('./brandingModal.css');
  this.mainImage = new ReactiveVar(null);
  this.image1 = new ReactiveVar(null);
  this.image2 = new ReactiveVar(null);
  this.image3 = new ReactiveVar(null);
  this.imageObj1 = new ReactiveVar({});
  this.imageObj2 = new ReactiveVar({});
  this.imageObj3 = new ReactiveVar({});
});

Template.brandingModal.onRendered(function () {

});

Template.brandingModal.helpers({
  brandingModalColor() {
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings'].findOne({subDomain: getCookie("selectedSDForSA")});
    } else {
      siteSetting = AdminSettings.findOne({subDomain: getCookie("selectedSDForSA")});
    }
    let colors = {
      "modalColor": "#6d6b6b !important",
      "websiteButtonColor": "#22b14c !important",
      "callButtonColor": "#ff7f27 !important",
      "enquiryButtonColor": "#6d6b6b !important",
      "headerFontColor": "#d8d8d8 !important",
      "bodyFontColor": "#d8d8d8 !important",
      "buttonFontColor": "#d8d8d8 !important",
      "footerColor": "#fff !important",
      "cancleIconColor": "#6d6b6b !important",
      "cancleIconTextColor": '#343434 !important',
      "iconHeadingColor": "#fff !important"
    };
    if (siteSetting && siteSetting.colors && siteSetting.colors.brandingModal) {
      colors = {
        "modalColor": siteSetting.colors.brandingModal.modalColor || "#E88181 !important",
        "websiteButtonColor": siteSetting.colors.brandingModal.websiteButtonColor || "#22b14c !important",
        "callButtonColor": siteSetting.colors.brandingModal.callButtonColor || "#ff7f27 !important",
        "enquiryButtonColor": siteSetting.colors.brandingModal.enquiryButtonColor || "#6d6b6b !important",
        "headerFontColor": siteSetting.colors.brandingModal.headerFontColor || "#d8d8d8 !important",
        "bodyFontColor": siteSetting.colors.brandingModal.bodyFontColor || "#d8d8d8 !important",
        "buttonFontColor": siteSetting.colors.brandingModal.buttonFontColor || "#d8d8d8 !important",
        "footerColor": siteSetting.colors.brandingModal.footerColor || "#fff !important",
        "cancleIconColor": siteSetting.colors.brandingModal.cancleIconColor || "#6d6b6b !important",
        "cancleIconTextColor": siteSetting.colors.brandingModal.cancleIconTextColor || '#343434 !important',
        "iconHeadingColor": siteSetting.colors.brandingModal.iconHeadingColor || "#fff !important"
      }
    }
    return colors;
  },
  branding() {
    let inst = Template.instance();
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings'].findOne({subDomain: getCookie("selectedSDForSA")});
    } else {
      siteSetting = AdminSettings.findOne({subDomain: getCookie("selectedSDForSA")});
    }
    let branding = siteSetting && siteSetting.branding ? siteSetting.branding : {};
    let images = branding.images || [];
    let mainImage = branding.mainImage;
    if (mainImage) {
      inst['mainImage'].set(mainImage);
    }
    images.map(function (image, index) {
      let sequence = index + 1;
      if (image) {
        inst['imageObj' + sequence].set(image);
      }
      if (image && image.path) {
        inst['image' + sequence].set(image.path);
      }
    });
    return branding;
  },
  images() {
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings'].findOne({subDomain: getCookie("selectedSDForSA")});
    } else {
      siteSetting = AdminSettings.findOne({subDomain: getCookie("selectedSDForSA")});
    }
    const branding = siteSetting && siteSetting.branding ? siteSetting.branding : {};
    const images = branding.images || [];
    return images;
  },

  /*imageObj1() {
      return Template.instance().imageObj1.get();
  },

  imageObj2() {
      return Template.instance().imageObj2.get();
  },

  imageObj3() {
      return Template.instance().imageObj3.get();
  },

  mainImage() {
      return Template.instance().mainImage.get();
  },

  image1() {
      return Template.instance().image1.get();
  },

  image2() {
      return Template.instance().image2.get();
  },

  image3() {
      return Template.instance().image3.get();
  },*/
});

Template.brandingModal.events({
  'click .branding-link'(event) {
    const link = event.target.name;
    // Logger.log({action: `${Meteor.settings.public.userAppActions.externalLinkPressed}`, context: `${link}`});
    var subdomain = document.location.hostname.split('.');

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

  'click #enquiry'(event) {
    event.preventDefault();

    console.log("enquiry modal is called");
    $('.modal').modal({
      dismissible: true
    });
    // $('.bottom-sheet').modal();
    $('#enquiryModal').modal('open');
  }
});

