import './geoJsonLines.html';
import { getCookie } from '/imports/startup/both/global_function.js';

Template.geoJsonMap.onCreated(function() {
    const { ReactiveVar }  =  require('meteor/reactive-var');
    require('./geoJsonLines.css');
    this.userShape = new ReactiveVar(false);
    this.userPoint = new ReactiveVar(false);
    this.zoomLevel = new ReactiveVar(false);
    // $("#geoJsonMapModal").modal();
    // console.log(":: open geoJsonMapTemplate.");
    Meteor.call('AdminSettings.details',getCookie("selectedSDForSA"), (error, details) => {
        if (error) {
            console.log(":: error inside AdminSettings.details - ", error);
        } else {
            if (details && details.geoFence) {
                this.zoomLevel.set(details.geoFence.zoomLevel);

                if (details.geoFence.defaultCords)
                    this.userPoint.set(details.geoFence.defaultCords);

                if (details.geoFence.shape)
                    this.userShape.set(details.geoFence.shape);
            }
        }
    });
});


Template.geoJsonMap.onRendered(function() {
    mapboxgl.accessToken = Meteor.settings.public.mapboxglKey;
    this.loadMap = ((container) => {
        // const mapboxgl = require('mapbox-gl');
        let mapProps = {
            container: container,
            style: 'mapbox://styles/envent/cj43jugsa8j9t2rmzv3q4tsbs',
        }
        if (this.zoomLevel.get()) {
            mapProps.zoom = this.zoomLevel.get();
        }
        if (this.userPoint.get()) {
            mapProps.center = this.userPoint.get().geometry.coordinates
        }

        map = new mapboxgl.Map(mapProps);
        map.resize();
        this.draw = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
                polygon: true,
                trash: true,
                point: true
            },
        });
        /*this.draw.create = function(){
            console.log(": create called");
        }*/
        // map.on('load', function() {
        //     map.setPaintProperty('point', 'circle-color', '#3bb2d0');
        // });

        let mapDraw = map.addControl(this.draw);
        // console.log(":: mapDraw = ", mapDraw);
        // console.log(":: map = ", map);
        // console.log(":: this.draw = ", this.draw);

        map.on('zoomend', (event) => {
            this.zoomLevel.set(parseInt(map.getZoom()));
        });
        map.on('draw.create', (event) => {
            // this.zoomLevel.set(parseInt(map.getZoom()));
            console.log("on clreat called ",this,event);
        });
        map.on('draw.modechange', (event) => {
            if(event.mode=="draw_point"){
                $('.mapbox-gl-draw_polygon').css({border: '0px'});
                $('.mapbox-gl-draw_point').css({border: '2px solid black'});
                $('.mapbox-gl-draw_trash').css({border: '0px'});

            }else if(event.mode=="simple_select"){
                $('.mapbox-gl-draw_polygon').css({border: '0px'});
                $('.mapbox-gl-draw_point').css({border: '0px'});
                $('.mapbox-gl-draw_trash').css({border: '2px solid black'});

            }else if(event.mode=="draw_polygon"){
                $('.mapbox-gl-draw_polygon').css({border: '2px solid black'});
                $('.mapbox-gl-draw_point').css({border: '0px'});
                $('.mapbox-gl-draw_trash').css({border: '0px'});

            }
            // this.zoomLevel.set(parseInt(map.getZoom()));
            // console.log("on mode changed = ",event);
        });

        map.on('mouseup', (e) => {
            let features = this.draw.getAll().features;
            let shape = [];
            let point = [];
            features.forEach((feature) => {
                if (feature.geometry.type == "Polygon" && shape.length == 0) {
                    // console.log(":: crete shape ",feature.geometry.coordinates[0].length);
                    if (feature.geometry.coordinates[0].length > 3) {
                        shape.push(feature);
                        this.userShape.set(feature);
                    }
                } else if (feature.geometry.type == "Point" && point.length == 0) {
                    // console.log(":: crete point ");
                    point.push(feature);
                    this.userPoint.set(feature);
                } else {
                    let status = this.draw.delete([feature.id]);
                    if(feature.geometry.type == "Polygon")
                        $('.mapbox-gl-draw_polygon').click();
                    if(feature.geometry.type == "Point")
                        $('.mapbox-gl-draw_point').click();
                    // console.log(":: feature = ",feature);
                }
            });
            return false
        });
        Meteor.setTimeout(() => {
            $('.mapbox-gl-draw_polygon').click();
        }, 1200);

    });

    Meteor.setTimeout(() => {
        console.log(":::: initializing modal.");
        $('#geoJsonMapModal').modal({
            ready: (modal, trigger) => {
                console.log("Modal Ready.");
                this.loadMap('geoJsonMap');
                if (this.userShape && this.userShape.get()) {
                    this.draw.add(this.userShape.get());
                }
                if (this.userPoint && this.userPoint.get()) {
                    this.draw.add(this.userPoint.get());
                }
            },
            complete: () => {
                this.draw.deleteAll();
            }
        });
    }, 400);

    /*Meteor.setTimeout(()=>{
        console.log(":: opening map.");
    },1000)*/
});


Template.geoJsonMap.events({

    'submit #geoJsonForm': (event, inst) => {
        event.preventDefault();
        console.log(":: inst - ",JSON.stringify(inst.draw.getAll()));

        if (!inst.userPoint.get()) {
            console.log(":: Please selecte co-ordinates first.");
        }
        let insertObj = {
            shape: inst.userShape.get(),
            point: inst.userPoint.get(),
            zoom: inst.zoomLevel.get()
        }
        Meteor.call('AdminSettings.updateGeoFence', insertObj,getCookie("selectedSDForSA"), (error, status) => {
            if (error) {
                console.log(":: error inside updateGeoFence - ", error);
                showAlert('danger', 'Can not update Geo fence details');
            } else {
                console.log(":: status inside updateGeoFence - ", status);
                if (status) {
                    showAlert('success', 'Geo fence details updated successfully');
                }
            }
        });
    }

});

Template.geoJsonMap.events({

    'submit #geoJsonForm': (event, inst) => {
        event.preventDefault();
        console.log(":: inst - ", JSON.stringify( /*inst.draw.getAll()*/ ));
    },

});

Template.geoJsonMap.helpers({
    zoomLevel() {
        $("label[for='zoom-level']").attr({ 'class': 'active' });
        return Template.instance().zoomLevel.get();
    },
    cordinates() {
        let inst = Template.instance();
        let point = inst.userPoint.get();
        $("label[for='latLong']").attr({ 'class': 'active' });

        if (!point || !point.geometry.coordinates.length)
            return
            // console.log(":: co-ordinates - ",point.geometry.coordinates);
        let cords = point.geometry.coordinates;
        return `Latitude=${cords[1]}, Longitude=${cords[0]}`;
    }
});

function showAlert(type, message) {
    Bert.alert({
        title: 'Hey there!',
        message: message,
        type: type,
        style: 'growl-top-right',
        icon: 'fa-check',
    });
}
