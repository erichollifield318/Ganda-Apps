import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain,getCookie } from '/imports/startup/both/global_function.js';
import './privacypolicy.html';


Template.privacypolicy.onCreated(function() {
    const { ReactiveVar }  =  require('meteor/reactive-var');
    Meteor.subscribe('admin_settings.all',getCookie("selectedSDForSA"));
    require('./privacypolicy.css');
});

Template.privacypolicy.onRendered(function() {
});


Template.privacypolicy.helpers({

	getPrivacyPolicy(){
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

        if(adminSetting && adminSetting.privacypolicy){
        	privacypolicy = adminSetting.privacypolicy;
        }

        
        return privacypolicy.content;
	},

});
Template.privacypolicy.events({

	"click .updateCopyright"(event,Template){
		event.preventDefault();
		var text = $("#privacypolicyText").val(),
		postData={
			"privacypolicy":{
				"content":text
			}
		};

		Meteor.call("AdminSettings.update", postData,getCookie("selectedSDForSA"), function(err,data){
			if(err){
				alert("something went wrong!");
			}else{
				showAlert("success", "Privacy Policy updated successfully");
				$('#privacypolicy').modal('close');
			}
		})

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
