import './enquiry.html';
import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain, getCookie } from '/imports/startup/both/global_function.js';

Template.enquiryModal.onCreated(function enquiryOnCreated() {
	require('./enquiry.css');
    Meteor.subscribe('enquiry.all',getSubdomain());
});


Template.enquiryModal.onRendered(function enquiryOnRendered() {
    
});


Template.enquiryModal.helpers({
	enquiryModal () {
        let siteSetting = {};
        if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
            siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
        } else{
            siteSetting = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
        }
        let colors = {
            "modalBackgroundColor": "#484848 !important",
            "headingFontColor" : "#fff !important",
            "labelFontColor" : "#fff !important",
            "closeButtonBackgroundColor" : "#fff !important",
            "closeButtontextColor" : "#373737 !important",
            "submitButtonBackgroundColor" : "#fff !important",
            "submitButtonTextColor" : "#373737 !important",
            "footerBackgroundColor" : "#fff !important",
            "inputBorderColor" : "1px solid #fff !important",
            "inputBoxShadowColor" : "0 1px 0 0 #fff !important"
        };

        if (siteSetting && siteSetting.colors && siteSetting.colors.enquiryModal) {
            colors = {
                "modalBackgroundColor" : `${siteSetting.colors.enquiryModal.modalBackgroundColor} !important` || "#484848 !important",
                "headingFontColor" : `${siteSetting.colors.enquiryModal.headingFontColor} !important` || "#fff !important",
                "labelFontColor" : `${siteSetting.colors.enquiryModal.labelFontColor} !important` || "#fff !important",
                "closeButtonBackgroundColor" : `${siteSetting.colors.enquiryModal.closeButtonBackgroundColor} !important` || "#fff !important",
                "closeButtontextColor" : `${siteSetting.colors.enquiryModal.closeButtontextColor} !important` || "#373737 !important",
                "submitButtonBackgroundColor" : `${siteSetting.colors.enquiryModal.submitButtonBackgroundColor} !important` || "#fff !important",
                "submitButtonTextColor" : `${siteSetting.colors.enquiryModal.submitButtonTextColor} !important` || "#373737 !important",
                "footerBackgroundColor" : `${siteSetting.colors.enquiryModal.footerBackgroundColor} !important` || "#fff !important",
             //   "inputBorderColor" : `1px solid ${siteSetting.colors.enquiryModal.inputBorderColor} !important` || "1px solid #fff !important",
                "inputBorderColor" : `0 1px 0 0 ${siteSetting.colors.enquiryModal.inputBorderColor} !important` || "0 1px 0 0 #fff !important"
            };
        }

        return colors;
    },
});

Template.enquiryModal.events({
    
    'submit #newEnquiry'(event){
        event.preventDefault();
        let fields = {};
        
        if ($('#contactName').val()) {
            fields["contactName"] = $('#contactName').val()
        }
        if ($('#tel').val()) {
            fields["tel"] = $('#tel').val()
        }
        if ($('#email').val()) {
            fields["email"] = $('#email').val()
        }

        if ($('#query').val()) {
            fields["query"] = $('#query').val()
        }

        if(Object.keys(fields).length==0){
            return;
        }
        var subdomain = document.location.hostname.split('.');
        fields["subdomain"] = subdomain[0];
        Meteor.call('Enquiry.insert', fields, (error, result) => {
            if (error) {
                console.log('error', error);
                return;
            }
            Bert.alert({
                title: 'Hey there!',
                message: 'Thank you, your enquiry has been sent successfully',
                type: 'success',
                style: 'growl-top-right',
                icon: 'fa-check',
            });
            $('#enquiryModal').modal('close');
        });
    }
});