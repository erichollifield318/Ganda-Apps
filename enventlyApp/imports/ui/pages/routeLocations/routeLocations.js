import { RouteLocations } from '/imports/api/routeLocations/routeLocations.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain,getCookie } from '/imports/startup/both/global_function.js';
import './routeLocations.html';
import '../routeLocationDetail/routeLocationDetail.js'

Template.routeLocations.onCreated(function() {
    const { ReactiveVar }  =  require('meteor/reactive-var');
    require('./routeLocations.css');
    let map = false;
    Meteor.subscribe('routeLocations.current', Meteor.userId(),getCookie("selectedSDForSA"));
    this.walkLocations = new ReactiveVar(false);
    this.rideLocations = new ReactiveVar(false);
    this.driveLocations = new ReactiveVar(false);
    this.name = new ReactiveVar(null);
    this.address = new ReactiveVar(null);
    this.phone = new ReactiveVar(null);
    this.latitude = new ReactiveVar(null);
    this.longitude = new ReactiveVar(null);
    this.map = new ReactiveVar(null);
    this.type = new ReactiveVar(null);
    this.routeLocationsMarkers = new ReactiveVar([]);

});

Template.routeLocations.onRendered(function() {
    let map = false;
    mapboxgl.accessToken = Meteor.settings.public.mapboxglKey;
    const template = Template.instance();
    this.mapRouteMarkers=[];

    this.setMarker = ((map, latitude, longitude, markerName, markerAddress, phone, type, imagePath) => {
        let markerInfo = {name:markerName, latitude:latitude, longitude:longitude, address:markerAddress, phone:phone}
        Meteor.call('RouteLocations.addNewMarker', type, markerInfo,getCookie("selectedSDForSA"), (error, result) => {
                if (error) {
                    console.log('error', error);
                    showAlert('danger', 'Can not add this Marker');
                }else{
                    markerInfo["_id"] = result;

                    let routeMarkers = template.routeLocationsMarkers.get();
                    routeMarkers.push(markerInfo);
                    template.routeLocationsMarkers.set(routeMarkers);

                    createMarker(markerInfo, map, this.mapRouteMarkers, type);
                    showAlert('success', 'Marker added successfully');
                }
            });
    });

    this.loadMap = ((container, type) => {
        // const mapboxgl = require('mapbox-gl');
        map = new mapboxgl.Map({
            container: container,
            style: 'mapbox://styles/envent/cj43jugsa8j9t2rmzv3q4tsbs',
        });

        map.on('load', ()=> {
            let markers = getRouteLocationMarkers(type);
            template.routeLocationsMarkers.set(markers);
            markers.map((marker) => {
                createMarker(marker, map, this.mapRouteMarkers, type);
            })
        })

        map.on('click', (e) => {
            this.map.set(map);
            this.type.set(type);
            this.latitude.set(e.lngLat.lat);
            this.longitude.set(e.lngLat.lng);
            $("#routeLocationDetail").modal('open');
        });
    });

    this.autorun(() => {
        let map = template.map.get()
        let latitude = template.latitude.get()
        let longitude = template.longitude.get()
        let name = template.name.get()
        let address = template.address.get()
        let phone = template.phone.get()
        let type = template.type.get()
        if(name){
            template.map.set(null)
            template.latitude.set(null)
            template.longitude.set(null)
            template.name.set(null)
            template.address.set(null)
            template.phone.set(null)
            template.type.set(null)
            this.setMarker(map, latitude, longitude, name, address, phone, type);
        }
    });
});

Template.routeLocations.helpers({
    data(){
        let inst = Template.instance();
        let routeLocations = {};
        if(getSubdomain(getCookie("selectedSDForSA")))
        {
          routeLocations = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_clients'].findOne({ userId: Meteor.userId() });
        }
        else {
          routeLocations = RouteLocations.findOne({ userId: Meteor.userId() });
        }
        return routeLocations;
    },

    routeLocationMarkerData() {
        return {
            "map": Template.instance().map,
            "latitude": Template.instance().latitude,
            "longitude": Template.instance().longitude,
            "name": Template.instance().name,
            "address": Template.instance().address,
            "phone": Template.instance().phone,
            "type": Template.instance().type
        }
    }
});

Template.routeLocations.events({
    'submit #routeLocations': (event, inst) => {
        Session.set('showLoading',true);
        event.preventDefault();
    },
    'change .routing-mode'(event, inst){
        inst.loadMap('map-box', event.target.value);
    },

    'click .route-location-marker'(event){
        event.preventDefault();
        $('#routeLocationDetail').modal('close');
    },

    'click .delete-route-marker' (event, inst) {
        event.preventDefault();
        let mapRouteMarkers = inst.mapRouteMarkers;
        let result = _.findWhere(mapRouteMarkers, {_id: event.target.id});
        let type = result.type
        Meteor.call('RouteLocations.removeMarker', type, event.target.id,getCookie("selectedSDForSA"), (error, result) => {
            if (error) {
                console.log('error', error);
                showAlert('danger', 'Can not remove this Marker');
            }else{
                inst.loadMap('map-box', type);
                showAlert('success', 'Marker remove successfully');
            }
        });
    }
});

function showAlert(type, message){
    Bert.alert({
        title: 'Hey there!',
        message: message,
        type: type,
        style: 'growl-top-right',
        icon: 'fa-check',
    });
}

function createMarker(marker, map, mapRouteMarkers, type){
    // const mapboxgl = require('mapbox-gl');
    var latitude = marker.latitude ? marker.latitude : null;
        longitude = marker.longitude ? marker.longitude : null;
        markerName = marker.name ? marker.name : 'Not Available';
        markerAddress = marker.address ? marker.address : 'Not Available'
        markerId = marker._id ? marker._id : null;
        imagePath = marker.imagePath ? marker.imagePath : null;

    if (latitude && longitude && markerId) {
        var html = '';
        var dynamicclass = 'center-align'
        if(imagePath){
            html+=`<div class="left">
                    <img src=${imagePath}>
                </div>`
            dynamicclass = 'right'
        }
        const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
               <div class="row">
                ${html}
                <div class=\"${dynamicclass} side-mapinfo\">
                    <h6>${markerName}</h6>
                    <p>${markerAddress}</p>
                    <p>
                        <a class="waves-effect waves-light green darken-1 btn delete-route-marker" id=${markerId}>DELETE</a>
                    </p>
                </div>
                </div>
            `);

        // create DOM element for the marker
        const el = document.createElement('div');
        el.className = 'currentLocation route-location-marker';
        el.id = markerId;
        let tempRouteMarker = new mapboxgl.Marker(el, {
                offset: [-25, -25]
            }).setLngLat([longitude, latitude])
            .setPopup(popup) // sets a popup on this marker
            .addTo(map);
            mapRouteMarkers.push({_id:markerId, type:type});
    }
}

function getRouteLocationMarkers(type){
    let fields = {};
    fields[type] = 1;
    let routeLocations = [];
    if(getSubdomain(getCookie("selectedSDForSA")))
    {
      routeLocations = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].find({ userId: Meteor.userId()}, {fields:fields}).fetch()
    }
    else {
      routeLocations = RouteLocations.find({ userId: Meteor.userId()}, {fields:fields}).fetch()
    }
    let markers = routeLocations && routeLocations.length==1 && routeLocations[0][type] ? routeLocations[0][type] : [];
    return markers;
}
