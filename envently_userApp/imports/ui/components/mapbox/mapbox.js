import './mapbox.html';
import './markerDetails.js';
import './editableMapbox.js';
import '../fab/fab.js';
import {AdminSettings} from '/imports/api/admin_settings/admin_settings.js';

import {MenuItemDev} from '/imports/api/menu_item_dev/menu_item_dev.js';
import {mapboxDirectionStyle} from './mapboxDirection.js';
import {RouteLocations} from '/imports/api/routeLocations/routeLocations.js';
import {getCookie, getSubdomain, getSubMenuList} from '/imports/startup/both/global_function.js';
//import { getSubdomain } from '/imports/startup/both/global_function.js';
import {dynamicCollections} from '/imports/startup/both/dynamic_collections.js';
//import { getSubdomain } from '/imports/startup/both/global_function.js';
import moment from 'moment';
import {TAPi18n} from 'meteor/tap:i18n';

var dynamicCenter = new ReactiveVar(null);
var dynamicZoom = new ReactiveVar(null);
Template.mapbox.onCreated(function () {
  this.selectedMarker = new ReactiveVar(null);
  this.resized = new ReactiveVar(null);
  this.profile = new ReactiveVar(null);
  this.oldProfile = new ReactiveVar(null);
  this.markerCordinates = [0, 0];
  //this.markerBySearch = false;
  let subDomain = getSubdomain(getCookie("selectedSDForSA"));
  Meteor.call('AdminSettings.fetchBySubdomain', subDomain, (error, result) => {
    if (error) {
      // console.log(":: error in AdminSettings.fetchBySubdomain - ",error);
    } else {
      if (result && result.geoFence) {

        // console.log("no error in fetching subdomain");
        let defaultCordinates = result.geoFence.defaultCords.geometry.coordinates;
        let defaultLongitude = defaultCordinates[0];
        let defaultLatitude = defaultCordinates[1];
        Session.set('defaultCordinates', defaultCordinates);
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
  // Logger.log({
  //   action: `${Meteor.settings.public.userAppActions.mapRender}`,
  //   subDomain `${subDomain}`
  // });
  var usage_log = {
    action: `${Meteor.settings.public.userAppActions.mapRender}`,
    subDomain: `${subDomain}`
  };
  Meteor.call('UsageLog.insert', usage_log, (error, result) => {
    if (error) {
      console.log('error usage_log', error);
      return;
    }
    console.log('success usage_log', result);
  });
  Meteor.subscribe('routeLocations.currentDomain', subDomain);
  this.stopLoading = (() => Session.set('showLoadingSpinner', false));
});
Template.mapbox.onRendered(function () {

  let settings = {};
  if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings']) {
    settings = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings'].findOne({subDomain: getCookie("selectedSDForSA")});
  } else {
    settings = AdminSettings.findOne({subDomain: getCookie("selectedSDForSA")});
  }
  markers = "";
  const inst = Template.instance();
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
  this.autorun(() => {
    if (Session.get('currentClient')) {
      mapObj = {
        attributionControl: false,
        container: 'mapBox',
        style: 'mapbox://styles/envent/cj43jugsa8j9t2rmzv3q4tsbs',
      }
      Meteor.setTimeout(() => {
        map.resize();
      }, 1000);
    } else {
      mapObj = {
        container: 'mapBox',
        style: 'mapbox://styles/jitos/cj16smgzy001d2sll980l5rqe',
      }
      Meteor.setTimeout(() => {
        map.resize();
      }, 1000);
    }
  });
  // settings maps center to admin specified zoom Level
  if (settings && settings.geoFence && settings.geoFence.zoomLevel) {
    mapObj.zoom = settings.geoFence.zoomLevel;
  }
  // settings maps center to admin specified co-ordinates
  if (Meteor.user() && Roles.userIsInRole(Meteor.userId(), ['kiosk'], 'kiosk') && Meteor.user().profile.coordinates && Meteor.user().profile.coordinates.long !== '' && Meteor.user().profile.coordinates.lat !== '') {
    if (dynamicCenter.get()) {
      mapObj.center = dynamicCenter.get();
      $('#fabUserLocationBtn').show();
    } else {
      mapObj.center = [parseFloat(Meteor.user().profile.coordinates.long), parseFloat(Meteor.user().profile.coordinates.lat)];
    }

  } else {
    if (settings && settings.geoFence && settings.geoFence.defaultCords && settings.geoFence.defaultCords.geometry && settings.geoFence.defaultCords.geometry.coordinates) {
      mapObj.center = settings.geoFence.defaultCords.geometry.coordinates;
    }
  }
  map = new mapboxgl.Map(mapObj);

  // blue icon user location traking code
  const geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
      //maximumAge: 0,
      //timeout: 6000 / 6 sec /

    },
    trackUserLocation: true,
    showUserLocation: true
  });

  map.addControl(
    geolocate
  );

  Meteor.setTimeout(geolocate._onClickGeolocate.bind(geolocate), 5);

  window.addEventListener('resize', () => {
    Meteor.setTimeout(() => this.resized.set(window.innerHeight));
  }, true);
  MapData.setMapObj(map); // Expose Map object to Global World to manipulate Further.
  if (dynamicZoom.get()) {
    map.setZoom(dynamicZoom.get());
  } else {
    map.setZoom(13.539824375205158);
  }
  setInterval(() => map.resize(), 2000);
  Meteor.setTimeout(() => {
    let subDomain = getSubdomain(getCookie("selectedSDForSA"));
    // Logger.log({
    //   action: `${Meteor.settings.public.userAppActions.mapRendered}`, subDomain: `${subDomain}`
    // });

    var usage_log = {
      action: `${Meteor.settings.public.userAppActions.mapRendered}`,
      subDomain: `${subDomain}`
    };
    Meteor.call('UsageLog.insert', usage_log, (error, result) => {
      if (error) {
        console.log('error usage_log', error);
        return;
      }
      console.log('success usage_log', result);
    });

    /* this.autorun(() => {*/

    if (settings && settings.geoFence && settings.geoFence.shape) {
      /*map.on('load', function () {*/
      /*this.autorun(() =>{*/


      var layers = map.getStyle().layers;
      // Find the index of the first symbol layer in the map style
      /*let firstSymbolId;
      for (let i = 0; i < layers.length; i++) {
          if (layers[i].type === 'symbol') {
<<<<<<< HEAD
          firstSymbolId = layers[i].id;
      break;
  }
      }*/

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
      /*  });*/
    } else {
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
      });
    }
    /*});*/
    /* });*/
    this.autorun(() => {

      let isRefreshRequired = JSON.stringify(Session.get('categsArray')) != JSON.stringify(oldCategsArrayValue);

      // Show single selected marker and hide other markers
      if (this.mapMarkers.length) {
        this.mapMarkers.forEach((marker) => {
          if (Session.get('singleMarker') && marker._element.id != Session.get('singleMarker')) {
            $('#' + marker._element.id).hide();
          } else {
            $('#' + marker._element.id).show();
          }
        });
      }

      if (Session.get('categsArray') && isRefreshRequired) {


        // we will show mapbox direction profile options when any user opt for some directions
        $('.mapbox-directions-profile').css('display', 'none');
        oldCategsArrayValue = Session.get('categsArray');
        // initialization on all marker or route refresh
        if (this.mapMarkers.length) {
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
            // create the popup

            // console.log("Draw map")

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
              let html = '',
                editButton = '',
                eventFromAndToDates = '';
              // means marker represents event or currentEvent(obtained from RSS Event Feed)
              if (marker.markerFor === 'Event' || marker.markerFor === 'CurrentEvent') {
                eventFromAndToDates = `
                                    <p>Beginning: ${getMe(fromDate)} </p>
                                    <p>Ending: ${getMe(toDate)}</p>
                                `;
              }
              let locationInfoPopupColors = {
                "modalBackgroundColor": "#0c0c0c !important",
                "detailsButtonColor": "#43A047 !important",
                "directionButtonColor": "#1E88E5 !important",
                "callButtonColor": "#ef6c00 !important",
                "directionButtonTextColor": "#fff !important",
                "locationNameFontColor": "#fff !important",
                "locationInfoFontColor": "#fff !important",
                "callButtonTextColor": "#fff !important",
                "detailsButtonTextColor": "#fff !important",
                "crossButtonColor": "#fff !important",
              };

              if (settings && settings.colors && settings.colors.locationInfoPopup) {
                locationInfoPopupColors = {
                  "modalBackgroundColor": `${settings.colors.locationInfoPopup.modalBackgroundColor} !important` || "#0c0c0c !important",
                  "detailsButtonColor": `${settings.colors.locationInfoPopup.detailsButtonColor} !important` || "#43A047 !important",
                  "directionButtonColor": `${settings.colors.locationInfoPopup.directionButtonColor} !important` || "#1E88E5 !important",
                  "callButtonColor": `${settings.colors.locationInfoPopup.callButtonColor} !important` || "#ef6c00 !important",
                  "directionButtonTextColor": `${settings.colors.locationInfoPopup.directionButtonTextColor} !important` || "#fff !important",
                  "locationNameFontColor": `${settings.colors.locationInfoPopup.locationNameFontColor} !important` || "#fff !important",
                  "locationInfoFontColor": `${settings.colors.locationInfoPopup.locationInfoFontColor} !important` || "#fff !important",
                  "callButtonTextColor": `${settings.colors.locationInfoPopup.callButtonTextColor} !important` || "#fff !important",
                  "detailsButtonTextColor": `${settings.colors.locationInfoPopup.detailsButtonTextColor} !important` || "#fff !important",
                  "crossButtonColor": `${settings.colors.locationInfoPopup.crossButtonColor} !important` || "#fff !important"
                };
              }
              html = ` <div class="row marker-tooltip" style="background: ${locationInfoPopupColors.modalBackgroundColor}">
                                    ${html}
                                    <div class="side-mapinfo">
                                        <h6 style="color: ${locationInfoPopupColors.locationNameFontColor};">${markerName}</h6>
                                        <p style="color: ${locationInfoPopupColors.locationInfoFontColor};">${markerAddress}</p>
                                        <div style="color: ${locationInfoPopupColors.locationInfoFontColor};">${markerSubrub} <span>${markerState}</span> <span>${markerPostCode}</span></div>
                                        ${eventFromAndToDates}
                                        <p>
                                            <a class="waves-effect waves-light green darken-1 btn more-info" id=${markerId} style="background: ${locationInfoPopupColors.detailsButtonColor}; color: ${locationInfoPopupColors.detailsButtonTextColor}">
                                                ${TAPi18n.__("mapBoxMarkers.detailsButton")}
                                            </a>
                                            <a class="waves-effect waves-light btn blue darken-1 align-center directions" id=${markerId} style="background: ${locationInfoPopupColors.directionButtonColor}; color: ${locationInfoPopupColors.directionButtonTextColor}">
                                              ${TAPi18n.__('mapBoxMarkers.directionButton')}
                                            </a>`;
              if (!Roles.userIsInRole(Meteor.userId(), ['kiosk'], 'kiosk')) {
                html += `<a class="waves-effect waves-light btn orange darken-3 align-center call" id=${markerId} style="background: ${locationInfoPopupColors.callButtonColor}; color: ${locationInfoPopupColors.callButtonTextColor}">
                                                ${TAPi18n.__('mapBoxMarkers.callButton')}
                                            </a>`;
              }
              html += `${editButton}
                                        </p>
                                    </div>
                                </div>`;
              const popup = new mapboxgl.Popup({
                offset: 25
              }).setHTML(html);

              const el = document.createElement('div');
              el.className = 'marker custom-marker';
              el.id = markerId;
              const markerImg = document.createElement('img');
              markerImg.className = 'marker-img';
              if (Session.get('currentClient') == 'admin') {
                const attribute = matchIconColor(marker._id);
                markerImg.src = attribute.icon ? `./assets/img/maki/${attribute.icon}.svg` : './assets/img/maki/marker-15.svg';
                el.style["border-color"] = attribute.colors;
              }
              el.appendChild(markerImg);
              let tmpMarker = new mapboxgl.Marker(el, {
                offset: [-25, -25]
              }).setLngLat([longitude, latitude])
                .setPopup(popup) // sets a popup on this marker
                .addTo(map);
              this.mapMarkers.push(tmpMarker);

              if (marker.baseMenuColor) {
                inst.markerBySearch = marker.baseMenuColor;
              }
              //markers = [];
              markers.push({
                markerName: markerName,
                markerAddress: markerAddress,
                markerId: markerId,
                // markerImage: imagePath,
                phone: marker.phone,
                from: fromDate,
                to: toDate,
                baseMenuColor: (marker.baseMenuColor ? marker.baseMenuColor : ''),
                parentMenuIcon: (marker.parentMenuIcon ? marker.parentMenuIcon : '')
              });
              Session.set('markers', markers);
            }
          });
        } catch (e) {
          if (e) {

          }
        } finally {
          this.stopLoading();
          if (!Session.get('trueOrFalse')) {
            if (markers.length) {
              $('#bottomSheetModalId').modal('open');
            }
          }
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
      let deviceLocation = '';
      if (Meteor.isCordova) {
        // For mobile device
        deviceLocation = Session.get('deviceLocation');
      } else {
        // For web
        deviceLocation = Geolocation.currentLocation();
        deviceLocation = [deviceLocation.coords.longitude, deviceLocation.coords.latitude];
        Session.set('deviceLocation', deviceLocation);
      }

      if (!deviceLocation && Meteor.user() && Roles.userIsInRole(Meteor.userId(), ['kiosk'], 'kiosk')) {
        if (Meteor.user().profile.coordinates && Meteor.user().profile.coordinates.long !== '' && Meteor.user().profile.coordinates.lat !== '') {
          deviceLocation = [parseFloat(Meteor.user().profile.coordinates.long), parseFloat(Meteor.user().profile.coordinates.lat)]
        }
      }
      if (deviceLocation || Meteor.settings.public.isLocal) {
        var deviceCords = undefined;
        if (Meteor.settings.public.isLocal) {
          if (Meteor.user() && Roles.userIsInRole(Meteor.userId(), ['kiosk'], 'kiosk') && Meteor.user().profile.coordinates && Meteor.user().profile.coordinates.long !== '' && Meteor.user().profile.coordinates.lat !== '') {
            deviceCords = [parseFloat(Meteor.user().profile.coordinates.long), parseFloat(Meteor.user().profile.coordinates.lat)]
          } else {
            //deviceCords = mapObj.center;
            deviceCords = deviceLocation;
          }
        } else {
          if (Meteor.user() && Roles.userIsInRole(Meteor.userId(), ['kiosk'], 'kiosk') && Meteor.user().profile.coordinates && Meteor.user().profile.coordinates.long !== '' && Meteor.user().profile.coordinates.lat !== '') {
            deviceCords = [parseFloat(Meteor.user().profile.coordinates.long), parseFloat(Meteor.user().profile.coordinates.lat)]
          } else {
            deviceCords = deviceLocation;
            // For testing
            /*if (parseInt(deviceCords[0]) == 77 && parseInt(deviceCords[1]) == 28) {
                // deviceCords = [151.24128056575296, -33.8761822273128]; //sydney
                deviceCords = mapObj.center;
            }*/
          }
        }
        //mapCentre([151.24128056575296, -33.8761822273128], isRefreshRequired);//sydney
        const deviceMarkerPopup = new mapboxgl.Popup({
          offset: 25
        }).setHTML(`<h6 id ="currentLocationMarker" class="center-align"><strong>${TAPi18n.__("mapBoxMarkers.currentLocationPopup")}</h6>
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
        // console.log("location changed1", Session.get('deviceLocation'));
        // console.log("location changed2", Session.get('deviceLocation'));
        // console.log("location changed3", Session.get('deviceLocation'));
        // console.log("Device coods:", deviceCords);
        // create the marker
        /*deviceLocationMarker = new mapboxgl.Marker(tempDiv, {
            offset: [-25, -25]
        }).setLngLat(Session.get('deviceLocation')).setPopup(deviceMarkerPopup).addTo(map);*/
        // showing path for to current location and selected destination
        /*let currentPostionMarkercolor = {
            "markerColor": "#fa8e4a !important"
        };

        if (settings && settings.colors && settings.color.mapBox) {
            currentPostionMarkercolor = {
                "markerColor" : `${settings.colors.mapBox.markerColor} !important` || "#fa8e4a !important"
            };
        }
        $('#currentLocation').css('color', currentPostionMarkercolor.markerColor);*/

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
            if (Roles.userIsInRole(Meteor.userId(), ['kiosk'], 'kiosk')) {
              map.addControl(directions, 'bottom-right');
            } else {
              map.addControl(directions);
            }
            directions.on('profile', function (param) {
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
  }, 1500);
  /* map.on('load', function () {*/
  //Get value on zoom
  map.on('zoomend', function (e) {
    //alert("hello zoom");
    dynamicCenter.set(map.getCenter());
    dynamicZoom.set(map.getZoom());
  });
  map.on('dragend', function (e) {
    // alert("hello drag");
    dynamicCenter.set(map.getCenter());
  });
  if (Roles.userIsInRole(Meteor.userId(), ['kiosk'], 'kiosk'))
    $("a.mapboxgl-ctrl-logo").attr({'href': "#", 'target': ""});

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

    // console.log(`hello world ===> ${Session.get('selectedMarker')}`);

    return Session.get('selectedMarker');
  },
});
Template.mapbox.events({
  'click .mapboxgl-canvas'(event) {
    event.preventDefault();
    $('.fixed-action-btn').closeFAB();
  },
  'click .marker'(event) {

    // console.log("marker class is called");

    var details = TAPi18n.__("mapBoxMarkers.detailsButton");
    var dir = TAPi18n.__('mapBoxMarkers.directionButton');
    var call = TAPi18n.__('mapBoxMarkers.callButton');
    $(".more-info").text(details);
    $(".directions").text(dir);
    $(".call").text(call);


    let markerDetails = Session.get('categsArray').filter((marker) => {
      let markerId = marker._id || marker.aboutId
      if (marker && markerId && event.currentTarget.id) return markerId === event.currentTarget.id
    });
    // console.log("mark details ====> " , markerDetails);
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
    if (markerDetails[0] && markerDetails[0].name) {

      var language = Session.get('lang');
      // console.log("loaded languages ====> " , TAPi18n.languages_names[language][0]);


      var lang = TAPi18n.languages_names[language][0];

      let subDomain = getSubdomain(getCookie("selectedSDForSA"));
      var promise = new Promise(function (res, rej) {

        // Logger.log({
        //   action: `${Meteor.settings.public.userAppActions.listMenuSelected}`,
        //   context: `${markerDetails[0].name}`,
        //   language: `${lang}`
        // });
        var usage_log = {
          action: `${Meteor.settings.public.userAppActions.listMenuSelected}`,
          context: `${markerDetails[0].name}`,
          subDomain: `${subDomain}`,
          language: `${lang}`
        };
        Meteor.call('UsageLog.insert', usage_log, (error, result) => {
          if (error) {
            console.log('error usage_log', error);
            return;
          }
          console.log('success usage_log', result);
        });

        res("success");

      }).then(function (result) {

        // console.log("under then");
        // Logger.log({
        //   action: `${Meteor.settings.public.userAppActions.markerPressed}`, context: `${markerDetails[0].name}`
        // });
        var usage_log = {
          action: `${Meteor.settings.public.userAppActions.markerPressed}`,
          subDomain: `${subDomain}`,
          context: `${markerDetails[0].name}`
        };
        Meteor.call('UsageLog.insert', usage_log, (error, result) => {
          if (error) {
            console.log('error usage_log', error);
            return;
          }
          console.log('success usage_log', result);
        });
      }).catch(function (error) {
        console.log("error =====> ", error);
      })


    }
  },
  'touchend .marker'(event) {

    // console.log("touch end of marker");
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
    if (markerDetails[0] && markerDetails[0].name) {

      var language = Session.get('lang');
      // console.log("loaded languages ====> " , TAPi18n.languages_names[language][0]);
      var lang = TAPi18n.languages_names[language][0];

      var promise = new Promise(function (res, rej) {
        let subDomain = getSubdomain(getCookie("selectedSDForSA"));

        // Logger.log({
        //   action: `${Meteor.settings.public.userAppActions.listMenuSelected}`,
        //   context: `${markerDetails[0].name}`,
        //   language: `${lang}`
        // });

        var usage_log = {
          action: `${Meteor.settings.public.userAppActions.listMenuSelected}`,
          context: `${markerDetails[0].name}`,
          subDomain: `${subDomain}`,
          language: `${lang}`
        };
        Meteor.call('UsageLog.insert', usage_log, (error, result) => {
          if (error) {
            console.log('error usage_log', error);
            return;
          }
          console.log('success usage_log', result);
        });

        res("success");
      });

      promise.then(function (result) {

        let subDomain = getSubdomain(getCookie("selectedSDForSA"));
        // Logger.log({
        //   action: `${Meteor.settings.public.userAppActions.markerPressed}`, context: `${markerDetails[0].name}`
        // });

        var usage_log = {
          action: `${Meteor.settings.public.userAppActions.markerPressed}`,
          subDomain: `${subDomain}`,
          context: `${markerDetails[0].name}`
        };
        Meteor.call('UsageLog.insert', usage_log, (error, result) => {
          if (error) {
            console.log('error usage_log', error);
            return;
          }
          console.log('success usage_log', result);
        });
      })

      promise.catch(function (error) {
        console.log("error =====> ", error);
      })
    }
  },
  'click .more-info'(event, inst) {
    // Session.set('showLoadingSpinner', false);

    event.preventDefault();
    Session.set('selectedMarker', "");
    Session.set('showLoadingSpinner', true);
    $('#markerDetailModal').modal({
      ready: function (modal, trigger) {
        //calculate modal content height
        const modalImageBox = modal.find("div.modal-content.modal-imginfo > div.imginfo-mainbox").outerHeight();
        const modalFooter = modal.find("div.modal-footer").outerHeight();
        const modalContainerHeight = window.innerHeight - (modalImageBox + modalFooter);
        $("#style-2").outerHeight(modalContainerHeight);
        //console.log("ready ModalContentHeight: ", modalContainerHeight)
      }
    });
    $("#markerDetailModal").modal('open');

    //alert("dfdf")
    //$('.modal.bottom-sheet').modal('close');
    /*$('#overlay-box').css('display', 'none');*/
    let adminSettings = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings'].find({
      subDomain: getCookie("selectedSDForSA")
    }).fetch();
    let markerDetails = Session.get('categsArray').filter((marker) => {
      let markerId = marker._id || marker.aboutId;
      if (marker && markerId && event.target.id)
        return markerId === event.target.id
    });

    if (markerDetails[0]) {

      var language = Session.get('lang');
      // console.log("loaded languages ====> " , TAPi18n.languages_names[language][0]);
      var lang = TAPi18n.languages_names[language][0];

      var promise = new Promise(function (res, rej) {
        let subDomain = getSubdomain(getCookie("selectedSDForSA"));

        // Logger.log({
        //   action: `${Meteor.settings.public.userAppActions.listMenuSelected}`,
        //   context: `${markerDetails[0].name}`,
        //   language: `${lang}`
        // });

        var usage_log = {
          action: `${Meteor.settings.public.userAppActions.listMenuSelected}`,
          context: `${markerDetails[0].name}`,
          subDomain: `${subDomain}`,
          language: `${lang}`
        };
        Meteor.call('UsageLog.insert', usage_log, (error, result) => {
          if (error) {
            console.log('error usage_log', error);
            return;
          }
          console.log('success usage_log', result);
        });

        res("success");
      });

      promise.then(function (result) {

        // Logger.log({
        //   action: `${Meteor.settings.public.userAppActions.detailsButtonPressed}`, context: `${markerDetails[0].name}`
        // });
        let subDomain = getSubdomain(getCookie("selectedSDForSA"));

        var usage_log = {
          action: `${Meteor.settings.public.userAppActions.detailsButtonPressed}`,
          subDomain: `${subDomain}`,
          context: `${markerDetails[0].name}`
        };
        Meteor.call('UsageLog.insert', usage_log, (error, result) => {
          if (error) {
            console.log('error usage_log', error);
            return;
          }
          console.log('success usage_log', result);
        });

      })

      promise.catch(function (error) {
        console.log("error =====> ", error);
      })


      let detailsId = markerDetails[0]._id;
      let isUrl;
      if (markerDetails[0] && markerDetails[0].productId) {
        isUrl = markerDetails[0].productId;
      }
      //let isUrl = markerDetails[0].createdAt;
      if (isUrl === undefined) {
        Session.set('selectedMarker', markerDetails[0]);
        Session.set('showLoadingSpinner', false);
      } else {
        Session.set('showLoadingSpinner', true);
        let settings = {
          "async": true,
          "crossDomain": true,
          "url": `https://atlas.atdw-online.com.au/api/atlas/product?key=b48bc68600e648a397fe46a4da776f60&productId=${detailsId}&out=json`,
          "method": "GET",
          "headers": {
            "Cache-Control": "no-cache",
            "Postman-Token": "f826355c-01c7-e8a4-9770-eef82adb0486"
          }
        }
        $.ajax(settings).done(function (response) {
          response.communication.map((responceObject) => {
            Session.set('showLoadingSpinner', true);
            if (responceObject && responceObject.attributeIdCommunicationDescription === 'Primary Phone') {
              let communicationAreaCode = responceObject.communicationAreaCode || '';
              let communicationIsdCode = responceObject.communicationIsdCode || '';
              let communicationDetail = responceObject.communicationDetail || '';
              markerDetails[0].phone = `${communicationIsdCode} ${communicationAreaCode} ${communicationDetail}`;
            } else if (responceObject && responceObject.attributeIdCommunicationDescription === 'URL Enquiries') {
              markerDetails[0].website = responceObject.communicationDetail;
            }
          });
          Session.set('selectedMarker', markerDetails[0]);
          Session.set('showLoadingSpinner', false);


        });
      }

      //Session.set('showLoadingSpinner', false);
      /*if (true) {}*/
      if (Roles.userIsInRole(Meteor.userId(), ['kiosk'], 'kiosk')) {
        $("div.modal-overlay").remove();
      }
    }
  },
  'click .directions'(event, inst) {
    event.preventDefault();
    let markerDetails = Session.get('categsArray').filter((marker) => {
      let markerId = marker._id || marker.aboutId
      if (marker && markerId && event.target.id) return markerId === event.target.id
    });
    if (markerDetails[0] && markerDetails[0].name) {

      // console.log("under mapbox.js");
      var language = Session.get('lang');
      // console.log("loaded languages ====> " , TAPi18n.languages_names[language][0]);
      var lang = TAPi18n.languages_names[language][0];

      var promise = new Promise(function (res, rej) {

        // Logger.log({
        //   action: `${Meteor.settings.public.userAppActions.listMenuSelected}`,
        //   context: `${markerDetails[0].name}`,
        //   language: `${lang}`
        // });
        let subDomain = getSubdomain(getCookie("selectedSDForSA"));

        var usage_log = {
          action: `${Meteor.settings.public.userAppActions.listMenuSelected}`,
          context: `${markerDetails[0].name}`,
          subDomain: `${subDomain}`,
          language: `${lang}`
        };
        Meteor.call('UsageLog.insert', usage_log, (error, result) => {
          if (error) {
            console.log('error usage_log', error);
            return;
          }
          console.log('success usage_log', result);
        });

        res("success");
      });

      promise.then(function (result) {

        // Logger.log({
        //   action: `${Meteor.settings.public.userAppActions.directionsButtonPressed}`,
        //   context: `${markerDetails[0].name}`
        // });

        let subDomain = getSubdomain(getCookie("selectedSDForSA"));
        var usage_log = {
          action: `${Meteor.settings.public.userAppActions.directionsButtonPressed}`,
          subDomain: `${subDomain}`,
          context: `${markerDetails[0].name}`
        };
        Meteor.call('UsageLog.insert', usage_log, (error, result) => {
          if (error) {
            console.log('error usage_log', error);
            return;
          }
          console.log('success usage_log', result);
        });

      })

      promise.catch(function (error) {
        console.log("error =====> ", error);
      })


    }
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
  'click .call'(event, inst) {
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
  'click #currentLocation'(event, inst) {
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings'].findOne({subDomain: getCookie("selectedSDForSA")});
    } else {
      siteSetting = AdminSettings.findOne({subDomain: getCookie("selectedSDForSA")});
    }
    if (siteSetting && siteSetting.geoFence) {
      let coordinates = siteSetting.geoFence.defaultCords.geometry.coordinates;
      map.flyTo({
        center: [
          coordinates[0],
          coordinates[1]
        ]
      });
    }

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
  if (subMenu && subMenu.preference && subMenu.preference.icon) $('.marker-img').attr('src', `./assets/img/maki-white/${subMenu.preference.icon}.svg`);
  else if (makers.length && makers[0].parentMenuIcon) $('.marker-img').attr('src', `./assets/img/maki-white/${makers[0].parentMenuIcon}.svg`);
  else $('.marker-img').attr('src', `./assets/img/maki/marker-15.svg`);
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
  if (getSubdomain()) {
    iconColor = dynamicCollections[getSubdomain() + '_menu_item_dev'].findOne({
      'items.custom_locations': markerId
    });
  } else {
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
  let subDomain = getSubdomain(getCookie("selectedSDForSA"));
  var filter = {};
  filter["subDomain"] = subDomain;
  let routeLocations = [];
  if (getSubdomain()) {
    routeLocations = dynamicCollections[getSubdomain() + '_routeLocations'].find(filter, {
      fields: fields
    }).fetch()
  } else {
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
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;

  var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
  return days[dateObj.getDay()] + ", " + monthNames[dateObj.getMonth()] + " " + dateObj.getDate() + ", " + dateObj.getFullYear() + " " + strTime;
}


module.exports.MapData = MapData;
module.exports.mapCentre = mapCentre;
