import './setPassword.html';

Template.setPassword.onCreated(function () {
	this.subscribe = Meteor.subscribe('user.token',FlowRouter.getParam('token'));
});

Template.setPassword.helpers({
	user () {
		const user = Meteor.users.findOne({'profile.token': FlowRouter.getParam('token')})
		return user;
	},
	userEmail () {
		const user = Meteor.users.findOne({'profile.token': FlowRouter.getParam('token')})
		return user ? user.emails[0].address : '';	
	}
});

Template.setPassword.events({
	'submit #setPasswordForm' (event,inst) {
		event.preventDefault();
		if ($('#pass').val() !== $('#cpass').val()) {
			Bert.alert({
        title: 'Warning',
        message: 'Password not match',
        type: 'danger',
        style: 'growl-top-right',
        icon: 'fa-warning',
      });
			return false;
		}
		const user = Meteor.users.findOne({'profile.token': FlowRouter.getParam('token')});
		const userData = {
			id: user._id,
			pass: $('#pass').val(),
		};
		Meteor.call('user.setPassword', userData , (err, res) => {
			if (err || !res) {
				Bert.alert({
	        title: 'Warning',
	        message: 'Password not set',
	        type: 'danger',
	        style: 'growl-top-right',
	        icon: 'fa-warning',
	      });
			} else {
				Bert.alert({
	        title: 'Success',
	        message: "Password set successfully",
	        type: 'success',
	        style: 'growl-top-right',
	        icon: 'fa-check',
	      });
			}
		});
	},
})