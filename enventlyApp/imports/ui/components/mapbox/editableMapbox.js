import './editableMapbox.html';

Template.editableMapbox.onCreated(function() {
    console.log(":: this inside editableMapbox - > ",this.data.get());
    this.marker = new ReactiveVar(this.data?this.data.get():true);
    this.mapMarker = new ReactiveVar(false);
    var subdomain = document.location.hostname.split('.');
    Meteor.subscribe('routeLocations.currentDomain', subdomain[0]);
});

Template.editableMapbox.onRendered(function() {

    let settings = Session.get('siteSettings');
    console.log(":: settings ------ > ",settings );
    let map = {}, mapObj = {};
    this.changeMarker = (marker, map)=>{
        console.log(":: MARKER INSIDE CHANGEmARKER = > ",marker);
		try {
            // create the popup
            var latitude = null,
                longitude = null,
                markerName = marker.name ? marker.name : 'Not Available',
                markerAddress = '',
                markerId = marker._id || marker.aboutId

            if (marker.primaryAddress) {
                latitude = marker.primaryAddress.latitude ? marker.primaryAddress.latitude : null
                longitude = marker.primaryAddress.longitude ? marker.primaryAddress.longitude : null
                markerAddress = marker.primaryAddress.addressLine ? marker.primaryAddress.addressLine : 'Not Available'
            } else {
                latitude = marker.latitude ? marker.latitude : null;
                longitude = marker.longitude ? marker.longitude : null;
                markerAddress = marker.address ? marker.address : 'Not Available';
            }
            if(marker.newCoords && marker.newCoords.latitude && marker.newCoords.longitude){
            	latitude = marker.newCoords.latitude;
                longitude = marker.newCoords.longitude;
            }
            console.log(":: MARKER CO-ORDS - >",latitude,longitude,markerId)
            if (latitude && longitude && markerId) {
                console.log('marker', marker.name," - ",marker.aboutId);
                // create DOM element for the marker
                const el = document.createElement('div');
                el.className = 'editableMarker';
                el.id = markerId;
                /*const markerImg = document.createElement('img');
                markerImg.className = 'marker-img';*/
                // el.appendChild(markerImg);
                
                // create the marker
                let tmpMarker = new mapboxgl.Marker(el, {
                        offset: [-25, -25]
                    }).setLngLat([longitude, latitude])
                    .addTo(map);
                this.mapMarker.set(tmpMarker);
            }
            
        } catch (e) {
            if (e) {
                console.log(':: Error @ const popup', e);
            }
        } finally {
            console.log('******** MARKERS LOADED ********', map);
            // map.resize();
            // mapObj.zoom = settings.geoFence.zoomLevel;
            customizeMarkers(Session.get('selectedSubMenu'));
        }
    }

	if(this.marker?this.marker.get():false){
		mapboxgl.accessToken = Meteor.settings.public.mapboxglKey;
        console.log(Session.get('currentClient'))
	    switch (Session.get('currentClient')) {
	        case 'paddington':
	            mapObj = {
	                container: 'editableMap',
	                style: 'mapbox://styles/envent/cj43jugsa8j9t2rmzv3q4tsbs',
	            }
	            break;

	        case 'doublebay':
	            mapObj = {
	                container: 'editableMap',
	                style: 'mapbox://styles/envent/cj43jugsa8j9t2rmzv3q4tsbs'
	            }
	            break;

            case 'admin':
                mapObj = {
                    container: 'editableMap',
                    style: 'mapbox://styles/envent/cj43jugsa8j9t2rmzv3q4tsbs'
                }
                break;

	        default:
	            mapObj = {
	                container: 'editableMap',
	                style: 'mapbox://styles/jitos/cj16smgzy001d2sll980l5rqe',
	            }
	    }

	    // settings maps center to admin specified zoom Level 
	    if (settings && settings.geoFence && settings.geoFence.zoomLevel) {
	        mapObj.zoom = settings.geoFence.zoomLevel;
	    }

	    // settings maps center to admin specified co-ordinates 
	    if (settings && settings.geoFence && settings.geoFence.defaultCords && settings.geoFence.defaultCords.geometry && settings.geoFence.defaultCords.geometry.coordinates) {
	        mapObj.center = settings.geoFence.defaultCords.geometry.coordinates;
	    }

		map = new mapboxgl.Map(mapObj);
        setInterval(()=>map.resize(), 600);
    
	}

    this.autorun(()=>{
        console.log(":: marker to be editted - ",this.marker?this.marker.get():false);
	    if(this.marker?this.marker.get():false){
    		map.on('load', () => {
				let marker = this.marker.get();
				console.log(":: MAPBOX ON-LOAD.");
                console.log(":: SETTINGS - > ",settings);
                if (settings && settings.geoFence && settings.geoFence.shape) {
                    map.addLayer({
                        'id': 'maine',
                        'type': 'fill',
                        'source': {
                            'type': 'geojson',
                            'data': settings.geoFence.shape
                        },
                        'layout': {},
                        'paint': {
                            'fill-color': 'rgba(0, 0, 0, 0)',
                            'fill-outline-color': 'red',
                            'fill-opacity': 0.5
                        }
                    });
                }
                // layer for showing house numbers
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

                map.on('click', (e) => {
                    // if marker is already there, remove marker first
                    if (this.mapMarker.get()){
                    	console.log(":: MAP MARKER - > ",this.mapMarker.get());
                    	this.mapMarker.get().remove(map);
                    }
                		marker.newCoords = {
                			latitude: e.lngLat.lat,
                			longitude: e.lngLat.lng
                		}
                		console.log(":: marker new coords - > ",marker)
                		this.marker.set(marker);
                		this.changeMarker(marker, map)
                });

                this.changeMarker(marker, map)
            });
	    }
    });
});

Template.editableMapbox.helpers({
});

Template.editableMapbox.events({
	'click .modal-action'(e, i) {
		console.log(":: i.marker - ",i.marker.get());
		// write code here for updating the marker co-ordinates with newCoords value;
        let marker = i.marker.get();
        if (marker && marker.newCoords && marker.newCoords.latitude && marker.newCoords.longitude){

            let newCoords = {
                location: marker.name,
                newCoords: marker.newCoords,
                updatedDate: new Date()
            }
    	    Meteor.call('locationCoords.insert', newCoords, (err, result)=>{
                if(err){
                    console.log(":: locationCoords.insert, err - > ",err);
                }else{
                    let markerList = Session.get('categsArray');
                    if(markerList && markerList.length){
                        markerList = markerList.map((m)=>{
                            if(m.name==marker.name)
                                m.newCoords = marker.newCoords
                            return m
                        });
                        Session.set('categsArray', markerList);
                    }
                    console.log(":: locationCoords.insert, result - > ",result);
                }
            })
        }
    }
});

function customizeMarkers(subMenu) {
    // console.log(":: markers loaded.",subMenu);
    if (subMenu && subMenu.preference && subMenu.preference.icon) {
        // console.log(":: subMenu.preference.icon - ", subMenu.preference.icon);
        $('.marker-img').attr('src', `./img/maki/${subMenu.preference.icon}.svg`);
    } else {
        $('.marker-img').attr('src', `./img/maki/marker-15.svg`);
    }

    if (subMenu && subMenu.preference && subMenu.preference.colors) {
        // console.log(":: subMenu.preference.colors - ", subMenu.preference.colors);
        $('.marker').css('border-color', subMenu.preference.colors);
        // markerImg.src = `./img/maki/${subMenu.preference.colors}.svg`;
    }
}
