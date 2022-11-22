import './eventForm.html';
import { getCookie } from '/imports/startup/both/global_function.js';

Template.eventForm.onCreated(function() {
    require('/imports/ui/stylesheets/mappane.css');
    this.selectedCords = new ReactiveVar(null);
    this.editImage1 = new ReactiveVar(null);
    this.editImage2 = new ReactiveVar(null);
});

Template.eventForm.onRendered(function() {
    // const mapboxgl = require('mapbox-gl');
    mapboxgl.accessToken = Meteor.settings.public.mapboxglKey;
    let map = false;

    this.setMarker = ((map, latitude, longitude) => {
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
        $('#eventForm').modal({
            ready: (modal, trigger) => {
                if (this.selectedCords.get() && this.selectedCords.get().latitude && this.selectedCords.get().longitude) {
                    this.loadMapWithMarker('eventEditMapPane', this.selectedCords.get());
                } else {
                    this.loadMap('eventEditMapPane');
                }
            },
            complete: () => {
                this.selectedCords.set(false);
            }
        });
    }, 800);
});

Template.eventForm.helpers({
    latitude(){
        let inst = Template.instance()
        return inst.selectedCords.get()?inst.selectedCords.get().latitude:''
    },
    longitude(){
        inst = Template.instance()
        return inst.selectedCords.get()?inst.selectedCords.get().longitude:''
    },
    eventFormData() {
        let locationInfo = Template.instance().data.viewEvent.get();
        if (locationInfo['latitude'] && locationInfo['longitude']) {
            Template.instance().selectedCords.set({
                latitude: locationInfo['latitude'],
                longitude: locationInfo['longitude']
            });
        }
        return locationInfo
    }
});

Template.eventForm.events({
    'submit #eventForm' (event, inst) {
        event.preventDefault();
        Session.set('showLoading',true);
        if (!inst.selectedCords.get()) {
            Session.set('showLoading',false);
            showAlert('danger', 'Please choose latitude and longitude');
            return
        }

        const eventId = Template.instance().data.eventId.get()
        const newEventObject = {
            name: $('#editName').val(),
            address: $('#editAddress').val(),
            phone: $('#editPhone').val(),
            from: $('#editFrom').pickadate().pickadate('picker').get('select').obj,
            to: $('#editTo').pickadate().pickadate('picker').get('select').obj,
            header: $('#editHeader').val(),
            details1: $('#editDetail1').val(),
            details2: $('#editDetail2').val(),
            website: $('#editWebsite').val()
        }
        uploadFile('editImage1', 'editImage1', inst).then(function(imgPath){
          if(imgPath){
              newEventObject['image1'] = imgPath;
          }
          return uploadFile('editImage2', 'editImage2', inst);
        }).then(function(imgPath){
          if(imgPath){
              newEventObject['image2'] = imgPath;
          }
          if (inst.selectedCords.get() && inst.selectedCords.get().latitude && inst.selectedCords.get().longitude) {
                newEventObject.latitude = inst.selectedCords.get().latitude
                newEventObject.longitude = inst.selectedCords.get().longitude
          }
          Meteor.call('EventDev.update', eventId, newEventObject,getCookie("selectedSDForSA"), (error, result) => {
            if (error) {
                Session.set('showLoading',false);
                // console.log('error', error);
                showAlert('danger', 'Can not update this event.');
                return;
            }
            if (result) {
                Session.set('showLoading',false);
                $('#eventForm').modal('close');
                inst.selectedCords.set(false);
                showAlert('success', 'Event updated successfully.');
            }
          });
        }).fail(function(){
            Session.set('showLoading',false);
            // console.log("error>>>>>>>>>", error)
        })
    },

    "change #editImage1": () => {
        showPreview('#editImage1', 'editImage1');
    },

    "change #editImage2": () => {
        showPreview('#editImage2', 'editImage2');
    },

    "change #latitude": (event, inst)=>{
      // console.log(":: 1. latitude - > ",/*event.currentTarget.value*/$('#latitude').val(),", longitude - > ",$('#longitude').val());
      if($('#longitude').val()&&$('#latitude').val()){
        inst.selectedCords.set({
          latitude: $('#latitude').val(),
          longitude: $('#longitude').val()
        })
        inst.loadMapWithMarker('eventEditMapPane', {latitude: $('#latitude').val(), longitude: $('#longitude').val()});
      }
    },

    "change #longitude": (event, inst)=>{
      // console.log(":: 2. latitude - > ",/*event.currentTarget.value*/$('#latitude').val(),", longitude - > ",$('#longitude').val());
      if($('#longitude').val()&&$('#latitude').val()){
        inst.selectedCords.set({
          latitude: $('#latitude').val(),
          longitude: $('#longitude').val()
        })
        inst.loadMapWithMarker('eventEditMapPane', {latitude: $('#latitude').val(), longitude: $('#longitude').val()});
      }
    }
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

function showAlert(type, message) {
    Bert.alert({
        title: 'Hey there!',
        message: message,
        type: type,
        style: 'growl-top-right',
        icon: 'fa-check',
    });
}
