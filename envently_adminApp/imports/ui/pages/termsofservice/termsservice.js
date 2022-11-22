import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain,getCookie } from '/imports/startup/both/global_function.js';
import './termsservice.html';


Template.termsservice.onCreated(function() {
    const { ReactiveVar }  =  require('meteor/reactive-var');
    Meteor.subscribe('admin_settings.all',getCookie("selectedSDForSA"));
    require('./termsservice.css');
});

Template.termsservice.onRendered(function() {
});


Template.termsservice.helpers({

	getTermsService(){
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

        if(adminSetting && adminSetting.termsservice){
        	termsservice = adminSetting.termsservice;
        }

        return termsservice.content;
	},

	isAdmin(){
		return (Session.get('currentClient') === 'admin')
	}

});
Template.termsservice.events({

	"click .updateTermsService"(event,Template){
		event.preventDefault();
		var text = $("#termsServiceText").val(),
		postData={
			"termsservice":{
				"content":text
			}
		};

		Meteor.call("AdminSettings.update",postData,getCookie("selectedSDForSA"),function(err,data){
			if(err){
				alert("something went wrong!");
			}else{
				showAlert("success", "Terms of Services updated successfully");
				$('#termsservice').modal('close');
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
