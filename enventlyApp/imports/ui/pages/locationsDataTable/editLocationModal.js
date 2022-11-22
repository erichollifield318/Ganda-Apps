import './editLocationModal.html';
import '/imports/ui/components/mapbox/editableMapbox.js';
import { getSubdomain,getCookie } from '/imports/startup/both/global_function.js';

Template.editLocationModal.onCreated(function() {
  this.editLocationMarker = new ReactiveVar(false);
  this.editimage1 = new ReactiveVar(null);
  this.editimage2 = new ReactiveVar(null);
  this.marker = new ReactiveVar(this.data.selectedLocation);
});

Template.editLocationModal.onRendered(function() {
	/*Session.set('currentClient', (Meteor.user()&&Meteor.user().roles&&Meteor.user().roles.length)?Meteor.user().roles[0]:false);*/

  if (Meteor.user() && Meteor.user().roles) {
    const key = _.values(Meteor.user().roles);
    const value = key[0][0];
    if (value) {
      Session.set('currentClient',value)
    } else {
      Session.set('currentClient',false)
    }
  } else {
    Session.set('currentClient',false)
  }
});

Template.editLocationModal.helpers({
	getPhone() {
    if (this.primaryContacts && this.primaryContacts.length) {
      let phoneNum = _.where(this.primaryContacts, { type: "PHONE" });

      if (phoneNum && phoneNum.length) {
        return phoneNum[0].value.replace(/\D+/g, '');

      } else if (this && this.secondaryContacts && this.secondaryContacts['Toll Free'] && this.secondaryContacts['Toll Free'].length) {
        let phoneNum = _.where(this.secondaryContacts['Toll Free'], { type: "PHONE" });
        return phoneNum[0].value.replace(/\D+/g, '');

      } else {
        return ;
      }
    }

    if(this.phone){
    	return this.phone
    }
  },

  getAddress() {
    if (this.address){
    	return this.address;
    }

    if (this && this.primaryAddress) {
      let addLine1 = this.primaryAddress.addressLine;
      let state = this.primaryAddress.state;
      return `${addLine1?addLine1+', ':''}${state?state:''}`;
    }
  },

  getCategory() {
    if (this.categories && !Array.isArray(this.categories)){
    	return this.categories.name || this.categories;
    }

    if (this && this.categories && Array.isArray(this.categories)) {
      let temp = _.pluck(this.categories, 'name').join();
      return temp;
    }
  },

  getWebsite() {
    if (this.website){
      return this.website;
    }

    if (this && this.primaryContacts && this.primaryContacts.length) {
      let contactUrl = _.where(this.primaryContacts, { type: "URL" });
      return (contactUrl && contactUrl.length) ? contactUrl[0].value : '';
    }

    return '';
  },

  getDesc1() {
  	if(this.text1) return this.text1;
  	else if (this.shortDescriptor) return this.shortDescriptor?this.shortDescriptor:'';
  },

  getDesc2() {
  	if(this.text2) return this.text2;
  	else if (this.mediumDescriptor) return this.shortDescriptor?this.mediumDescriptor:'';
  },

 	getImage1() {
 		if(this.image1) return this.image1;
  	else if (this.imageGallery && this.imageGallery.length) return this.imageGallery[0]?this.imageGallery[0].thumbnailUrl:'';
 	},

	getImage2() {
 		if(this.image2) return this.image2;
  	else if (this.imageGallery && this.imageGallery.length) return this.imageGallery[0]?this.imageGallery[0].largeUrl:'';
 	},

 	editLocationMarker() {
		let instance = Template.instance();
  	return instance.editLocationMarker.get() ? instance.editLocationMarker.get() : false;
 	},

 	currentLocation() {
    let inst = Template.instance();
    return inst.marker;
 	},

});

Template.editLocationModal.events({
	'click #edit-location-marker' (events, instance) {
		console.log(":: Clicked edit-location-marker - ",this);
		instance.editLocationMarker.set(true);
		Meteor.setTimeout(()=>{
			// for editing markers
      $('#editableMapboxModal').modal({
        ready: (modal, trigger) => {
            // console.log(":: editable location marker modal ready.");
        },
        complete: () => {
            // console.log(":: editable location marker modal destroyed.");
            instance.editLocationMarker.set(false);
        }
      });
      $('#editableMapboxModal').modal('open');
		}, 500);
	},

  'submit #editLocationForm' (event, inst) {
    event.preventDefault();
    Session.set('showLoading',true);
    let location = inst.marker.get();
    location.newFields = {
      text1: event.currentTarget.edittext1.value,
      text2: event.currentTarget.edittext2.value,
      name: event.currentTarget.editLocationName.value,
      address: event.currentTarget.editlocationAddress.value,
      phone: event.currentTarget.editlocationPhone.value,
      website: event.currentTarget.editlocationWebsite.value,
      categories: event.currentTarget.editcategories.value,
    };

    var editImage1 = $('input#editimage1')[0].files;
    var editImage2 = $('input#editimage2')[0].files;
    console.log(":: editImage 1 - > ",editImage1);
    console.log(":: editImage 2 - > ",editImage2);

    if(editImage1.length || editImage2.length){
      console.log(":: UPLOADING FILES - ");
      uploadFile('editimage1', 'editimage1', inst).then(function(imgPath){
        console.log("::: Image Path 1 - ",imgPath);
        if(imgPath){
          location.newFields.image1 = imgPath;
        }
        return uploadFile('editimage2', 'editimage2', inst);
      }).then(function(imgPath){
        if(imgPath){
          console.log("::: Image Path 2 - ",imgPath);
          location.newFields.image2 = imgPath;
        }
        updateBusinessLocation(location);
        Session.set('showLoading',false);
        // console.log(":: location - > ",location);
      }).fail(function(error){
        Session.set('showLoading',false);
        console.log(":: Promise Failed - > ", error);
        updateBusinessLocation(location);
      });
    } else {
      updateBusinessLocation(location);
    }
  },

  'change #editimage1': () => {
    showPreview('#editimage1', 'editimage1');
  },

  'change #editimage2': () => {
    showPreview('#editimage2', 'editimage2');
  },
});

function uploadFile(id, reactVar, inst){
  const q  = require('q');
  let d = q.defer();
  let instanceValue = inst[reactVar].get();
  if(instanceValue && instanceValue.indexOf('blob:http')>=0){
    let selector = "input#"+id
    var files = $(selector)[0].files;
    S3.upload({
      files:files,
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
    let tmpImgPath = URL.createObjectURL($('input'+id)[0].files[0]);
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

function validateFile(fileName){
  let allowedExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp'];
  let fileExtension = fileName.split('.').pop().toLowerCase();
  let isValidFile = false;
  for(let index in allowedExtension) {
    if(fileExtension === allowedExtension[index]) {
      isValidFile = true;
      break;
    }
  }
  return isValidFile;
}

function updateBusinessLocation(location) {
  Meteor.call('updateBusinessLocation', location, Meteor.userId(),getCookie("selectedSDForSA"), (error, result)=>{
    Session.set('showLoading',false);
    if (error) {
      console.log(":: updateBusinessLocation error - > ",error);
      showAlert('danger', 'Can not update this location');
    } else {
      showAlert('success', 'Location updated successfully');
      $('#editLocationModal').modal('close');
    }
  });
}

function showAlert(type, message) {
  Bert.alert({
    title: 'Hey there!',
    message: message,
    type: type,
    style: 'growl-top-right',
    icon: 'fa-check',
  });
}
