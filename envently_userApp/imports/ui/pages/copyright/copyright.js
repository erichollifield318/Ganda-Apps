import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain,getCookie } from '/imports/startup/both/global_function.js';
import './copyright.html';

Template.copyright.onCreated(function() {
    Meteor.subscribe('admin_settings.all',getCookie("selectedSDForSA"));
    require('./copyright.css');
});

Template.copyright.helpers({
    copyrightModalColor () {
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
        if (siteSetting && siteSetting.colors && siteSetting.colors.copyrightModal) {
            colors = {
                "backgroundColor" : siteSetting.colors.copyrightModal.backgroundColor || "#6D6B6B !important",
                "footerBackgroundColor" : siteSetting.colors.copyrightModal.footerBackgroundColor || "#fafafa !important",
                "closeButtonTextColor" : siteSetting.colors.copyrightModal.closeButtonTextColor || "#070707 !important",
                "headingTextColor" : siteSetting.colors.copyrightModal.headingTextColor || "#fff !important",
                "bodyTextColor" : siteSetting.colors.copyrightModal.bodyTextColor || "#fff !important"
            }
        }
             

        return colors;
    },
	getCopyRightText(){
		let inst = Template.instance(),
        	adminSetting = {},
        	copyright =  {
        		content: ""
        	};
          if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
            adminSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ "copyright.content":{$exists:true} });
          } else {
            adminSetting = AdminSettings.findOne({ "copyright.content":{$exists:true} });
          }

        if (adminSetting && adminSetting.copyright && adminSetting.copyright.content){
        	copyright.content = adminSetting.copyright.content;
        }

        return copyright.content.replace(new RegExp('\r?\n','g'), "<br />");
	}

});
