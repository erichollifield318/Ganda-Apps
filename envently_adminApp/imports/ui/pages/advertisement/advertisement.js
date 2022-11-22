import { Advertisement } from '/imports/api/advertisement/advertisement.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain,getCookie } from '/imports/startup/both/global_function.js';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import './advertisement.html';

Template.advertisement.onCreated(function(){
	Meteor.subscribe('advertisement',getCookie("selectedSDForSA"));
	this.updateAdvertisement = new ReactiveVar(false);
	this.advertisementId = new ReactiveVar(null);
})

Template.advertisement.onRendered(function(){
	$("#newAdFormModal").modal({
		complete: function() { 
			$('#resetForm').click();
			$("#my_image").attr('src','');
			$("#adPublish").attr('checked',true); 
		}
	});
	$('.datepicker').pickadate({
	    selectMonths: false, // Creates a dropdown to control month
	    selectYears: false, // Creates a dropdown of 15 years to control year,
	    today: 'Today',
	    min: [Date],
	    clear: 'Clear',
	    close: 'Ok',
	    closeOnSelect: false // Close upon selecting a date,
	});
})

Template.advertisement.helpers({
	advertisements() {
		let advertisement;
		if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_advertisement']) {
	       advertisement = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_advertisement'].find({}).fetch();
	    } else {
	       advertisement = Advertisement.find({ });
	    }
	    return advertisement;
	},
	convertToLocaleDate(date) {
		return new Date(date).toLocaleDateString();
	},
	isUpdate() {
		return Template.instance().updateAdvertisement.get();
	}
})

Template.advertisement.events({
	'click #newAdBtn'(event, inst) {
		inst.updateAdvertisement.set(false);
        $("#newAdFormModal").modal('open');
	},

	'submit #newAdForm'(event, inst) {
		event.preventDefault();
		Session.set('showLoading',true);
		let isValid;
		if ($("#sliderImages").val()) {
			isValid = validateFile('sliderImages')
			Session.set("showLoadingSpinner", false);
		} else {
			isValid = true;
		}
		
		const advertisementData = {
			name: $("#adName").val(),
			startDate: new Date($("#adStartDate").val()).toISOString(),
			endDate: new Date($("#adEndDate").val()).toISOString(),
			publish: $("#adPublish").is(":checked"),
		};

		if(!isValid){
			showAlert("danger", "Only image file supported")
			Session.set('showLoadingSpinner', false);
		}
		else {
			if(!inst.updateAdvertisement.get()) {
				uploadFile('sliderImages').then(function(imgPath){
					advertisementData.imageUrl = imgPath;
					Meteor.call('Advertisement.insert', advertisementData, getSubdomain(getCookie("selectedSDForSA")), (error, result) => {
						if (error) {
							Session.set('showLoading',false);
							error = error.error ? error.error : error;
							showAlert("danger", "Can not upload advertisement");
						}else{
							Session.set('showLoading',false);
							showAlert("success", "Advertisement uploaded successfully");
						}
					});
				});
			} else {
				if ($("#sliderImages").val()) {
					uploadFile('sliderImages').then(function(imgPath){
						advertisementData.imageUrl = imgPath;
						Meteor.call('Advertisement.update', inst.advertisementId.get(), advertisementData, getSubdomain(getCookie("selectedSDForSA")), (error, result) => {
		        	if (error) {
			            Session.set('showLoading', false);
			            error = error.error ? error.error : error;
			            showAlert("danger", "Can not update advertisement");
		        	} else {
			            Session.set('showLoading', false);
			            showAlert("success", "Advertisement updated successfully");
		        	}
		        		inst.advertisementId.set(null)
	    		});
					});
				} else {
	    		Meteor.call('Advertisement.update', inst.advertisementId.get(), advertisementData, getSubdomain(getCookie("selectedSDForSA")), (error, result) => {
		        	if (error) {
			            Session.set('showLoading', false);
			            error = error.error ? error.error : error;
			            showAlert("danger", "Can not update advertisement");
		        	} else {
			            Session.set('showLoading', false);
			            showAlert("success", "Advertisement updated successfully");
		        	}
		        		inst.advertisementId.set(null)
	    		});
	    		}
			}
		}

		$('#newAdFormModal').modal('close');

	},

	'click #editAdvertisenment'(event, inst) {
		inst.updateAdvertisement.set(true);
		inst.advertisementId.set(this._id);
		$("#adName").val(this.name);
		$("#adStartDate").val(new Date(this.startDate));
		$("#adEndDate").val(new Date(this.endDate));
		$("#adPublish").attr('checked', this.publish);
		$("#adImageText").val(this.imageUrl);
		$("#my_image").attr("src",this.imageUrl);
        $("#newAdFormModal").modal('open');
	},

	'click #deleteAdvertisenment'(event) {
		swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this advertisement!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
        }, (willDelete) => {
        	if(willDelete) {
        		Session.set("showLoadingSpinner", true);
        		let advertisenmentId = this._id;
        		// console.log('advertisenmentId', this.imageUrl)
        		const bucket = "envent.ly"
        		let perfectUrl = this.imageUrl.replace('https://s3-ap-southeast-2.amazonaws.com/'+bucket, '');
        		// console.log('perfectUrl', perfectUrl)
        		S3.delete(perfectUrl, function(err, result) {
        			if (err) {
        				Session.set("showLoadingSpinner", false);
        			} else {
        				Meteor.call('Advertisement.delete', advertisenmentId, getSubdomain(getCookie("selectedSDForSA")), (error, result) => {
			        if (error) {
			            Session.set('showLoading',false);
			            error = error.error ? error.error : error;
			            showAlert("danger", "Can not delete advertisement");
			        }else{
			            Session.set('showLoading',false);
			            showAlert("success", "Advertisement deleted successfully");
			        }
			        $('#newAdFormModal').modal('close');
			    });
        			}
        		});
				
        	}
        });	
	},
});

function validateFile(id){
    let file = $(`#${id}`)[0].files;
    let regex = /[^.]+$/;
    let allowedExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'svg'];
    let isValidFile = false;
   /* console.log("check name ",file[0].name)
    console.log("test ",allowedExtension.indexOf(regex.exec(file[0].name)[0]))*/
    if (allowedExtension.indexOf(regex.exec(file[0].name)[0]) > -1) {
        isValidFile = true;
    }
    
    return isValidFile;
  }



function showAlert(type, message){
    Bert.alert({
        title: 'Hey there!',
        message: message,
        type: type,
        style: 'growl-top-right',
        icon: 'fa-check',
    });
}

function uploadFile(id){
    const q  = require('q');
    let d = q.defer();
    let file = $(`#${id}`)[0].files;
    if(file){
    	// console.log("file name", file)
        S3.upload({
                files:file,
                path:"subfolder"
            },function(e,r){
                if(e){
                    d.reject(e);
                }else{
                    d.resolve(r.secure_url);
                }
        });
    }else{
        d.resolve(instanceValue);
    }
    return d.promise;
}

function showPreview(id, reactVar){
    let inst = Template.instance();
    let tmpImgPath = URL.createObjectURL($(id)[0].files[0]);
    let fileName = $(id).val();
    let isValid = validateFile(fileName);
    if(!isValid){
        Bert.alert({
            title: 'Ups...',
            message: 'Only image files are allowed.',
            type: 'info',
            style: 'growl-top-right',
            icon: 'fa-info',
        });
    }else{
        inst[reactVar].set(tmpImgPath);
    }
  }