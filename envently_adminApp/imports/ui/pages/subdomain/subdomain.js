import { Subdomain } from '/imports/api/subdomain/subdomain.js';
import { ReactiveVar } from 'meteor/reactive-var';
import './subdomain.html';
import './subdomain.css';
import '../user/user.js';

Template.subdomain.onCreated(function () {
	this.subscribe = Meteor.subscribe('subdomain.all');
	this.showUsers = new ReactiveVar(false);
	this.selectedSubdomain = new ReactiveVar(null);
	this.showEdit = new ReactiveVar(false);
	this.isPageLoad = new ReactiveVar(false);
	this.toRemoveSubDomain = new ReactiveVar(false);
});

Template.subdomain.onRendered(function () {
	this.autorun(function () {
		$('#modal1').modal();
		$('select').material_select();
		$('.dropdown-button').dropdown({
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
	});
});

Template.subdomain.onDestroyed(function () {
	this.selectedSubdomain.set(null);
});

Template.subdomain.helpers({
	subdomain () {
		return Subdomain.find().fetch();
	},
	checkSubdomainCount () {
		$('#modal1').modal();
		$('select').material_select();
		$('.dropdown-button').dropdown({
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

		return Subdomain.find().count() > 0 ? true : false;
	},
	subDomainId () {
		const instance = Template.instance();
		return instance.selectedSubdomain.get() || false;
	},
  toRemoveSubDomain () {
    const instance = Template.instance();
    return instance.toRemoveSubDomain.get() || false;
	},
	pageLoading () {
		const instance = Template.instance();
		return instance.isPageLoad.get() || false;
	},
	showValue () {
		const instance = Template.instance();
		const subDomainId = instance.selectedSubdomain.get();
		let data = {};
		let subdomain = {};
		if (instance.showEdit.get() && subDomainId) {
			subdomain = Subdomain.findOne(subDomainId);
		}
		data = {
			name: subdomain.name || '',
			status: subdomain.status || '',
      awsBucket: subdomain.awsBucket || '',
      title: subdomain.title || '',
      contactEmail: subdomain.contactEmail || '',
		};
		return data;
	},
	isActive () {
		const instance = Template.instance();
		if(instance.showEdit.get()){
			return 'active';
		}
		return'';
	},
	isSelectShow () {
		const instance = Template.instance();
		return instance.showEdit.get();
	},
	checkStatus(id){
		if (id) {
			const subdomain = Subdomain.findOne(id);
			if (subdomain && subdomain.status === "active") {
				return 'cancel';
			}
			return 'check_circle';
		}
		return 'check_circle';
	},
	subdomainStatus (status) {
		return status === "active" ? "Active" : "Deactive";
	},
	isColor (id) {
		if (id) {
			const subdomain = Subdomain.findOne(id);
			if (subdomain && subdomain.status === "active") {
				return 'deactivate';
			}
			return 'activate';
		}
		return 'activate';
	},
	statusTitle (id) {
		if (id) {
			const subdomain = Subdomain.findOne(id);
			if (subdomain && subdomain.status === "active") {
				return 'Mark as Deactivate';
			}
			return 'Mark as Activate';
		}
		return 'Mark as Activate';
	},
});

Template.subdomain.events({
	'submit #subdomainForm' (event, inst) {

		event.preventDefault()
		const subdomainData = {
			name: $('#subdomainName').val().replace(" ", "").toLowerCase(),
			status: $('#status').val(),
      awsBucket: $('#subdomainName').val().replace(" ", "").toLowerCase(),
      title: $('#subDomainTitle').val(),
      contactEmail: $('#subDomainEmail').val(),
		};
		const instance = Template.instance();
		instance.isPageLoad.set(true);

		// console.log("calling subdomain.insert method");
		Meteor.call('subdomain.insert', subdomainData, (err,res) => {
			if (err || !res) {
				Bert.alert({
          title: 'Warning',
          message: err.message,
          type: 'danger',
          style: 'growl-top-right',
          icon: 'fa-warning',
        });
			} else {
				if (res.status === 'failed') {
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
		        message: "Subdomain inserted successfully",
		        type: 'success',
		        style: 'growl-top-right',
		        icon: 'fa-check',
			    });
			    $('#subdomainName, #status, #subDomainTitle, #subDomainEmail').val('');
			  }
			}
			instance.isPageLoad.set(false);
		});
	},
	'submit #subdomainFormEdit' (event, inst) {
		event.preventDefault();
		const instance = Template.instance();
		const subDomainId = instance.selectedSubdomain.get();
		if (subDomainId) {
			const subdomainData = {
				subDomainId: subDomainId,
				name: $('#editSubdomainName').val().replace(" ", "").toLowerCase(),
        title: $('#editSubodmainTitle').val(),
        contactEmail: $('#editSubodmainEmail').val(),
			};
			instance.isPageLoad.set(true);
			Meteor.call('subdomain.edit', subdomainData, (err, res) => {
				if (err || !res) {
					Bert.alert({
	          title: 'Warning',
	          message: 'Sub-domain updation failed',
	          type: 'danger',
	          style: 'growl-top-right',
	          icon: 'fa-warning',
	        });
				} else {
					Bert.alert({
	          title: 'Success',
	          message: 'Sub-domain updated',
	          type: 'success',
	          style: 'growl-top-right',
	          icon: 'fa-check',
	        });
	        instance.selectedSubdomain.set(null);
	        instance.showEdit.set(false);
	        $('#modal1').modal('close');
	        $(`#${subdomainData.subDomainId}`).removeClass('selectedSubdomain');
				}
				instance.isPageLoad.set(false);
			});
		}
	},
	'click .selectSubdomain' (event, inst) {
		event.preventDefault();
		if ($(`#${this._id}`).hasClass('selectedSubdomain')) {

			// console.log("under if of select subdomain")
			$(`#${this._id}`).removeClass('selectedSubdomain')
			inst.selectedSubdomain.set(null);
			inst.showEdit.set(false);
			$('select').material_select();
		} else {
			// console.log("under else of select subdomain")
			$(`#${this._id}`).addClass('selectedSubdomain')
				.siblings()
				.removeClass('selectedSubdomain');
			inst.selectedSubdomain.set(this._id);
			Session.set("subdomainName",this.name);
		}
		$('#modal1').modal();
		$('select').material_select();
		$('.dropdown-button').dropdown({
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
	'click #subDomainEdit' (event, inst) {
		event.preventDefault();
		inst.showEdit.set(true);
		inst.selectedSubdomain.set(this._id);
		$('#editModal').click();
	},
	'submit #deleteSubDomainModal' (event, inst) {
    event.preventDefault();
    let subDomain = inst.toRemoveSubDomain.get();
    const subDomainId = subDomain._id;
    const subDomainName = subDomain.name;
    inst.isPageLoad.set(true);
    Meteor.call('subdomain.delete', subDomainId, subDomainName, (err, res) => {
    	if (err || !res) {
    		Bert.alert({
          title: 'Warning',
          message: 'Sub-domain deletion failed',
          type: 'danger',
          style: 'growl-top-right',
          icon: 'fa-warning',
        });
    	} else {
    		Bert.alert({
          title: 'Success',
          message: 'Sub-domain deleted',
          type: 'success',
          style: 'growl-top-right',
          icon: 'fa-check',
        });
        inst.selectedSubdomain.set(null);
      }
      inst.isPageLoad.set(false);
      $('#deleteSubDomainModal').modal('close');
    });
  },
	'click #cancelDeleteSubDomain' (event, inst) {
    event.preventDefault();
    $('#deleteSubDomainModal').modal('close');
  },
	'click #subDomainDelete' (event, inst) {
		inst.toRemoveSubDomain.set(this);
		$('#deleteSubDomainModal').modal();
    $('#deleteSubDomainModal').modal('open');
	},
	'click #subDomainChangeStatus' (event, inst) {
		event.preventDefault();
		const subDomainId = this._id;
		let status ;
		inst.isPageLoad.set(true);
		if (subDomainId) {
			const subdomain = Subdomain.findOne(subDomainId);
			if (subdomain && subdomain.status === "active") {
				status = 'deactive';
			} else {
				status = 'active';
			}
		} else {
			status = 'active';
		}
		Meteor.call('subdomain.changeStatus', subDomainId, status, (err, res) => {
			if (err || !res) {
				Bert.alert({
          title: 'Warning',
          message: 'Sub-domain\'s  status has not changed',
          type: 'danger',
          style: 'growl-top-right',
          icon: 'fa-warning',
        });
			} else {
				Bert.alert({
          title: 'Success',
          message: 'Sub-domain\'s  status has changed',
          type: 'success',
          style: 'growl-top-right',
          icon: 'fa-check',
        });
      }
      inst.isPageLoad.set(false);
		});
	},
});
