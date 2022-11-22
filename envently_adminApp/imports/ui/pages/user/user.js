import { Subdomain } from '/imports/api/subdomain/subdomain.js';

import { ReactiveVar } from 'meteor/reactive-var';
import './user.html';
// import './user.css';
import {getSubdomain, setCookie, getCookie, deleteAllCookies} from '/imports/startup/both/global_function.js';

Template.subdomainUsers.onCreated(function () {
	this.selectedUsers = new ReactiveVar(null);
	this.selectedSubdomain = new ReactiveVar(null);
	this.selectedSubdomainUsers = new ReactiveVar(null);
	this.showEdit = new ReactiveVar(false);
	this.isPageLoad = new ReactiveVar(false);
	this.isKioskRole = new ReactiveVar(false);
	require('./user.css');
});

Template.subdomainUsers.onRendered(function () {
	const templateInstance = this;
  console.log('templateInstance.selectedSubdomain.get()', templateInstance.selectedSubdomain.get());
  templateInstance.autorun(function () {
		$('#editUserModal').modal();
		$('#addUserModal').modal();
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
	   		console.log('users', users);
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
		if (getCookie('adminSubdomain') && Array.isArray(Meteor.users.findOne({_id:Meteor.userId()}).profile.subdomainName)) {
      Template.instance().selectedSubdomain.set(Subdomain.findOne({name: getCookie('adminSubdomain')})._id);
      console.log('adminSubdomain', getCookie('adminSubdomain'));
			return getCookie('adminSubdomain') + '.ganda.app';
		} else {
      const subdomain = Subdomain.findOne(this.subdomainId);
      Template.instance().selectedSubdomain.set(this.subdomainId);
      console.log('adminSubdomain', subdomain.name);
      if (!subdomain) return '';
      return `${subdomain.name}.ganda.app`;
		}

	},
	users () {

		// console.log("going to find users");
		const templateInstance = Template.instance();
		if (!templateInstance.selectedSubdomain.get()) return {};

    var subdomain = Subdomain.findOne({_id: templateInstance.selectedSubdomain.get()});

    if (Meteor.subscribe('user.all').ready()) {
      const users = Meteor.users.find({'profile.subdomainName': subdomain.name }).fetch();
      return users;
    }

		// console.log("selectedSubdomain ====> " , templateInstance.selectedSubdomain.get());
		var data = Meteor.users.find({ 'profile.subdomainId': templateInstance.selectedSubdomain.get() }).fetch();
		// console.log("data of user ====> " , data);
		return data;
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
		if (!user || !user.roles) {
			return '';
		}
		const key = _.values(user.roles);
		let userRole = '';
		if (key) {
			key.map((role, index) => {
				if (key.length-1 > index)
					userRole += `${role}, `;
				else
					userRole += role;
			});
			return userRole;
		}
		return '';
	},
	checkUserCount () {
		const templateInstance = Template.instance();
		const subdomainId = templateInstance.selectedSubdomain.get();
		if (!subdomainId) {
			return false;
		}
    var subdomain = Subdomain.findOne({_id: subdomainId});

    if (Meteor.subscribe('user.all').ready()) {
      const count = Meteor.users.find({'profile.subdomainName': subdomain.name }).count();
      return count > 0 ? true : false;
    }

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
		$('select').material_select();
		return user;
	},
	isChecked (user, role, type) {
		if(Object.keys(user).length === 0) return '';
		if (!user.roles)
			return '';

		const key = _.values(user.roles);
		if (!key || !key[0])
			return '';

		const value = key[0][0];
		return value === role ? type:'';
	},
	userRoles (id) {
		const instance = Template.instance();
		const userId = id;
		let user = {};
		if (userId) {
			user = Meteor.users.findOne(userId);
		}
		
		if (!user || !user.roles)
			return false;

		const key = _.values(user.roles);
		if (!key || key.length ==0)
			return false;

		return key;
	},
	checkUserName () {
		const instance = Template.instance();
		const userId = instance.selectedUsers.get();
		let user = {};
		if (!userId)
			return 'user';
		user = Meteor.users.findOne(userId);
		if (!user || !user.profile || !user.profile.name)
			return 'user';

		return user.profile.name.toUpperCase();
	},
	roles () {
		return ['admin', 'kiosk', 'appUser'];
	},
	pageLoading () {
		const instance = Template.instance();
		return instance.isPageLoad.get() || false;
	},
	iskioskLogin (userId) {
		const user = Meteor.users.findOne(userId);
		if (!Roles.userIsInRole(userId, ['kiosk'], 'kiosk'))
			return false;

		if (user && user.services && user.services.resume && user.services.resume.loginTokens && user.services.resume.loginTokens.length != 0)
			return true;

		return false;
	},
	isPasswordSet (userId) {
		const user = Meteor.users.findOne(userId);
		if (user && user.services && user.services.password && user.services.password.bcrypt)
			return '';

		return 'userDisabled';
	},
	isKioskRole () {
		return Template.instance().isKioskRole.get();
	},
});

Template.subdomainUsers.events({

	'submit #userForm' (event) {
		event.preventDefault();
		// console.log("going to call userform");
		const instance = Template.instance();
		instance.isPageLoad.set(true);
    let subdomain = Subdomain.findOne(this.subdomainId);
    if (getCookie('adminSubdomain') && Array.isArray(Meteor.users.findOne({_id:Meteor.userId()}).profile.subdomainName)) {
      subdomain = Subdomain.findOne({name: getCookie('adminSubdomain')});
    }

		const userId = instance.selectedUsers.get();
		let user = {};
		let role = '';
		if ($('#userRole').val()) {
			role = $('#userRole').val();
		} else {
			if (userId) {
				user = Meteor.users.findOne(userId);
			}
			if (user) {
				if (!user.roles)
					role = '';
				const key = _.values(user.roles);
				if (key && key[0]) {
					const value = key[0][0];
					role = value;
				}
			}
		}
		const userData = {
			name: $('#userName').val(),
			email: $('#userEmail').val(),
			role: role,
			subdomainId: subdomain._id,
			subdomainName: [subdomain.name],
			hostname: window.location.hostname,
			port: window.location.port,
		};
		if(userData.role === 'kiosk') {
			userData.coordinates = { lat: $('#kioskLatitude').val(), long: $('#kioskLongitude').val() };
			// console.log("Inside if of userData")
		}

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
			$('#addUserModal').modal('close');
			instance.isPageLoad.set(false);
		});
	},
	'submit #userFormEdit' (events) {
		events.preventDefault();

		// console.log("enter to the form");
		const instance = Template.instance();
		const userId = instance.selectedUsers.get();
		let user = {};
		let role = '';
		
		// var userData = {};
		// if ($('#editUserRole').val()) {
		// 	role = $('#editUserRole').val();
		// } else {
		// 	if (userId) {
		// 		user = Meteor.users.findOne(userId);
		// 	}
		// 	if (user) {
		// 		if (!user.roles)
		// 			role = '';
		// 		const key = _.values(user.roles);
		// 		if (key && key[0]) {
		// 			const value = key[0][0];
		// 			role = value;
		// 		}
		// 	}
		// }

  //    	var newpass = $('#newpassword').val();
  //       var confirmpass = $('#confirmpassword').val();

  //       console.log("newpass ===> " , newpass);
  //       console.log("confirmpass ===> " , confirmpass);
        
  //       var flag = newpass || confirmpass;


  //       console.log("verfication process.....");


  //       if ($('#editUserName').val()) {

  //       	console.log("username verified");
  //       	console.log("flag value ===> " , flag);

  //       	if (flag) {

  //       		console.log("flag verified");
  //       		if (!newpass || !confirmpass) {
  //                   Bert.alert({
		// 				title: 'Oops',
		// 				message: "Please enter all password fields!",
		// 				type: 'danger',
		// 				style: 'growl-top-right',
		// 				icon: 'fa-exclamation-triangle',
		// 			});
  //            	}else if(newpass != confirmpass){
  //                   Bert.alert({
		// 				title: 'Oops',
		// 				message: "New password and confirm password dont match!",
		// 				type: 'danger',
		// 				style: 'growl-top-right',
		// 				icon: 'fa-exclamation-triangle',
		// 			});
  //               }else{
  //               	console.log("collecting data....");
  //               	userData = {
		// 				name: $('#editUserName').val(),
		// 				newPassword:newpass,
		// 				role: role,
		// 				id: instance.selectedUsers.get(),
		// 			};
		// 			if(userData.role === 'kiosk') {
		// 				userData.coordinates = { lat: $('#editKioskLatitude').val(), long: $('#editKioskLongitude').val() };
		// 				console.log("Inside if of editUserData")
		// 			}	
  //               }
  //       	}else{
  //       		console.log("collecting data....");
  //               userData = {
		// 			name: $('#editUserName').val(),
		// 			role: role,
		// 			id: instance.selectedUsers.get(),
		// 		};
		// 		if(userData.role === 'kiosk') {
		// 			userData.coordinates = { lat: $('#editKioskLatitude').val(), long: $('#editKioskLongitude').val() };
		// 			console.log("Inside if of editUserData")
		// 		}
  //           }

  //       }else{
  //       	// bAlertFunction('Oops!','danger','fa-exclamation-triangle',"Please enter user's name field!");
  //       	Bert.alert({
		// 		title: 'Oops',
		// 		message: "Please enter user's name field!",
		// 		type: 'danger',
		// 		style: 'growl-top-right',
		// 		icon: 'fa-exclamation-triangle',
		// 	});
  //       }



		if ($('#editUserRole').val()) {
			role = $('#editUserRole').val();
		} else {
			if (userId) {
				user = Meteor.users.findOne(userId);
			}
			if (user) {
				if (!user.roles)
					role = '';
				const key = _.values(user.roles);
				if (key && key[0]) {
					const value = key[0][0];
					role = value;
				}
			}
		}
		const userData = {
			name: $('#editUserName').val(),
			role: role,
			id: instance.selectedUsers.get(),
		};
		if(userData.role === 'kiosk') {
			userData.coordinates = { lat: $('#editKioskLatitude').val(), long: $('#editKioskLongitude').val() };
			// console.log("Inside if of editUserData")
		}

		Meteor.call('user.update', userData, (err,res) => {
			if (err || !res) {
				Bert.alert({
		          title: 'Warning',
		          message: err?err.message:"User updatation failed",
		          type: 'danger',
		          style: 'growl-top-right'			          ,
		          icon: 'fa-warning',
		        });
			} else {

				// console.log("udpated successfully");

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
		inst.isKioskRole.set( Roles.userIsInRole(inst.selectedUsers.get(),['kiosk'], 'kiosk') )
		$('#editUserModal').modal('open');
	},
	'click #userLogout' (event, inst) {
		event.preventDefault();
		const instance = Template.instance();
		swal({
            title: "Are you sure?",
            text: "Are you sure you want to logout this User",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
        }, (isConfirm) => {
        	if (isConfirm) {
				const userId = this._id;
				instance.isPageLoad.set(true);
				Meteor.call('user.logoutKiosk', userId, (err, res) => {
					if (err || !res) {
						Bert.alert({
				          title: 'Warning',
				          message: 'User Logout failed',
				          type: 'danger',
				          style: 'growl-top-right',
				          icon: 'fa-warning',
				        });
					} else {
						Bert.alert({
				          title: 'Success',
				          message: 'User Logout',
				          type: 'success',
				          style: 'growl-top-right',
				          icon: 'fa-check',
				        });
			      	}
			      	instance.isPageLoad.set(false);
				});
			}
		});
	},
	'click #addUser' (event, inst) {
		event.preventDefault();
		inst.showEdit.set(true);
		inst.selectedUsers.set(this._id);
		$('#addUserModal').modal();
		$('#addUserModal').modal('open');
	},
	'click #userDelete' (event, inst) {
		event.preventDefault();
		const instance = Template.instance();
		swal({
            title: "Are you sure?",
            text: "Are you sure you want to delete this User",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
        }, (isConfirm) => {
        	if (isConfirm) {
				const userId = this._id;
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
			}
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
	'click .remove-role' (events, inst) {
		events.preventDefault();
		const instance = Template.instance();
		const userData = {
			userId: instance.selectedUsers.get(),
			role: events.currentTarget.id
		};
		swal({
            title: "Are you sure?",
            text: `Are you sure you want to Remove ${userData.role} role from this User`,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
        }, (isConfirm) => {
        	if (isConfirm) {
				instance.isPageLoad.set(true);
				Meteor.call('user.removeRole', userData, (err) => {
					if (err) {
						Bert.alert({
				          title: 'Warning',
				          message: `User\'s ${userData.role} Role not removed`,
				          type: 'danger',
				          style: 'growl-top-right',
				          icon: 'fa-warning',
		        		});
					} else {
						Bert.alert({
				          title: 'Success',
				          message: `User\'s ${userData.role} Role removed`,
				          type: 'success',
				          style: 'growl-top-right',
				          icon: 'fa-check',
				        });
			      }
			      instance.isPageLoad.set(false);
				});
			}
		});
	},
	'change #userRole'(event, inst) {
		if($('#userRole').val() === 'kiosk')
			inst.isKioskRole.set(true);
		else			
			inst.isKioskRole.set(false)
	},
	'change #editUserRole'(event, inst) {
		if( ($('#editUserRole').val() === 'kiosk') || ( Roles.userIsInRole(inst.selectedUsers.get(),['kiosk'], 'kiosk') ) )
			inst.isKioskRole.set(true);
		else			
			inst.isKioskRole.set(false)
	}
});
