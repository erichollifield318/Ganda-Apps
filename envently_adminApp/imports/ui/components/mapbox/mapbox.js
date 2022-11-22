import './mapbox.html';
import './markerDetails.js';
import './editableMapbox.js';
import { MenuItemDev } from '/imports/api/menu_item_dev/menu_item_dev.js';
import { mapboxDirectionStyle } from './mapboxDirection.js';
import { RouteLocations} from '/imports/api/routeLocations/routeLocations.js';
import { getCookie, getSubdomain } from '/imports/startup/both/global_function.js';
//import { getSubdomain } from '/imports/startup/both/global_function.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
//import { getSubdomain } from '/imports/startup/both/global_function.js';
import moment from 'moment';
Template.mapbox.onCreated(function() {
    this.selectedMarker = new ReactiveVar(null);
    this.editableMarker = new ReactiveVar(null);
    this.resized = new ReactiveVar(null);
    this.profile = new ReactiveVar(null);
    this.oldProfile = new ReactiveVar(null);
    this.aks = {
        "name": "Amit"
    };
    this.markerCordinates = [0, 0];
    //this.markerBySearch = false;
    // console.log(":: this inside mapbox - > ",this);
    let subDomain = getSubdomain(getCookie("selectedSDForSA"));
    // console.log(subDomain, "subDomain in map box", Session.get('categsArray'));
    Meteor.call('AdminSettings.fetchBySubdomain', subDomain, (error, result)=>{
        if(error){
          // console.log(":: error in AdminSettings.fetchBySubdomain - ",error);
        }else{
          //console.log(":: subdomain settings - result ",result.geoFence.defaultCords.geometry.coordinates);
          if (result && result.geoFence) {
              let defaultCordinates= result.geoFence.defaultCords.geometry.coordinates;
              // console.log(defaultCordinates, "default")
              let defaultLongitude = defaultCordinates[0];
              let defaultLatitude = defaultCordinates[1];
              Session.set('defaultCordinates', defaultCordinates);
              // console.log(defaultLongitude, "longitude", defaultLatitude)
              map.flyTo({
                    defaultLongitude,
                    defaultLatitude
                });
              //Session.set('siteSettings', result);
            }
        }
    });
    Session.set('showLoadingSpinner', true);
    Session.set('selectedDestination', {
        latLng: [0, 0],
        profile: 'driving-traffic'
    });
    // console.log(":: SITE SETTINGS = ", Session.get('siteSettings'));
    var subdomain = document.location.hostname.split('.');  
    if (Meteor.settings.public.isLocal) //for testing purpose only
        subdomain = ['doublebay'];
    Logger.log({
        action: `${Meteor.settings.public.userAppActions.mapRender}`,subdomain: `${subdomain[0]}`
    });
    // console.log("***** mapbox created *****");
    Meteor.subscribe('routeLocations.currentDomain', subdomain[0]);
    this.stopLoading = (() => Session.set('showLoadingSpinner', false));
    this.matchUserAppIp = (() => {
        Meteor.call('matchUserAppIp', subdomain[0], (err, res) => {
            if (err) {
                // console.log(":: ERR inside matchUserAppIp - ",err);
            } else {
                // console.log(":: Matching User.",res);
                if ((Session.get('isAdminIp') != res)) {
                    Session.set('isAdminIp', res);
                    if (Session.get('currentClient') != 'admin') {
                        BlazeLayout.reset();
                        /*BlazeLayout.render('appBody', {
                            main: 'client',
                        });*/
                    }
                }
            }
        });
    })
    this.matchUserAppIp();
});
Template.mapbox.onRendered(function() {
    let settings = Session.get('siteSettings');
    markers = "";
    const inst = Template.instance();
    // console.log("***** mapbox rendered *****". inst);
    // console.log("multiple addded")
    this.mapMarkers = [];
    this.markerBySearch = false;
    this.mapRouteMarkers = [];
    let map = {},
        mapObj = {},
        deviceLocationMarker = false,
        directions = false,
        oldCategsArrayValue = true,
       destination = {
            latLng: [0, 0],
            profile: 'driving-traffic'
        },
        oldDeviceCords = [0, 0];
    mapboxgl.accessToken = Meteor.settings.public.mapboxglKey;
    // console.log("Current Client", Session.get('currentClient'))
    /*switch (Session.get('currentClient')) {
        case 'paddington':
            mapObj = {
                container: 'mapBox',
                style: 'mapbox://styles/envent/cj43jugsa8j9t2rmzv3q4tsbs',
            }
            Meteor.setTimeout(() => {
                map.resize();
            }, 100);
            break;
        case 'doublebay':
            mapObj = {
                container: 'mapBox',
                style: 'mapbox://styles/envent/cj43jugsa8j9t2rmzv3q4tsbs'
            }
            Meteor.setTimeout(() => {
                map.resize();
            }, 100);
            break;
        case 'admin':
            mapObj = {
                container: 'mapBox',
                style: 'mapbox://styles/envent/cj43jugsa8j9t2rmzv3q4tsbs'
            }
            Meteor.setTimeout(() => {
                map.resize();
            }, 100);
            break;
            case 'check':
            mapObj = {
                container: 'mapBox',
                style: 'mapbox://styles/envent/cj43jugsa8j9t2rmzv3q4tsbs'
            }
            Meteor.setTimeout(() => {
                map.resize();
            }, 100);
            break;
        default:
            mapObj = {
                container: 'mapBox',
                style: 'mapbox://styles/jitos/cj16smgzy001d2sll980l5rqe',
            }
            Meteor.setTimeout(() => {
                map.resize();
            }, 100);
    }*/
    if (Session.get('currentClient')) {
      mapObj = {
        container: 'mapBox',
        style: 'mapbox://styles/envent/cj43jugsa8j9t2rmzv3q4tsbs',
      }
      Meteor.setTimeout(() => {
        map.resize();
      }, 100);
    } else {
        mapObj = {
          container: 'mapBox',
          style: 'mapbox://styles/jitos/cj16smgzy001d2sll980l5rqe',
        }
        Meteor.setTimeout(() => {
          map.resize();
      }, 100);
    }
    // settings maps center to admin specified zoom Level
    if (settings && settings.geoFence && settings.geoFence.zoomLevel) {
        mapObj.zoom = settings.geoFence.zoomLevel;
    }
    // settings maps center to admin specified co-ordinates
    if (settings && settings.geoFence && settings.geoFence.defaultCords && settings.geoFence.defaultCords.geometry && settings.geoFence.defaultCords.geometry.coordinates) {
        mapObj.center = settings.geoFence.defaultCords.geometry.coordinates;
        // console.log(mapObj.center);
    }
    map = new mapboxgl.Map(mapObj);
    window.addEventListener('resize', () => {
        Meteor.setTimeout(() => this.resized.set(window.innerHeight));
    }, true);
    MapData.setMapObj(map); // Expose Map object to Global World to manipulate Further.
    //map.setZoom(13.539824375205158);
    setInterval(() => map.resize(), 2000);
    Meteor.setTimeout(() => {
        var subdomain = document.location.hostname.split('.');
        Logger.log({
            action: `${Meteor.settings.public.userAppActions.mapRendered}`,subdomain: `${subdomain[0]}`
        });
        if (settings && settings.geoFence && settings.geoFence.shape) {
    
            map.addLayer({
                'id': 'maine',
                'type': 'line',
                'source': {
                    'type': 'geojson',
                    'data': settings.geoFence.shape
                },
                'layout': {},
                'paint': {
                    // 'fill-color': 'rgba(0, 0, 0, 0)',
                    // 'fill-outline-color': 'yellow',
                    // 'fill-opacity': 1
                    'line-opacity': 0.7,
                    'line-color': 'yellow',
                    'line-width': 2
                }
            });
        }
        map.addLayer({
            'id': 'housenum_label',
            'type': 'symbol',
            'source': {
                type: 'vector',
                url: 'mapbox://mapbox.mapbox-streets-v5'
            },
            'source-layer': 'housenum_label',
            'layout': {
                'text-field': "{house_num}",
                'text-size': 10,
            },
            'paint': {
                'text-opacity': 0.9,
                'text-color': 'black',
            }
        });
        map.addLayer({
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': {
                    'type': 'identity',
                    'property': 'height'
                },
                'fill-extrusion-base': {
                    'type': 'identity',
                    'property': 'min_height'
                },
                'fill-extrusion-opacity': .6
            }
        /*});*/
    });
        this.autorun(() => {
            this.matchUserAppIp();
            let isRefreshRequired = JSON.stringify(Session.get('categsArray'))!=JSON.stringify(oldCategsArrayValue);
            // console.log(":: IS MARKER RE-FRESH REQUIRED ? - ",isRefreshRequired);

            // Show single selected marker and hide other markers
              if(this.mapMarkers.length){
                    this.mapMarkers.forEach((marker)=>{
                        if(Session.get('singleMarker') && marker._element.id != Session.get('singleMarker')){
                        $('#'+marker._element.id).hide();
                      } else {
                        $('#'+marker._element.id).show();
                      }
                    });
                }

            if (Session.get('categsArray') && isRefreshRequired) {


                // we will show mapbox direction profile options when any user opt for some directions
                $('.mapbox-directions-profile').css('display', 'none');
                oldCategsArrayValue = Session.get('categsArray');
                // initialization on all marker or route refresh
                if (this.mapMarkers.length) {
                    // console.log(":: Removing markers.");
                    this.mapMarkers.forEach((marker) => {
                        let removeStatus = marker.remove();
                    });
                }
                if (deviceLocationMarker) deviceLocationMarker.remove();
                if (directions && isRefreshRequired) directions.removeRoutes();
                // map.center = settings.geoFence.defaultCords.geometry.coordinates
                // initialization on all marker or route refresh
                // Meteor.setTimeout(() => {
                try {
                    markers = [];
                    const mapMarkers = Session.get('categsArray');
                    mapMarkers.map((marker, i) => {
                        // console.log(":: ",i," - marker -  >  ",marker);
                        // create the popup
                        // console.log(marker, "New Markerssssssssssss")
                        var latitude = null,
                            longitude = null,
                            markerName = marker.name ? marker.name : 'Not Available',
                            markerAddress = '',
                            markerSubrub = marker.suburb ? marker.suburb : '',
                            markerState = marker.state ? `${marker.state}` : '',
                            markerPostCode = marker.postCode ? `${marker.postCode}` : '',
                            markerId = marker._id || marker.aboutId,
                            fromDate = marker.from || 'Not defined',
                            toDate = marker.to || 'Not defined';
                        if (marker.primaryAddress) {
                            latitude = marker.primaryAddress.latitude ? marker.primaryAddress.latitude : null
                            longitude = marker.primaryAddress.longitude ? marker.primaryAddress.longitude : null
                            markerAddress = marker.primaryAddress.addressLine ? marker.primaryAddress.addressLine : 'Not Available'
                        } else {
                            latitude = marker.latitude ? marker.latitude : null;
                            longitude = marker.longitude ? marker.longitude : null;
                            markerAddress = marker.address ? marker.address : 'Not Available'
                        }
                        if (marker.newCoords && marker.newCoords.latitude && marker.newCoords.longitude) {
                            latitude = marker.newCoords.latitude;
                            longitude = marker.newCoords.longitude;
                        }
                        if (latitude && longitude && markerId && marker.isApproved) {
                            // console.log('marker', marker.name," - ",marker.aboutId);
                            // var imagePath = undefined;
                            // if (marker.image1) {
                            //     imagePath = marker.image1;
                            // }else if (marker.imageGallery && marker.imageGallery.length>0) {
                            //     imagePath = marker.imageGallery[0].thumbnailUrl;
                            // }
                            var html = '',
                                editButton = '',
                                eventFromAndToDates = '';
                            // var dynamicclass = '';
                            // if(imagePath){
                            //     html+=`<div class="left">
                            //             <img src=${imagePath}>
                            //         </div>`
                            //     dynamicclass = 'right'
                            // }
                            if (Session.get('isAdminIp') && marker.markerFor != 'CurrentEvent') {
                                // console.log(":: SHOW EDIT ? ",Session.get('isAdminIp'));
                                editButton += `
                                    <a class="marker-edit-icon waves-effect waves-light btn voilet darken-3 align-center" id=${markerId}>EDIT</a>`
                            }
                            // means marker represents event or currentEvent(obtained from RSS Event Feed)
                            if (marker.markerFor === 'Event' || marker.markerFor === 'CurrentEvent') {
                                // console.log(":: Moment ti8me  =  ",fromDate.toString().replace('GMT+0530 (IST)',''));

                                eventFromAndToDates = `
                                    <p>Beginning: ${getMe(fromDate)} </p>
                                    <p>Ending: ${ getMe(toDate) }</p>
                                `;
                            }
                            const popup = new mapboxgl.Popup({
                                offset: 25
                            }).setHTML(`
                                   <div class="row marker-tooltip">
                                    ${html}
                                    <div class="side-mapinfo">
                                        <h6>${markerName}</h6>
                                        <p>${markerAddress}</p>
                                        <div>${markerSubrub} <span>${markerState}</span> <span>${markerPostCode}</span></div>
                                        ${eventFromAndToDates}
                                        <p>
                                            <a class="waves-effect waves-light green darken-1 btn more-info" id=${markerId}>DETAILS</a>
                                            <a class="waves-effect waves-light btn blue darken-1 align-center directions" id=${markerId}>DIRECTIONS</a>
                                            <a class="waves-effect waves-light btn orange darken-3 align-center call" id=${markerId}>CALL</a>
                                            ${editButton}
                                        </p>
                                    </div>
                                    </div>
                                `);

                            /*========Start: Show popup open by default if only one marker is there.==========*/
                         /*   var arr = Session.get('categsArray');
                            if (arr.length == 1 ) {
                                    new mapboxgl.Popup({
                                offset: 25
                            })
                            .setLngLat([longitude, latitude])
                            .setHTML(`
                                   <div class="row marker-tooltip">
                                    ${html}
                                    <div class="side-mapinfo">
                                        <h6>${markerName}</h6>
                                        <p>${markerAddress}</p>
                                        <div>${markerSubrub} <span>${markerState}</span> <span>${markerPostCode}</span></div>
                                        ${eventFromAndToDates}
                                        <p>
                                            <a class="waves-effect waves-light green darken-1 btn more-info" id=${markerId}>DETAILS</a>
                                            <a class="waves-effect waves-light btn  blue darken-1 align-center directions" id=${markerId}>DIRECTIONS</a>
                                            <a class="waves-effect waves-light btn orange darken-3 align-center call" id=${markerId}>CALL</a>
                                            ${editButton}
                                        </p>
                                    </div>
                                    </div>
                                `)
                            .addTo(map);
                            }*/
                            /*========End: Show popup open by default if only one marker is there.==========*/

                            // create DOM element for the marker
                            const el = document.createElement('div');
                            el.className = 'marker custom-marker';
                            el.id = markerId;
                            const markerImg = document.createElement('img');
                            markerImg.className = 'marker-img';
                            if (Session.get('currentClient') == 'admin') {
                                const attribute = matchIconColor(marker._id);
                                markerImg.src = attribute.icon ? `/img/maki/${attribute.icon}.svg` : '/img/maki/marker-15.svg';
                                el.style["border-color"] = attribute.colors;
                            }
                            el.appendChild(markerImg);
                              let tmpMarker = new mapboxgl.Marker(el, {
                                    offset: [-25, -25]
                                }).setLngLat([longitude, latitude])
                                .setPopup(popup) // sets a popup on this marker
                                .addTo(map);
                            // console.log(":: ",i," - tmpMarker -  >  ",tmpMarker);
                            this.mapMarkers.push(tmpMarker);

                            if (marker.baseMenuColor) {
                                inst.markerBySearch = marker.baseMenuColor;
                            }
                            markers.push({
                                markerName: markerName,
                                markerAddress: markerAddress,
                                markerId: markerId,
                                // markerImage: imagePath,
                                from: fromDate,
                                to: toDate,
                                baseMenuColor: (marker.baseMenuColor ? marker.baseMenuColor : ''),
                                parentMenuIcon: (marker.parentMenuIcon ? marker.parentMenuIcon : '')
                            });
                            // Session.set('markers', markers);
                        }
                    });
                    Session.set('markers', markers);
                } catch (e) {
                    if (e) {
                        // console.log(':: Error @ const popup', e);
                    }
                } finally {
                    // console.log('******** MARKERS LOADED ********',map);
                    this.stopLoading();
                    if(markers.length)
                        $('#bottomSheetModalId').modal('open');
                    // if(markers.length)
                    //   $('.button-collapse').sideNav('show');

                    // map.resize();
                    // mapObj.zoom = settings.geoFence.zoomLevel;
                    if (Session.get('currentClient') != 'admin') {
                        customizeMarkers(Session.get('selectedSubMenu'), markers);
                    }
                }
                // }, 100);
            }
            // draw device's current co-ordinates
            let deviceLocation = Geolocation.currentLocation();
            // console.log("*** deviceLocation - ",deviceLocation," ***");
            if (deviceLocation || Meteor.settings.public.isLocal) {
                var deviceCords = undefined;
                if (Meteor.settings.public.isLocal) {
                    // console.log("*** isLocal - ", Meteor.settings.public.isLocal);
                    deviceCords = [151.24128056575296, -33.8761822273128]; //sydney
                    //mapCentre(deviceCords, isRefreshRequired);
                } else {
                    deviceCords = [deviceLocation.coords.longitude, deviceLocation.coords.latitude];
                    // For testing
                    if (parseInt(deviceCords[0]) == 77 && parseInt(deviceCords[1]) == 28) {
                        deviceCords = [151.24128056575296, -33.8761822273128]; //sydney
                    }
                }
                //mapCentre([151.24128056575296, -33.8761822273128], isRefreshRequired);//sydney
                // console.log("*** deviceCords - ",deviceCords," ***");
                const deviceMarkerPopup = new mapboxgl.Popup({
                    offset: 25
                }).setHTML(`<h6 class="center-align"><strong>Your Current Location</strong></h6>
                    <p class="center-align">Latitude: ${deviceCords[1]}</p>
                    <p class="center-align">Longitude: ${deviceCords[0]}</p>`);
                // create DOM element for the marker
                const tempDiv = document.createElement('div');
                tempDiv.className = 'currentLocation';
                tempDiv.id = 'currentLocation';
                let refreshDevice = oldDeviceCords[0] != deviceCords[0] || oldDeviceCords[1] != deviceCords[1]
                // means device co-ords has been changed
                if (deviceLocationMarker) {
                    deviceLocationMarker.remove();
                    oldDeviceCords = deviceCords;
                }
                // create the marker
                deviceLocationMarker = new mapboxgl.Marker(tempDiv, {
                    offset: [-25, -25]
                }).setLngLat(deviceCords).setPopup(deviceMarkerPopup).addTo(map);
                // showing path for to current location and selected destination
                let newDestinationVal = Session.get('selectedDestination') ? Session.get('selectedDestination') : {
                    latLng: [0, 0],
                    profile: 'driving-traffic'
                };
                let refreshPath = JSON.stringify(destination) != JSON.stringify(newDestinationVal);
                if (newDestinationVal && newDestinationVal.latLng && newDestinationVal.latLng.length == 2 && refreshPath) {
                    this.stopLoading();
                    $(".mapboxgl-popup-close-button").click();
                    destination = newDestinationVal;
                    if (!directions) {
                        directions = new MapboxDirections({
                            accessToken: mapboxgl.accessToken,
                            interactive: false,
                            unit: 'metric',
                            profile: destination.profile,
                            controls: {
                                inputs: true,
                                instructions: true
                            },
                            styles: mapboxDirectionStyle
                        });
                        map.addControl(directions);
                        directions.on('profile', function(param) {
                            inst.profile.set(param.profile);
                            handleProfileChange(param.profile);
                        });
                    } else {
                        directions.removeRoutes();
                        $(`#mapbox-directions-profile-${destination.profile}`).click();
                        directions.actions.setProfile(destination.profile);
                    }
                    handleProfileChange(destination.profile);
                    inst.profile.set(destination.profile);
                    let routeOriginId = directions.setOrigin(deviceCords);
                    let routeDestId = directions.setDestination(destination.latLng);
                    $('.mapbox-directions-profile').css('display', 'block');
                }
            }
            //current profile markers
            if (inst.profile.get() != inst.oldProfile.get()) {
                inst.oldProfile.set(inst.profile.get());
                getRouteMarkers(inst.profile.get(), map, this.mapRouteMarkers);
            }
        });
        let startTime = Date.now();
        let endTime = Date.now() - startTime;
        // console.log("mapbox.js map load took :: ", endTime, "ms");
    }, 1500);
    // map.on('load', ()=> {
    // });
    console.log("call")
});
Template.mapbox.helpers({
    // mapHeight() {
    //     Template.instance().resized.get();
    //     const mapboxHeight = $(window).height();
    //     if (Session.get('footerHeight')) {
    //       const mapboxHeight = $(window).height() - Session.get('footerHeight');
    //       return `${mapboxHeight}px!important` || '100%';
    //     }else {
    //       const mapboxHeight = $(window).height();
    //       return `${mapboxHeight}px!important` || '100%';
    //     }
    // },
    selectedMarker() {

        return Session.get('selectedMarker');
    },
    showEditableMapbox() {
        let inst = Template.instance();
        if (inst.editableMarker.get()) {
            return true
        }
        return false
    },
    editableMarker() {
        let inst = Template.instance();
        return inst.editableMarker;
    }
});
Template.mapbox.events({
    'click .mapboxgl-canvas' (event) {
        event.preventDefault();
        $('.fixed-action-btn').closeFAB();
    },
    'click .marker' (event) {
        // console.log(Geolocation.currentLocation(), "current")
        let markerDetails = Session.get('categsArray').filter((marker) => {
            let markerId = marker._id || marker.aboutId
            if (marker && markerId && event.currentTarget.id) return markerId === event.currentTarget.id
        });
        if (typeof markerDetails[0].latitude == "string") {
            let locationLatitude = parseFloat(markerDetails[0].latitude);
            let locationLongitude = markerDetails[0].longitude;
            let finalResult = [
                locationLongitude,
                locationLatitude
            ];
            map.flyTo({
                center: finalResult
            });
        } else {
            let locationLatitude = markerDetails[0].latitude;
            let locationLongitude = markerDetails[0].longitude;
            let finalResult = [
                locationLongitude,
                locationLatitude
            ];
            map.flyTo({
                center: finalResult
            });
        }
        Logger.log({
            action: `${Meteor.settings.public.userAppActions.markerPressed}`, context:`${markerDetails[0].name}`
        });
    },
    'click .marker-edit-icon' (event, inst) {
        if (Session.get('currentClient') != 'admin') {
            let markerDetails = Session.get('categsArray').filter((marker) => {
                let markerId = marker._id || marker.aboutId
                if (marker && markerId && event.currentTarget.id) return markerId === event.currentTarget.id
            });
            inst.editableMarker.set(markerDetails[0]);
            Meteor.setTimeout(() => {
                $('#editableMapboxModal').modal({
                    ready: (modal, trigger) => {
                        // console.log(":: editable mapbox modal ready.");
                    },
                    complete: () => {
                        // console.log(":: editable mapbox modal destroyed.");
                        inst.editableMarker.set(false);
                    }
                });
                $('#editableMapboxModal').modal('open');
            }, 500)
        } else {
            return;
        }
    },
    'click .more-info' (event, inst) {
        event.preventDefault();
        let markerDetails = Session.get('categsArray').filter((marker) => {
            let markerId = marker._id || marker.aboutId
            if (marker && markerId && event.target.id) return markerId === event.target.id
        });
        Logger.log({
            action: `${Meteor.settings.public.userAppActions.detailsButtonPressed}`, context: `${markerDetails[0].name}`
        });
        // console.log(":: marker details - ",markerDetails);
        Session.set('selectedMarker', markerDetails[0]);
        $('#markerDetailModal').modal();
        $("#markerDetailModal").modal('open');
    },
    'click .directions' (event, inst) {
        event.preventDefault();
        // console.log(Session.get('categsArray'), "direction object:::::::::::::::::")
        // console.log("*** Show Directions ***");
        let markerDetails = Session.get('categsArray').filter((marker) => {
            let markerId = marker._id || marker.aboutId
            if (marker && markerId && event.target.id) return markerId === event.target.id
        });
        Logger.log({
            action: `${Meteor.settings.public.userAppActions.directionsButtonPressed}`, context: `${markerDetails[0].name}`
        });
        // if marker belongs from database
        if (markerDetails.length && markerDetails[0].latitude && markerDetails[0].longitude) {
            $(".mapboxgl-popup-close-button").click();
            Session.set('selectedDestination', {
                latLng: [markerDetails[0].longitude, markerDetails[0].latitude],
                profile: 'driving-traffic'
            });
        }
        // if marker belongs from sensis API
        if (markerDetails.length && markerDetails[0].primaryAddress && markerDetails[0].primaryAddress.latitude && markerDetails[0].primaryAddress.longitude) {
            Session.set('selectedDestination', {
                latLng: [markerDetails[0].primaryAddress.longitude, markerDetails[0].primaryAddress.latitude],
                profile: 'driving-traffic'
            });
        }
        // if admin has provided custom-coordinates, then we will prefer them
        if (markerDetails.length && markerDetails[0].newCoords && markerDetails[0].newCoords.latitude && markerDetails[0].newCoords.longitude) {
            Session.set('selectedDestination', {
                latLng: [markerDetails[0].newCoords.longitude, markerDetails[0].newCoords.latitude],
                profile: 'driving-traffic'
            });
        }
        Session.set('singleMarker', event.target.id);
    },
    'click .call' (event, inst) {
        let markerDetails = Session.get('categsArray').filter((marker) => {
            let markerId = marker._id || marker.aboutId
            if (marker && markerId && event.currentTarget.id) return markerId === event.currentTarget.id
        });
        var phone = false;
        if (markerDetails.length && markerDetails[0].phone) {
            phone = markerDetails[0].phone ? markerDetails[0].phone.replace(/\D+/g, '') : false;
        }
        if (markerDetails.length && markerDetails[0].primaryContacts && markerDetails[0].primaryContacts.length) {
            phone = markerDetails[0].primaryContacts[0].value ? markerDetails[0].primaryContacts[0].value.replace(/\D+/g, '') : false;
            if (markerDetails[0].primaryContacts && markerDetails[0].primaryContacts.length) {
                let phoneNum = _.where(markerDetails[0].primaryContacts, {
                    type: "PHONE"
                });
                if (phoneNum && phoneNum.length) {
                    phone = phoneNum[0].value.replace(/\D+/g, '');
                } else if (markerDetails[0].secondaryContacts && markerDetails[0].secondaryContacts['Toll Free'] && markerDetails[0].secondaryContacts['Toll Free'].length) {
                    let phoneNum = _.where(markerDetails[0].secondaryContacts['Toll Free'], {
                        type: "PHONE"
                    });
                    phone = phoneNum[0].value.replace(/\D+/g, '');
                } else {
                    phone = 0
                }
            } else {
                phone = 0
            }
        }
        if (phone) {
            document.location.href = `tel:${phone}`;
        }
    },
    'click #currentLocation' (event, inst) {
        let finalResult = [
        151.24128056575296,
            -33.8761822273128
             
        ]
        map.flyTo({
            center: finalResult
        });
    }
});

function handleProfileChange(profile) {
    if (profile == 'driving-traffic' || profile == 'driving') {
        $("label[for='mapbox-directions-profile-driving-traffic']").show();
        $("#mapbox-directions-profile-driving-traffic").show();
    } else {
        $("label[for='mapbox-directions-profile-driving-traffic']").hide();
        $("#mapbox-directions-profile-driving-traffic").hide();
    }
}

function customizeMarkers(subMenu, makers) {
    if (subMenu && subMenu.preference && subMenu.preference.icon) $('.marker-img').attr('src', `./img/maki-white/${subMenu.preference.icon}.svg`);
    else if (makers.length && makers[0].parentMenuIcon) $('.marker-img').attr('src', `./img/maki-white/${makers[0].parentMenuIcon}.svg`);
    else $('.marker-img').attr('src', `./img/maki/marker-15.svg`);
    if (subMenu && subMenu.baseMenuColor) {
        $('.marker').css('border-color', "#919496");
        $('.marker').css('background-color', subMenu.baseMenuColor);
        // markerImg.src = `./img/maki/${subMenu.preference.colors}.svg`;
    } else if (makers.length && makers[0].baseMenuColor) {
        $('.marker').css('border-color', "#919496");
        $('.marker').css('background-color', makers[0].baseMenuColor);
    }
}

function matchIconColor(markerId) {
    let iconColor = {};
    if(getSubdomain())
    {
      iconColor = dynamicCollections[getSubdomain()+'_menu_item_dev'].findOne({
          'items.custom_locations': markerId
      });
    }
    else {
      iconColor = MenuItemDev.findOne({
          'items.custom_locations': markerId
      });
    }
    if (!iconColor) {
        return {}
    }
    let subMenus = iconColor.items.filter((i, ind2) => {
        if (i.custom_locations.includes(markerId)) {
            return i;
        }
    });
    return subMenus[0].preference;
}

function getRouteMarkers(profile, map, mapRouteMarkers) {
    let type = undefined;
    if (profile == 'driving-traffic' || profile == 'driving') {
        type = 'drive';
    } else if (profile == 'walking') {
        type = 'walk';
    } else if (profile == 'cycling') {
        type = 'ride';
    }
    if (mapRouteMarkers.length) {
        mapRouteMarkers.forEach((marker) => {
            let removeStatus = marker.remove();
        });
    }
    let fields = {};
    fields[type] = 1;
    var subdomain = document.location.hostname.split('.');
    var filter = {};
    filter["subDomain"] = subdomain[0];
    let routeLocations = [];
    if(getSubdomain())
    {
      routeLocations = dynamicCollections[getSubdomain()+'_routeLocations'].find(filter, {
          fields: fields
      }).fetch()
    }
    else {
      routeLocations = RouteLocations.find(filter, {
          fields: fields
      }).fetch()
    }
    let markers = routeLocations && routeLocations.length == 1 && routeLocations[0][type] ? routeLocations[0][type] : [];
    markers.map((marker) => {
        createMarker(marker, map, mapRouteMarkers, type);
    })
}

function createMarker(marker, map, mapRouteMarkers, type) {
    // const mapboxgl = require('mapbox-gl');
    var latitude = marker.latitude ? marker.latitude : null;
    longitude = marker.longitude ? marker.longitude : null;
    markerName = marker.name ? marker.name : 'Not Available';
    markerAddress = marker.address ? marker.address : 'Not Available'
    markerId = marker._id ? marker._id : null;
    imagePath = marker.imagePath ? marker.imagePath : null;
    if (latitude && longitude) {
        var html = '';
        var dynamicclass = 'center-align'
        if (imagePath) {
            html += `<div class="left">
                    <img src=${imagePath}>
                </div>`
            dynamicclass = 'right'
        }
        const popup = new mapboxgl.Popup({
            offset: 25
        }).setHTML(`
                <div class="row">
                ${html}
                <div class=\"${dynamicclass} side-mapinfo\">
                    <h6>${markerName}</h6>
                    <p>${markerAddress}</p>
                // create the marker
                </div>
                </div>
            `);
        // create DOM element for the marker
        const el = document.createElement('div');
        var i = document.createElement("I");
        if (type == 'drive') {
            i.className = "mdi-24px mdi mdi-car";
        } else if (type == 'walk') {
            i.className = "mdi-24px mdi mdi-walk";
        } else if (type == 'ride') {
            i.className = "mdi-24px mdi mdi-bike";
        }
        el.appendChild(i);
        el.className = 'profileMarkers route-location-marker';
        // el.id = markerId;
        let tempRouteMarker = new mapboxgl.Marker(el, {
                offset: [-25, -25]
            }).setLngLat([longitude, latitude]).setPopup(popup) // sets a popup on this marker
            .addTo(map);
        mapRouteMarkers.push(tempRouteMarker);
    }
}
//MapBox Singleton Object to be exposed for other widget to Use.
var MapData = (() => {
    map = null;
    return {
        setMapObj: (mapObj) => {
            map = mapObj
        },
        getMapObj: () => {
            return map;
        }
    }
})();

function mapCentre(cordinates, flag = true) {
    if (flag) {
        let dataa = map.flyTo({
            center: [
                cordinates[0],
                cordinates[1]
            ]
        });
    }
}

function getMe(date) {
    var dateObj = new Date(date);

      var hours = dateObj.getHours();
      var minutes = dateObj.getMinutes();
      var ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0'+minutes : minutes;
      var strTime = hours + ':' + minutes + ' ' + ampm;

    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
    return days[dateObj.getDay()]+", "+ monthNames[dateObj.getMonth()]+" "+dateObj.getDate()+", "+dateObj.getFullYear()+" "+strTime;
}
module.exports.MapData = MapData;
module.exports.mapCentre = mapCentre;
