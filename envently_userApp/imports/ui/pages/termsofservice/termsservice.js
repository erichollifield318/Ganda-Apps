import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain,getCookie } from '/imports/startup/both/global_function.js';
import './termsservice.html';

Template.termsservice.onCreated(function() {
    Meteor.subscribe('admin_settings.all',getCookie("selectedSDForSA"));
    require('./termsservice.css');
});

Template.termsservice.helpers({
    termsModalColor () {
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
        if (siteSetting && siteSetting.colors && siteSetting.colors.termsModal) {
            colors = {
                "backgroundColor" : siteSetting.colors.termsModal.backgroundColor || "#6D6B6B !important",
                "footerBackgroundColor" : siteSetting.colors.termsModal.footerBackgroundColor || "#fafafa !important",
                "closeButtonTextColor" : siteSetting.colors.termsModal.closeButtonTextColor || "#070707 !important",
                "headingTextColor" : siteSetting.colors.termsModal.headingTextColor || "#fff !important",
                "bodyTextColor" : siteSetting.colors.termsModal.bodyTextColor || "#fff !important"
            }
        }
             

        return colors;
    },
	getTermsService(isClient){
		let inst = Template.instance(),
        	adminSetting = {},
        	termsservice =  {
        		content: ""
        	};
          if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
            adminSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ "termsservice.content":{$exists:true} });
          } else {
            adminSetting = AdminSettings.findOne({ "termsservice.content":{$exists:true} });
          }

        if(adminSetting && adminSetting.termsservice && adminSetting.termsservice.content){
        	termsservice.content = adminSetting.termsservice.content;
        }

        return termsservice.content.replace(new RegExp('\r?\n','g'), "<br />");
	},
});