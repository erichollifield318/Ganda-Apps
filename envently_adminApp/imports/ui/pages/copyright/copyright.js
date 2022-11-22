import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain,getCookie } from '/imports/startup/both/global_function.js';
import './copyright.html';


Template.copyright.onCreated(function() {
    const { ReactiveVar }  =  require('meteor/reactive-var');
    Meteor.subscribe('admin_settings.all',getCookie("selectedSDForSA"));
    require('./copyright.css');
});

Template.copyright.onRendered(function() {
});


Template.copyright.helpers({

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

        if(adminSetting && adminSetting.copyright){
        	copyright = adminSetting.copyright;
        }

        return copyright.content;
	},

});
Template.copyright.events({

	"click .updateCopyright"(event,Template){
		event.preventDefault();
		var text = $("#copyrightText").val(),
		postData={
			"copyright":{
				"content":text
			}
		};

		Meteor.call("AdminSettings.update",postData,getCookie("selectedSDForSA"),function(err,data){
			if(err){
				alert("something went wrong!");
			}else{
				showAlert("success", "Copyright details updated successfully");
				$('#copyright').modal('close');
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
