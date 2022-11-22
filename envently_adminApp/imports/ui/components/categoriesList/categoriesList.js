import { Categories } from '/imports/api/categories/categories.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';
import { getCookie } from '/imports/startup/both/global_function.js';
import './categoriesList.html';

Template.categoriesList.onCreated(function categoriesListCreated() {
    const { ReactiveVar }  =  require('meteor/reactive-var');
    require('/imports/ui/stylesheets/mappane.css');
    this.categories = new ReactiveVar(false);
    this.searchQuery = new ReactiveVar();
    this.searching = new ReactiveVar(false);
    this.selectedCords = new ReactiveVar(null);
    this.locationImage1 = new ReactiveVar(null);
    this.locationImage2 = new ReactiveVar(null);
    this.image1 = new ReactiveVar(null);
    this.image2 = new ReactiveVar(null);
    this.client = new ReactiveVar(Session.get('currentClient'));

    this.autorun(() => {
        //console.log("this.defaultCords::: ",this.defaultCords.get(), "Zoom:: ", this.defaultZoomLevel.get())
        this.subscribe('event_dev.all',getCookie("selectedSDForSA"));
        this.subscribe('adminCategoriesSearch', this.searchQuery.get(), () => {
            setTimeout(() => {
                this.searching.set(false);
            }, 300);
        });
    });
});

Template.categoriesList.onRendered(function categoriesListOnRendered() {
    let map = false;
    mapboxgl.accessToken = Meteor.settings.public.mapboxglKey;

    this.setMarker = ((map, latitude, longitude) => {
        // const mapboxgl = require('mapbox-gl');
        const startTime = Date.now();
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
        const endTime = Date.now() - startTime;
        // console.log("Time taken in setMarker categoriesList..", endTime, "ms");
    });

    this.loadMap = ((container) => {
        // const mapboxgl = require('mapbox-gl');
        const startTime = Date.now();

        let mapProps = {
            container: container,
            style: 'mapbox://styles/envent/cj43jugsa8j9t2rmzv3q4tsbs',
            center: Session.get('defaultCords'),
            zoom: Session.get('defaultZoomLevel')
        }

        map = new mapboxgl.Map(mapProps);

        if (map) {
            map.on('click', (e) => {
                // if marker is already there, remove marker first
                if (!!this.selectedCords.get())
                    this.selectedCords.get().marker.remove(map);
                this.setMarker(map, e.lngLat.lat, e.lngLat.lng);
            });
        }
        const endTime = Date.now() - startTime;
        // console.log("Time taken in loadMap categoriesList..", endTime, "ms");
    });

    this.loadMapWithMarker = ((container, latLng, canEdit) => {
        // const mapboxgl = require('mapbox-gl');
        const startTime = Date.now();
        map = new mapboxgl.Map({
            container: container,
            style: 'mapbox://styles/envent/cj43jugsa8j9t2rmzv3q4tsbs',
            center: [latLng.longitude, latLng.latitude],
            zoom: Session.get('defaultZoomLevel')
        });
        this.setMarker(map, latLng.latitude, latLng.longitude);

        map.on('click', (e) => {
            if (!!this.selectedCords.get() && canEdit)
                this.selectedCords.get().marker.remove(map);
            if (canEdit)
                this.setMarker(map, e.lngLat.lat, e.lngLat.lng);
        });
        const endTime = Date.now() - startTime;
        // console.log("Time taken in loadMapWithMarker categoriesList..", endTime, "ms");
    });

    Meteor.setTimeout(() => {
        // Materialize components init

        $('ul.tabs').tabs();
        $('.modal').modal();
        Materialize.updateTextFields();
        $('.button-collapse').sideNav();
        $('select').material_select();
        $('.collapsible').collapsible();
        $('.datepicker').pickadate({
            selectMonths: true,
            selectYears: 2,
             min: [Date()],
           
            container: '#outerContainer',
            onSet(arg) {
                if ('select' in arg) { // prevent closing on selecting month/year
                    this.close();
                }
            },
        });

        $('.datepicker').on('mousedown', function (event) {
            event.preventDefault();
        });

        $('#eventsList').modal({
            ready: (modal, trigger) => { // Callback for Modal open. Modal and trigger parameters available.
                this.loadMap("eventMapPane");
            },
            complete: () => {
                this.selectedCords.set(false);
                resetModal()
            } // Callback for Modal close
        });

        $('#locationsList').modal({
            ready: (modal, trigger) => { // Callback for Modal open. Modal and trigger parameters available.
                this.loadMap('locationMapPane');
            },
            complete: () => {
                this.selectedCords.set(false);
                resetModal()
            } // Callback for Modal close
        });
    }, 500);
});

Template.categoriesList.helpers({
    latitude(){
        let inst = Template.instance()
        return inst.selectedCords.get()?inst.selectedCords.get().latitude:''
    },
    longitude(){
        let inst = Template.instance()
        return inst.selectedCords.get()?inst.selectedCords.get().longitude:''
    },
    searching() {
        return Template.instance().searching.get();
    },

    query() {
        return Template.instance().searchQuery.get();
    },

    categories() {
      if(getSubdomain() && dynamicCollections[getSubdomain() + '_categories']) {
        return dynamicCollections[getSubdomain()+'_categories'].find().fetch();
      }
      else {
        return Categories.find().fetch();
      }
    },

    count() {
        let categoriesCount;
        if(getSubdomain() && dynamicCollections[getSubdomain()+'_categories']) {
            categoriesCount = dynamicCollections[getSubdomain()+'_categories'].find().count();
        } else {
          categoriesCount = Categories.find().count();
        }
        if (categoriesCount < 100) {
            return `${categoriesCount} matching results`;
        }
        return `+${categoriesCount} results, search to filter.`;
    },

    isAutoFilled() {
        return "readonly"
    }
});

Template.categoriesList.events({

    'keyup [name="search"]': (event) => {
        const value = event.target.value.trim();
        if (value !== '') {
            Template.instance().searchQuery.set(value);
            Template.instance().searching.set(true);
        } else if (value === '') {
            Template.instance().searchQuery.set(value);
        }
    },

    'click #searchEventOnLocal': (event, inst) => {
        if (!$('#eventName')[0].value) {
            showAlert('danger', 'Please insert event name first');
        }
        Session.set('showLoading',true);
        Meteor.call('events.search', $('#eventName')[0].value, Meteor.userId(), (error, result) => {
            Session.set('showLoading',false);
            if (error) {
                showAlert('danger', 'Event not found. Please create new one');
            } else {
                if (!result || !result.length) {
                    showAlert('danger', 'Event not found. Please create new one');
                } else {
                    autoPopulateEventFields(result[0]);
                    if (result[0] && result[0].location && result[0].location.lat && result[0].location.lng) {
                        inst.selectedCords.set({
                            latitude: result[0].location.lat,
                            longitude: result[0].location.lng
                        });
                        inst.loadMapWithMarker('eventMapPane', inst.selectedCords.get(), false);
                    } else {
                        inst.loadMap('eventMapPane');
                    }
                }
            }
        })
    },

    'click .close': () => {
        $('#search').val('');
        Template.instance().searchQuery.set('');
    },

    'submit #newEvent': (event, inst) => {
        event.preventDefault();
        Session.set('showLoading',true);
        if (!inst.selectedCords.get()) {
            Session.set('showLoading',false);
            showAlert('danger', 'Please choose latitude and longitude');
            return
        }
        try {
            const newEventObject = {
                name: $('#eventName').val(),
                address: $('#eventAddress').val(),
                phone: $('#eventPhone').val(),
                from: $('#eventFrom').pickadate({min: true}).pickadate('picker').get('select').obj,
                to: $('#eventTo').pickadate().pickadate('picker').get('select').obj,
                header: $('#eventHeader').val(),
                details1: $('#details1').val(),
                details2: $('#details2').val(),
                website: $('#eventWebsite').val(),
                latitude: inst.selectedCords.get().latitude,
                longitude: inst.selectedCords.get().longitude
            };
            // console.log(newEventObject, "new Event Object")
            uploadFile('eventimage1', 'image1', inst).then(function(imgPath){
                if(imgPath){
                    newEventObject['image1'] = imgPath;
                }
                return uploadFile('eventimage2', 'image2', inst);
            }).then(function(imgPath){
                if(imgPath){
                    newEventObject['image2'] = imgPath;
                }
                Meteor.call('EventDev.insert', newEventObject, $('#eventId').val(), getCookie("selectedSDForSA"), (error, result) => {
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
                        $('#eventsList').modal('close');
                        const event = {
                            eventId: result,
                            _id: Session.get('menuItemSelected'),
                            menuKey: FlowRouter.getParam('menuItem'),
                        }
                        Meteor.call('menuItemDev.addEvent', event, getCookie("selectedSDForSA"), (error, result) => {
                            if (error) {
                                Session.set('showLoading',false);
                                inst.selectedCords.set(false);
                                throw Meteor.Error(Number, error);
                            } else {
                                inst.selectedCords.set(false);
                                if(result=="already Exists"){
                                    Bert.alert({
                                        title: 'Hey there!',
                                        message: 'This event already exists for this Sub menu',
                                        type: 'danger',
                                        style: 'growl-top-right',
                                        icon: 'fa-check',
                                    });
                                }else{
                                    Bert.alert({
                                        title: 'Hey there!',
                                        message: 'You just added the a new event to the menu item',
                                        type: 'success',
                                        style: 'growl-top-right',
                                        icon: 'fa-check',
                                    });
                                }
                                Session.set('showLoading',false);
                            }
                        });
                    }
                });
            }).fail(function(error){
                Session.set('showLoading',false);
                // console.log("error >>>>>>", error)
            })
        } catch (e) {
            if (e instanceof TypeError) {
                Session.set('showLoading',false);
                Bert.alert({
                    title: 'Unable to submit Event',
                    message: 'Make sure you select To and From dates',
                    type: 'danger',
                    style: 'growl-top-right',
                    icon: 'fa-remove',
                });
            }
        }
    },

    'click #searchInSensis': (event, inst) => {
        event.preventDefault();
        Session.set('showLoading',true);
        var locationName = $("#LocationName").val();
        if (!locationName) {
            Session.set('showLoading',false);
            resetFields();
            showAlert('danger', 'Please insert location name first.');
            return;
        }
        Meteor.call('CacheDev.getLocationInfo', {query:locationName/*, location:locationName*/}, (error, result) => {
            if (error) {
                Session.set('showLoading',false);
                error = error.error ? error.error : error;
                Bert.alert({
                    title: 'Ups...',
                    message: error,
                    type: 'info',
                    style: 'growl-top-right',
                    icon: 'fa-info',
                });
                resetFields();
                return;
            } else {
                // console.log(":: Sensis Search Result For - ",locationName,",, - ",result);
                var address = result.primaryAddress && result.primaryAddress.addressLine ? result.primaryAddress.addressLine : ''
                var phone = getTrimmedPhone(result);
                var categories = result.categories && result.categories.length > 0 ? result.categories : [];
                var categoriesIds = [];
                let latitude = result.primaryAddress && result.primaryAddress.latitude ? result.primaryAddress.latitude : '';
                let longitude = result.primaryAddress && result.primaryAddress.longitude ? result.primaryAddress.longitude : '';

                let imageGallery = result.imageGallery && result.imageGallery.length > 0 ? result.imageGallery : [];
                let website = result.detailsLink

                if(result && result.primaryContacts && result.primaryContacts.length){
                    // console.log(":: result - ",result);
                    // console.log(":: result.primaryContacts - ",result.primaryContacts);
                    // console.log(":: result.primaryContacts.length - ",result.primaryContacts.length);
                    let contactUrl = _.where(result.primaryContacts, {type: "URL"})
                    if(contactUrl && contactUrl.length){
                        website = contactUrl[0].value
                    }
                }

                if (latitude && longitude) {
                    inst.selectedCords.set({
                        latitude: latitude,
                        longitude: longitude
                    });
                    inst.loadMapWithMarker("locationMapPane", inst.selectedCords.get(), false);
                }
                for (var i = 0; i < categories.length; i++) {
                    categoriesIds.push(categories[i].name)
                }

                for (var i = 0; i < imageGallery.length && i < 2; i++) {
                    if (i == 0) {
                        autoPopulate('#locationImageText1', imageGallery[i].largeUrl);
                        disabled('#locationImage1')
                    }
                    if (i == 1) {
                        autoPopulate('#locationImageText2', imageGallery[i].largeUrl);
                        disabled('#locationImage2')
                    }
                }
                autoPopulate('#LocationName', result.name);
                autoPopulate('#sensisId', result.id);
                autoPopulate('#locationAddress', address);
                autoPopulate('#locationPhone', phone);
                autoPopulate('#locationWebsite', website);
                autoPopulate('#categories', categoriesIds);
                autoPopulate('#text1', result.shortDescriptor);
                Session.set('showLoading',false);
            }
        });
    },

    'click #searchInCustom': (event, inst) => {
        event.preventDefault();
        Session.set('showLoading',true);
        var locationName = $("#LocationName").val();
        if (!locationName) {
            Session.set('showLoading',false);
            resetFields();
            showAlert('danger', 'Please insert location name first.');
            return;
        }
        Meteor.call('custom_location.findLocationDev', locationName, (error, result) => {
            if (error) {
                Session.set('showLoading',false);
                // console.log("error", error);
            } else {
                if(!result || !result.location_ref_id){
                    Session.set('showLoading',false);
                    Bert.alert({
                        title: 'Hey there!',
                        message: 'This location does not exists',
                        type: 'danger',
                        style: 'growl-top-right',
                        icon: 'fa-check',
                    });
                    return;
                }
                var location_dev_id = result._id;
                autoPopulate('#locationDevId', location_dev_id);
                autoPopulate('#locationAddress', result.address);
                autoPopulate('#locationPhone', result.phone);
                autoPopulate('#locationWebsite', result.website);
                autoPopulate('#categories', result.categories);

                if (result.latitude && result.longitude) {
                    inst.selectedCords.set({
                        latitude: result.latitude,
                        longitude: result.longitude
                    });
                    inst.loadMapWithMarker("locationMapPane", inst.selectedCords.get(), false);
                }

                let location_ref = result && result.location_ref ? result.location_ref : undefined;
                let location_ref_id = result && result.location_ref_id ? result.location_ref_id : undefined;
                var collectionName = location_ref=='custom_location' ? 'custom_location' : 'location_data';
                Meteor.call('custom_location.findLocationCustom', location_ref_id, collectionName, (error, result) => {
                    if (error) {
                        Session.set('showLoading',false);
                        console.log("error", error);
                    } else {
                        if(!result){
                            Session.set('showLoading',false);
                            return;
                        }
                        autoPopulate('#locationRefId', location_ref_id);
                        autoPopulate('#text1', result.text1);
                        autoPopulate('#text2', result.text2);
                        autoPopulate('#locationImageText1', result.image1);
                        autoPopulate('#locationImageText2', result.image2);
                        Session.set('showLoading',false);
                    }
                })
            }
        });
    },

    'submit #newLocation': (event, inst) => {
        event.preventDefault();
        console.log("Submit clicked-----")
        Session.set('showLoading',true);
        if (!inst.selectedCords.get()) {
            Session.set('showLoading',false);
            showAlert('danger', 'Please choose latitude and longitude');
            return
        }
        try {
            const newLocationObject = {
                text1: $('#text1').val(),
                text2: $('#text2').val()
            };
            uploadFile('locationImage1', 'locationImage1', inst).then(function(imgPath){
                if(imgPath){
                    newLocationObject['image1'] = imgPath;
                }
                return uploadFile('locationImage2', 'locationImage2', inst);
            }).then(function(imgPath){
                if(imgPath){
                    newLocationObject['image2'] = imgPath;
                }
                if($('#sensisId').val()){
                    if($('#locationImageText1').val()){
                        newLocationObject['image1'] = $('#locationImageText1').val();
                    }
                    if($('#locationImageText2').val()){
                        newLocationObject['image2'] = $('#locationImageText2').val();
                    }
                }
                Meteor.call('LocationData.insert', newLocationObject, $('#sensisId').val(), $('#locationRefId').val(),getCookie("selectedSDForSA"), (error, result) => {
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
                        $('#locationsList').modal('close');
                        const location_ref_id = result.id;
                        const locationDevObject = {
                            location_ref:result.ref,
                            location_ref_id: location_ref_id,
                            name: $('#LocationName').val(),
                            address: $('#locationAddress').val(),
                            phone: $('#locationPhone').val(),
                            website: $('#locationWebsite').val(),
                            categories: $('#categories').val(),
                            email: $('#locationEmail').val(),
                            latitude: inst.selectedCords.get().latitude,
                            longitude: inst.selectedCords.get().longitude
                        };
                        console.log(locationDevObject, ":::::::::locationDevObject")
                        Meteor.call('LocationDev.insert', locationDevObject, $('#locationDevId').val(),getCookie("selectedSDForSA"), (error, result) => {
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
                                const locationInfo = {
                                    location_data_id: location_ref_id,
                                    location_dev_id: result,
                                    _id: Session.get('menuItemSelected'),
                                    menuKey: FlowRouter.getParam('menuItem'),
                                }
                                console.log(locationInfo, "location info")
                                Meteor.call('menuItemDev.addLocation', locationInfo, getCookie("selectedSDForSA"), (error, result) => {
                                    if (error) {
                                        Session.set('showLoading',false);
                                        throw Meteor.Error(Number, error);
                                    } else {
                                        if(result=="already Exists"){
                                            Session.set('showLoading',false);
                                            Bert.alert({
                                                title: 'Hey there!',
                                                message: 'This location already exists for this Sub menu',
                                                type: 'danger',
                                                style: 'growl-top-right',
                                                icon: 'fa-check',
                                            });
                                        }else{
                                            Session.set('showLoading',false);
                                            Bert.alert({
                                                title: 'Hey there!',
                                                message: 'You just added a new location to the menu item',
                                                type: 'success',
                                                style: 'growl-top-right',
                                                icon: 'fa-check',
                                            });
                                        }
                                    }
                                });
                            }
                        })
                    }
                })
            }).fail(function(error){
                Session.set('showLoading',false);
                console.log("error>>>>>>>", error);
            })
        } catch (e) {
            if (e instanceof TypeError) {
                Session.set('showLoading',false);
                Bert.alert({
                    title: 'Unable to add Location',
                    message: 'Error while adding New Location',
                    type: 'danger',
                    style: 'growl-top-right',
                    icon: 'fa-remove',
                });
            }
        }
    },

    'click .category': (event) => {
        $('#categoriesList').modal('close');

        // Build object to insert
        const clientObject = {
            _id: Session.get('menuItemSelected'),
            menuKey: FlowRouter.getParam('menuItem'),
            name: $(event.target).html(),
            client: FlowRouter.getParam('client'),
            sensisId: $(event.target).attr('id'),
        };

        Meteor.call('menuItemDev.addCategory', clientObject, (error) => {
            if (error) {
                Bert.alert({
                    title: 'Ups...',
                    message: `${clientObject.name} is Already Selected, try another category.`,
                    type: 'info',
                    style: 'growl-top-right',
                    icon: 'fa-info'
                });
            } else {
                Bert.alert({
                    title: 'Hey there!',
                    message: `You just added the ${clientObject.name} category to the menu item`,
                    type: 'success',
                    style: 'growl-top-right',
                    icon: 'fa-check'
                });
            }
        });
    },

    "change #locationImage1": () => {
        showPreview('#locationImage1', 'locationImage1');
    },

    "change #locationImage2": () => {
        showPreview('#locationImage2', 'locationImage2');
    },

    "change #eventimage1": () => {
        showPreview('#eventimage1', 'image1');
    },

    "change #eventimage2": () => {
        showPreview('#eventimage2', 'image2');
    },

    "change #eventLatitude": (event, inst)=>{
      // console.log(":: event 1. latitude - > ",event.currentTarget.value$('#eventLatitude').val(),", longitude - > ",$('#eventLongitude').val());
      // refreshMap(inst,$('#eventLatitude').val(),$('#eventLongitude').val(),'eventMapPane')
    },
    "change #eventLongitude": (event, inst)=>{
      // console.log(":: event 2. latitude - > ",event.currentTarget.value$('#eventLatitude').val(),", longitude - > ",$('#eventLongitude').val());
      // refreshMap(inst,$('#eventLatitude').val(),$('#eventLongitude').val(),'eventMapPane')
    },
    "change #locationLatitude": (event, inst)=>{
      // console.log(":: location 1. latitude - > ",event.currentTarget.value$('#locationLatitude').val(),", longitude - > ",$('#locationLongitude').val());
      refreshMap(inst,$('#locationLatitude').val(),$('#locationLongitude').val(),'locationMapPane')
    },
    "change #locationLongitude": (event, inst)=>{
      // console.log(":: location 2. latitude - > ",/*event.currentTarget.value*/$('#locationLatitude').val(),", longitude - > ",$('#locationLongitude').val());
      refreshMap(inst,$('#locationLatitude').val(),$('#locationLongitude').val(),'locationMapPane')
    },
});

function refreshMap(inst, latitude, longitude, container){
    if(latitude && longitude){
        inst.selectedCords.set({
          latitude: latitude,
          longitude: longitude
        })
        inst.loadMapWithMarker(container, {latitude: latitude, longitude: longitude}, true);
    }
}

function uploadFile(id, reactVar, inst){
    const q = require('q');
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
                    // console.log("error while uploading file >>>>>", e)
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
    /*isGoodImage(tmpImgPath).then(function(isGood) {
        if (isGood){*/
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
        /*}
    });*/
}

/*function isGoodImage(imgPath){
    let d = q.defer();
    var image = new Image();
    image.onload = function() {
        // Check if image is bad/invalid
        if (this.width + this.height === 0) {
            this.onerror();
            return;
        }

        // Check the image resolution
        if (this.width >= 100 && this.height >= 100) {
            d.resolve(true);
        } else {
            // alert("The image resolution is too low.");
            showAlert('danger', 'The image resolution is too low.');
            d.resolve(false);
        }
    };

    image.onerror = function() {
        // alert("Invalid image. Please select an image file.");
        showAlert('danger', 'Please select an image file.');
       d.resolve(false);
    }

    image.src = imgPath
    return d.promise;
}*/

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

function resetFields() {
    $('#sensisId').val('');
    $('#locationAddress').empty();
    $('#locationAddress').prop("readonly", false);
    $('#locationPhone').empty();
    $('#locationPhone').prop("readonly", false);
    $('#locationWebsite').empty();
    $('#locationWebsite').prop("readonly", false);
    $('#categories').empty();
    $('#categories').prop("readonly", false);
    $('#text1').empty();
    $('#text1').prop("readonly", false);
}

function autoPopulate(id, value) {
    if (id && value && value.length > 0) {
        $(id).val(value);
        $(id).attr('readonly', (id==='#locationWebsite')?false:true);
        let index = id.indexOf('#');
        let labelFor = index>=0 ? id.substring(index+1) : id;
        $("label[for='"+labelFor+"']").attr({'class':'active'})
    }
}

function disabled(id) {
    if (id) {
        $(id).attr('disabled', true);
    }
}

function resetModal() {
    $(".form-field").val("");
    $(".form-field").attr('readonly', false);
}

function autoPopulateEventFields(event) {
    if (event._id) {
        $("#eventId").val(event._id);
        $("#eventId").attr('readonly', true);
        $("label[for='eventId']").attr({'class':'active'})
    }
    if (event.title) {
        $("#eventName").val(event.title);
        $("#eventName").attr('readonly', true);
        $("label[for='eventName']").attr({'class':'active'})
    }
    if (event.address) {
        $("#eventAddress").val(event.address)
        $("#eventAddress").attr('readonly', true);
        $("label[for='eventAddress']").attr({'class':'active'})
    }
    if (event.phone) {
        $("#eventPhone").val(event.phone);
        $("#eventPhone").attr('readonly', true);
        $("label[for='eventPhone']").attr({'class':'active'})
    }
    if (event.link) {
        $("#eventWebsite").val(event.link);
        $("#eventWebsite").attr('readonly', false);
        $("label[for='eventWebsite']").attr({'class':'active'})
    }
    if (event.begin) {
        alert("dddd")
        $('#eventFrom').pickadate({min: new Date()}).pickadate('picker').set('select', new Date(event.begin))
        $("#eventFrom").attr('readonly', true);
        $("label[for='eventFrom']").attr({'class':'active'})
    }
    if (event.end) {
        $('#eventTo').pickadate().pickadate('picker').set('select', new Date(event.end));
        $("#eventTo").attr('readonly', true);
        $("label[for='eventTo']").attr({'class':'active'})
    }
    if (event.header) {
        $("#eventHeader").val(event.header);
        $("#eventHeader").attr('readonly', true);
        $("label[for='eventHeader']").attr({'class':'active'})
    }
    if (event.description) {
        $("#details1").val(event.description);
        $("#details1").attr('readonly', true);
        $("label[for='details1']").attr({'class':'active'})
    }
    if (event.details2) {
        $("#details2").val(event.details2);
        $("#details2").attr('readonly', true);
        $("label[for='details2']").attr({'class':'active'})
    }
    if (event.image && event.image.url) {
        $("#image1path").val(event.image.url);
        $("#image1path").attr('readonly', true);
        $("label[for='image1path']").attr({'class':'active'})
    }
    if (event.image2) {
        $("#image2path").val(event.image2);
        $("#image2path").attr('readonly', true);
        $("label[for='image2path']").attr({'class':'active'})
    }
    if (event.location && event.location.lat) {
        $("#eventLatitude").val(event.location.lat);
        $("#eventLatitude").attr('readonly', true);
        $("label[for='eventLatitude']").attr({'class':'active'})
    }
    if (event.location && event.location.lng) {
        $("#eventLongitude").val(event.location.lng);
        $("#eventLongitude").attr('readonly', true);
        $("label[for='eventLongitude']").attr({'class':'active'})
    }
}

function getTrimmedPhone(result) {
    let primaryContacts = result.primaryContacts;
    let secondaryContacts = result.secondaryContacts;
    if(primaryContacts && primaryContacts.length){
        let phoneNum = _.where(primaryContacts, {type:"PHONE"});
        if(phoneNum && phoneNum.length){
            return phoneNum[0].value.replace(/\D+/g, '');
        }else if(secondaryContacts && secondaryContacts['Toll Free'] && secondaryContacts['Toll Free'].length){
            let phoneNum = _.where(secondaryContacts['Toll Free'], {type:"PHONE"});
            return phoneNum[0].value.replace(/\D+/g, '');
        }else{
            return 0;
        }

    }else{
        return 0
    }
}
