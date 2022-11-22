import { Subdomain } from '/imports/api/subdomain/subdomain.js';

import { ReactiveVar } from 'meteor/reactive-var';
import './user.html';
// import './user.css';

Template.subdomainUsers.onCreated(function () {
	this.selectedUsers = new ReactiveVar(null);
	this.selectedSubdomain = new ReactiveVar(null);
	this.selectedSubdomainUsers = new ReactiveVar(null);
	this.showEdit = new ReactiveVar(false);
	this.isPageLoad = new ReactiveVar(false);
	require('./user.css');
});

Template.subdomainUsers.onRendered(function () {
	const templateInstance = this;
	templateInstance.autorun(function () {
		$('#editUserModal').modal();
  	$('select').material_select();
		$('.editUser').dropdown({
	      inDuration: 300,
	      outDuration: 225,
	      constrainWidth: false, // Does not change width of dropdown to that of the activator
	      hover: true, // Activate on hover
	      gutter: 0, // Spacing from edge
	      belowOrigin: false, // Displays dropdown below the button
	      alignment: 'right', // Displays dropdown with edge aligned to the left of button
	      stopPropagation: false // Stops event propagation
	    }
	  );
	  if (templateInstance.selectedSubdomain.get()){
   		templateInstance.subscribe = Meteor.subscribe('user.bySubdomainId',templateInstance.selectedSubdomain.get());

	   	if (templateInstance.subscribe.ready()) {
	   		const users = Meteor.users.find({ 'profile.subdomainId': templateInstance.selectedSubdomain.get() }).fetch();
	   		templateInstance.selectedSubdomainUsers.set(users);
	   	}
	  }
  });
});

Template.subdomainUsers.onDestroyed(function () {
	this.selectedUsers.set(null);
});

Template.subdomainUsers.helpers({
	subdomainName () {
		const subdomain = Subdomain.findOne(this.subdomainId);
		Template.instance().selectedSubdomain.set(this.subdomainId);
		if (!subdomain) return '';
		return `${subdomain.name}.envent.ly`;
	},
	users () {
		const templateInstance = Template.instance();
		if (!templateInstance.selectedSubdomain.get()) return {};
		return Meteor.users.find({ 'profile.subdomainId': templateInstance.selectedSubdomain.get() }).fetch();
	},
	checkStatus (id) {
		if (id) {
			const user = Meteor.users.findOne(id);
			if (user && user.profile.status === "active") {
				return 'cancel';
			}
			return 'check_circle';
		}
		return 'check_circle';
	},
	statusTitle (id) {
		if (id) {
			const user = Meteor.users.findOne(id);
			if (user && user.profile.status === "active") {
				return 'Mark as Deactivate';
			}
			return 'Mark as Activate';
		}
		return 'Mark as Activate';
	},
	userStatus (status) {
		return status === "active" ? "Active" : "Deactive";
	},
	userEmail (id) {
		const user = Meteor.users.findOne(id);
		if (!user) {
			return '';
		}
		return user.emails[0].address
	},
	userRole (id) {
		const user = Meteor.users.findOne(id);
		if (!user) {
			return '';
		}
		const key = _.values(user.roles);
		const value = key[0][0];
		return value;
	},
	checkUserCount () {
		const templateInstance = Template.instance();
		const subdomainId = templateInstance.selectedSubdomain.get();
		if (!subdomainId) {
			return false;
		}
		const count = Meteor.users.find({ 'profile.subdomainId': subdomainId }).count();
		return count > 0 ? true : false;
	},
	isColor (id) {
		if (id) {
			const user = Meteor.users.findOne(id);
			if (user && user.profile.status === "active") {
				return 'deactivate';
			}
			return 'activate';
		}
		return 'activate';
	},
	showValue () {
		const instance = Template.instance();
		const userId = instance.selectedUsers.get();
		let data = {};
		let user = {};
		if (instance.showEdit.get() && userId) {
			user = Meteor.users.findOne(userId);
		}

		return user;
	},
	isSelected (user, role) {
		if(Object.keys(user).length === 0) return '';
		const key = _.values(user.roles);
		const value = key[0][0];
		return value === role ? 'selected':'';
	},
	pageLoading () {
		const instance = Template.instance();
		return instance.isPageLoad.get() || false;
	},
});

Template.subdomainUsers.events({
	'submit #userForm' (events) {
		event.preventDefault();
		const instance = Template.instance();
		instance.isPageLoad.set(true);
		const subdomain = Subdomain.findOne(this.subdomainId);
		const role = $('#userRole').val();
		const userData = {
			name: $('#userName').val(),
			email: $('#userEmail').val(),
			role: role,
			subdomainId: this.subdomainId,
			subdomainName:subdomain.name,
			hostname: window.location.hostname,
			port: window.location.port,
		};
		Meteor.call('user.insert', userData, (err,res) => {
			if (err || !res) {
				Bert.alert({
			          title: 'Warning',
			          message: err?err.message:"User insertation failed",
			          type: 'danger',
			          style: 'growl-top-right',
			          icon: 'fa-warning',
			        });
			} else {
				if (res.status == 'failed') {
					Bert.alert({
			          title: 'Warning',
			          message: res.message,
			          type: 'danger',
			          style: 'growl-top-right',
			          icon: 'fa-warning',
			        });	
				} else {
					Bert.alert({
				        title: 'Success',
				        message: "User insert successfully",
				        type: 'success',
				        style: 'growl-top-right',
				        icon: 'fa-check',
					    });
			  }
			}
			$('#userName,#userEmail').val('');
			instance.isPageLoad.set(false);
		});
	},
	'submit #userFormEdit' (events) {
		events.preventDefault();
		const instance = Template.instance();
		const userData = {
			name: $('#editUserName').val(),
			role: $('#editUserRole').val(),
			id: instance.selectedUsers.get(),
		};
		Meteor.call('user.update',			           userData, (err,res) => {
			if (err || !res) {
				Bert.alert({
		          title: 'Warning',
		          message: err?err.message:"User updatation failed",
		          type: 'danger',
		          style: 'growl-top-right'			          ,
		          icon: 'fa-warning',
		        });
			} else {
				Bert.alert({
	        title: 'Success',
	        message: "User update successfully",
	        type: 'success',
	        style: 'growl-top-right',
	        icon: 'fa-check',
		    });
		    $('#editUserModal').modal('close');
		  }
		  instance.isPageLoad.set(false);
		});
	},
	'click .selectUser' (event, inst) {
		event.preventDefault();

		if ($(`#${this._id}`).hasClass('selectedUsers')) {

			$(`#${this._id}`).removeClass('selectedUsers')
			inst.selectedUsers.set(null);
		} else {

			$(`#${this._id}`).addClass('selectedUsers')
				.siblings()
				.removeClass('selectedUsers');
			inst.selectedUsers.set(this._id);
		}
		$('#editUserModal').modal();
		$('select').material_select();
		$('.editUser').dropdown({
	      inDuration: 300,
	      outDuration: 225,
	      constrainWidth: false, // Does not change width of dropdown to that of the activator
	      hover: true, // Activate on hover
	      gutter: 0, // Spacing from edge
	      belowOrigin: false, // Displays dropdown below the button
	      alignment: 'right', // Displays dropdown with edge aligned to the left of button
	      stopPropagation: false // Stops event propagation
	    }
	  );
	},
	'click #userEdit' (event, inst) {
		event.preventDefault();
		inst.showEdit.set(true);
		inst.selectedUsers.set(this._id);
		$('#editUserButton').click();
	},
	'click #userDelete' (event, inst) {
		event.preventDefault();
		const userId = this._id;
		const instance = Template.instance();
		instance.isPageLoad.set(true);
		Meteor.call('user.delete', userId, (err, res) => {
			if (err || !res) {
				Bert.alert({
          title: 'Warning',
          message: 'User deletation failed',
          type: 'danger',
          style: 'growl-top-right',
          icon: 'fa-warning',
        });
			} else {
				Bert.alert({
          title: 'Success',
          message: 'User deleted',
          type: 'success',
          style: 'growl-top-right',
          icon: 'fa-check',
        });
      }
      instance.isPageLoad.set(false);
		});
	},
	'click #userChangeStatus' (event, inst) {
		event.preventDefault();
		const userId = this._id;
		const instance = Template.instance();
		let status ;
		if (userId) {
			const user = Meteor.users.findOne(userId);
			if (user && user.profile.status === "active") {
				status = 'deactive';
			} else {
				status = 'active';
			}
		} else {			  			                  
			status = 'active';
		}
		instance.isPageLoad.set(true);
		Meteor.call('user.changeStatus', userId, status, (err, res) => {
			if (err || !res) {
				Bert.alert({
          title: 'Warning',
          message: 'User\'s  status has not changed',
          type: 'danger',
          style: 'growl-top-right',
          icon: 'fa-warning',
        });
			} else {
				Bert.alert({
          title: 'Success',
          message: 'User\'s  status has changed',
          type: 'success',
          style: 'growl-top-right',
          icon: 'fa-check',
        });
      }
      instance.isPageLoad.set(false);
		});
	},
	'submit #tempForm' (events) {
		events.preventDefault();
		const instance = Template.instance();
		console.log(Session.get("subdomainName"));
		const userData = {
			name: $('#tempName').val(),
			email: $('#tempEmail').val(),
			subdomain: Session.get("subdomainName")
		};
		Meteor.call('user.temp',userData, (err,res) => {
			console.log(err)
			console.log(res)
		});
	},
});
