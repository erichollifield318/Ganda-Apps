import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain,getCookie } from '/imports/startup/both/global_function.js';
import './privacypolicy.html';

Template.privacypolicy.onCreated(function() {
    Meteor.subscribe('admin_settings.all',getCookie("selectedSDForSA"));
    require('./privacypolicy.css');
});

Template.privacypolicy.helpers({
  privacyModalColor () {
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
    } else{
      siteSetting = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
    }
    let colors = {
      "backgroundColor" : "#6D6B6B !important",
      "footerBackgroundColor" : "#fafafa !important",
      "closeButtonTextColor" : "#070707 !important",
      "headingTextColor" : "#fff !important",
      "bodyTextColor" : "#fff !important"
    };
    if (siteSetting && siteSetting.colors && siteSetting.colors.privacyModal) {
      colors = {
        "backgroundColor" : siteSetting.colors.privacyModal.backgroundColor || "#6D6B6B !important",
        "footerBackgroundColor" : siteSetting.colors.privacyModal.footerBackgroundColor || "#fafafa !important",
        "closeButtonTextColor" : siteSetting.colors.privacyModal.closeButtonTextColor || "#070707 !important",
        "headingTextColor" : siteSetting.colors.privacyModal.headingTextColor || "#fff !important",
        "bodyTextColor" : siteSetting.colors.privacyModal.bodyTextColor || "#fff !important"
      }
    }
         

    return colors;
  },
	getPrivacyPolicy(isClient){
		let inst = Template.instance(),
        	adminSetting = {},
        	privacypolicy =  {
        		content: ""
        	};
          if( getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
            adminSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ "privacypolicy.content":{$exists:true} });
          } else {
            adminSetting = AdminSettings.findOne({ "privacypolicy.content":{$exists:true} });
          }
          if (adminSetting && adminSetting.privacypolicy && adminSetting.privacypolicy.content){
            privacypolicy.content = adminSetting.privacypolicy.content;
          }
        return privacypolicy.content.replace(new RegExp('\r?\n','g'), "<br />");
	},
});