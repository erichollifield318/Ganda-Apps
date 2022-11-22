import { LocationData } from '/imports/api/location_data/location_data.js';
import { CustomLocation } from '/imports/api/custom_location/custom_location.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain,getCookie } from '/imports/startup/both/global_function.js';
import './locationForm.html';

Template.locationForm.onCreated(function locationFormOnCreated() {

  require('/imports/ui/stylesheets/mappane.css');
  this.locationRefId = new ReactiveVar(false);
  this.selectedCords = new ReactiveVar(false);
  this.editimage1 = new ReactiveVar(null);
  this.editimage2 = new ReactiveVar(null);
  Meteor.subscribe('location_data.all',getCookie("selectedSDForSA"));
  Meteor.subscribe('custom_location.all',getCookie("selectedSDForSA"));
});

Template.locationForm.onRendered(function locationFormOnCreated() {
    let map = false;
    mapboxgl.accessToken = Meteor.settings.public.mapboxglKey;
    this.setMarker = ((map, latitude, longitude) => {
      // const mapboxgl = require('mapbox-gl');
        const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <p class="center-align">Latitude: ${latitude}</p>
              <p class="center-align">Longitude: ${longitude}</p>
            `);

        // create DOM element for the marker
        const el = document.createElement('div');
        el.className = 'currentLocation';
        let marker = new mapboxgl.Marker(el, {
                offset: [-25, -25]
            }).setLngLat([longitude, latitude])
            .setPopup(popup) // sets a popup on this marker
            .addTo(map);
        //create reactive var for this marker and cords.
        this.selectedCords.set({
            latitude: latitude,
            longitude: longitude,
            marker: marker
        });
    });

    this.loadMap = ((container) => {
      // const mapboxgl = require('mapbox-gl');
      map = new mapboxgl.Map({
          container: container,
          style: 'mapbox://styles/envent/cj43jugsa8j9t2rmzv3q4tsbs',
      });
      if (map) {
        map.on('click', (e) => {
          // if marker is already there, remove marker first
          if (!!this.selectedCords.get())
              this.selectedCords.get().marker.remove(map);
          this.setMarker(map, e.lngLat.lat, e.lngLat.lng);
        });
      }
    });

    this.loadMapWithMarker = ((container, latLng) => {
      // const mapboxgl = require('mapbox-gl');
        map = new mapboxgl.Map({
            container: container,
            style: 'mapbox://styles/envent/cj43jugsa8j9t2rmzv3q4tsbs',
            center: [latLng.longitude, latLng.latitude],
            zoom: 8
        });
        this.setMarker(map, latLng.latitude, latLng.longitude);

        map.on('click', (e) => {
            if (!!this.selectedCords.get())
                this.selectedCords.get().marker.remove(map);

            this.setMarker(map, e.lngLat.lat, e.lngLat.lng);
        });
    });

    Meteor.setTimeout(() => {
      $('#locationForm').modal({
        ready: (modal, trigger) => {
          const locationInfo = this.data.viewCustomLocation.get();
          let location_ref = locationInfo && locationInfo.location_ref ? locationInfo.location_ref : undefined;
          if(location_ref && location_ref=="location_data"){
            // Uncomment this if you wants to prevent user from editing the locations obtained from sensis
            /*$('.location-form-field').attr('disabled', true);
            $('#editlocationWebsite').attr('disabled', false);*/
          }
          if(this.selectedCords.get()&&this.selectedCords.get().latitude&&this.selectedCords.get().longitude){
              this.loadMapWithMarker('locationEditMapPane', this.selectedCords.get());
          }else{
              this.loadMap('locationEditMapPane');
          }
        },
        complete: () => {
            this.selectedCords.set(false);
            resetModal()
        }
      });
    }, 500);
});

Template.locationForm.helpers({
  latitude(){
      let inst = Template.instance()
      return inst.selectedCords.get()?inst.selectedCords.get().latitude:''
  },
  longitude(){
      let inst = Template.instance()
      return inst.selectedCords.get()?inst.selectedCords.get().longitude:''
  },
  locationFormData() {
    let inst = Template.instance()
    const locationInfo = Template.instance().data.viewCustomLocation.get();
    let location_ref = locationInfo && locationInfo.location_ref ? locationInfo.location_ref : undefined;
    Template.instance().locationRefId.set(locationInfo.location_ref_id);
    let locationData = undefined;
    if(location_ref=='custom_location'){
      if(getSubdomain(getCookie("selectedSDForSA")))
      {
        locationData = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_custom_location'].findOne({'_id':locationInfo.location_ref_id});
      }
      else {
        locationData = CustomLocation.findOne({'_id':locationInfo.location_ref_id});
      }
    }else if(location_ref=='location_data'){
      locationData = LocationData.findOne({'_id':locationInfo.location_ref_id});
      if(getSubdomain(getCookie("selectedSDForSA")))
      {
        locationData = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_location_data'].findOne({'_id':locationInfo.location_ref_id});
      }
      else {
        locationData = LocationData.findOne({'_id':locationInfo.location_ref_id});
      }
    }
    if(locationData){
      locationInfo['text1'] = locationData.text1 ;
      locationInfo['text2'] = locationData.text2;
      locationInfo['editimagetext1'] = locationData.image1;
      locationInfo['editimagetext2'] = locationData.image2;
    }
    if(locationInfo['latitude'] && locationInfo['longitude']){
      inst.selectedCords.set({
        latitude: locationInfo['latitude'],
        longitude: locationInfo['longitude']
      })
    }
    return locationInfo;
  }
});

Template.locationForm.events({
	'submit #locationForm' (event, inst) {
		event.preventDefault();
    Session.set('showLoading',true);
	  let customLocationId = Template.instance().data.customLocationId.get()
    let locationRefId = Template.instance().locationRefId.get()

    let locationInfo = Template.instance().data.viewCustomLocation.get();
    let location_ref = locationInfo && locationInfo.location_ref ? locationInfo.location_ref : undefined;
    const newLocationObject = {
      text1: $('#edittext1').val(),
      text2: $('#edittext2').val()
    };
    uploadFile('editimage1', 'editimage1', inst).then(function(imgPath){
        if(imgPath){
            newLocationObject['image1'] = imgPath;
        } else if ($('#editimagetext1').val()==='') {
            newLocationObject['image1'] = '';
        }
        return uploadFile('editimage2', 'editimage2', inst);
    }).then(function(imgPath){
        if(imgPath){
            newLocationObject['image2'] = imgPath;
        } else if ($('#editimagetext2').val()==='') {
            newLocationObject['image2'] = '';
        }
        Meteor.call('LocationData.update', locationRefId, newLocationObject, location_ref,getCookie("selectedSDForSA"), (error, result) => {
          if (error) {
            Session.set('showLoading',false);
            Bert.alert({
              title: 'Ups...',
              message: error.message,
              type: 'info',
              style: 'growl-top-right',
              icon: 'fa-info',
            });
          } else {
            let locationDevObject = {
              name: $('#editLocationName').val(),
              address: $('#editlocationAddress').val(),
              phone: $('#editlocationPhone').val(),
              website: $('#editlocationWebsite').val(),
              categories: $('#editcategories').val(),
              suburb: $('#editlocationSuburb').val(),
              state: $('#editlocationState').val(),
              postCode: $('#editlocationPostCode').val()


            };
            console.log("DATAAAAAA++++++++++++++++" ,locationDevObject)
            if(inst.selectedCords.get() && inst.selectedCords.get().latitude && inst.selectedCords.get().longitude){
              locationDevObject.latitude = inst.selectedCords.get().latitude
              locationDevObject.longitude = inst.selectedCords.get().longitude
            }

            console.log(":: customLocationId - ",customLocationId);
            console.log(":: locationDevObject - ",locationDevObject);
            Meteor.call('LocationDev.update', customLocationId, locationDevObject,getCookie("selectedSDForSA"), (error, result) => {
              if (error) {
                Session.set('showLoading',false);
                Bert.alert({
                  title: 'Ups...',
                  message: error.message,
                  type: 'info',
                  style: 'growl-top-right',
                  icon: 'fa-info',
                });
              } else {
                if (result) {
                  Session.set('showLoading',false);
                 $('#locationForm').modal('close');
                 showAlert('success', 'Location updated successfully.');
                }
              }
            });
          }
        });
    }).fail(function(error){
      Session.set('showLoading',false);
      console.log("error>>>>>>>>", error)
    });
	},

  'click .removeImage': (event, inst) => {
    console.log(":: event.currentTarget - ",event.currentTarget.dataset.imagefileid,event.currentTarget.dataset.imagetextid);
    $(`#${event.currentTarget.dataset.imagefileid}`).val('');
    $(`#${event.currentTarget.dataset.imagetextid}`).val('');

  },

  "change #latitude": (event, inst)=>{
    console.log(":: 1. latitude - > ",/*event.currentTarget.value*/$('#latitude').val(),", longitude - > ",$('#longitude').val());
    if($('#longitude').val()&&$('#latitude').val()){
      inst.selectedCords.set({
        latitude: $('#latitude').val(),
        longitude: $('#longitude').val()
      })
      inst.loadMapWithMarker('locationEditMapPane', {latitude: $('#latitude').val(), longitude: $('#longitude').val()});
    }
  },

  "change #longitude": (event, inst)=>{
    console.log(":: 2. latitude - > ",/*event.currentTarget.value*/$('#latitude').val(),", longitude - > ",$('#longitude').val());
    if($('#longitude').val()&&$('#latitude').val()){
      inst.selectedCords.set({
        latitude: $('#latitude').val(),
        longitude: $('#longitude').val()
      })
      inst.loadMapWithMarker('locationEditMapPane', {latitude: $('#latitude').val(), longitude: $('#longitude').val()});
    }
  },

  "change #editimage1": () => {
    showPreview('#editimage1', 'editimage1');
  },

  "change #editimage2": () => {
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

function resetModal() {
  $('.location-form-field').attr('disabled', false);
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
