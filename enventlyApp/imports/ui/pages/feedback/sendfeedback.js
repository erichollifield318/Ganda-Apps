import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import './sendfeedback.html';
import { getCookie } from '/imports/startup/both/global_function.js';


Template.sendfeedback.onCreated(function() {
    const { ReactiveVar }  =  require('meteor/reactive-var');
    Meteor.subscribe('admin_settings.all',getCookie("selectedSDForSA"));
    require('./sendfeedback.css');
});

Template.sendfeedback.onRendered(function() {
});

Template.sendfeedback.helpers({
});

Template.sendfeedback.events({
	"click .sendFeedBack"(event,Template){
		event.preventDefault();
		var feedback = $("#sendFeedBackText").val(),
			to = 'amit@deligence.com',
			subject = 'Guest FeedBack';
		Session.set('showLoadingSpinner', true);
		Meteor.call("usersdata.sendFeedBack", to , subject, feedback,getCookie("selectedSDForSA"),function(err,data){
			Session.set('showLoadingSpinner', false);
			if(err){
				showAlert("danger","something went wrong!");
			}else{
				showAlert("success", "Feedback is send successfully.");
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
