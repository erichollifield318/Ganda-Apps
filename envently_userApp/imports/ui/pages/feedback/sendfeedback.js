import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import './sendfeedback.html';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain, getCookie } from '/imports/startup/both/global_function.js';
import { Subdomain } from '/imports/api/subdomain/subdomain.js';

Template.sendfeedback.onCreated(function() {
    const { ReactiveVar }  =  require('meteor/reactive-var');
    Meteor.subscribe('admin_settings.all',getCookie("selectedSDForSA"));
    require('./sendfeedback.css');
});

Template.sendfeedback.onRendered(function() {
});

Template.sendfeedback.helpers({
	feedbackModalColor () {
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
        siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
    } else{
        siteSetting = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
    }
    let colors = {
      "backgroundColor" : "#fafafa !important",
      "footerBackgroundColor" : "#fff !important",
      "footerTopBorderColor" : "1px solid #bbbbbb !important",
      "closeButtonTextColor" : "#262626 !important",
      "headingTextColor" : "#262626 !important",
      "bodyTextColor" : "#262626 !important",  
      "inputBoxBorderColor" : "1px solid #262626 !important",
      "SentButtonTextColor" : "#262626 !important"
    };
    if (siteSetting && siteSetting.colors && siteSetting.colors.feedbackModal) {
      colors = {
        "backgroundColor" : `${siteSetting.colors.feedbackModal.backgroundColor} !important` || "#fafafa !important",
        "footerBackgroundColor" : `${siteSetting.colors.feedbackModal.footerBackgroundColor } !important`|| "#fff !important",
        "footerTopBorderColor" : `1px solid ${siteSetting.colors.feedbackModal.footerTopBorderColor} !important` || "1px solid #bbbbbb !important",
        "closeButtonTextColor" : `${siteSetting.colors.feedbackModal.closeButtonTextColor} !important` || "#262626 !important",
        "headingTextColor" : `${siteSetting.colors.feedbackModal.headingTextColor} !important` || "#262626 !important",
        "bodyTextColor" : `${siteSetting.colors.feedbackModal.bodyTextColor} !important` || "#262626 !important",
        "inputBoxBorderColor" : `1px solid ${siteSetting.colors.feedbackModal.inputBoxBorderColor} !important` || "1px solid #262626 !important",
        "SentButtonTextColor" : `${siteSetting.colors.feedbackModal.SentButtonTextColor} !important` || "#262626 !important"
      }
    }
         

    return colors;
  },
});

Template.sendfeedback.events({
	"click .sendFeedBack"(event,Template){
		event.preventDefault();
		var feedback = $("#sendFeedBackText").val(),
			to = 'justin@envent.com.au',
			subject = 'Guest FeedBack';
		Session.set('showLoadingSpinner', true);

		if (Subdomain.findOne({ name: getCookie("selectedSDForSA")})) {
		  if (Subdomain.findOne({ name: getCookie("selectedSDForSA")}).contactEmail) {
		    to = Subdomain.findOne({ name: getCookie("selectedSDForSA")}).contactEmail;
      }
    }
		Meteor.call("usersdata.sendFeedBack", to , subject, feedback,getCookie("selectedSDForSA"),function(err,data){
			Session.set('showLoadingSpinner', false);
			if(err){
				showAlert("danger","Something went wrong!");
			}else{
				showAlert("success", "Thank you, your feedback has been sent successfully");
				$('#sendfeedback').modal('close');
			}
		});
	}
});

function showAlert(type, message){
    Bert.alert({
        title: 'Hey there!',
        message: message,
        type: type,
        style: 'growl-top-right',
        icon: 'fa-check',
    });
};
