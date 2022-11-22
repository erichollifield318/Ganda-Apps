import './geoJsonLines.html';
//import { getCookie } from '/imports/startup/both/global_function.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { getSubdomain,getCookie } from '/imports/startup/both/global_function.js';

Template.geoJsonMap.onCreated(function() {
    const { ReactiveVar }  =  require('meteor/reactive-var');
    require('./geoJsonLines.css');
    this.userShape = new ReactiveVar(false);
    this.userPoint = new ReactiveVar(false);
    this.zoomLevel = new ReactiveVar(false);
    // $("#geoJsonMapModal").modal();
    // console.log(":: open geoJsonMapTemplate.");
    // console.log(" :: 11 getCookie('selectedSDForSA') ",getCookie("selectedSDForSA"))
    Meteor.call('AdminSettings.details',getCookie("selectedSDForSA"), (error, details) => {
        if (error) {
            console.log(":: error inside AdminSettings.details - ", error);
        } else {
          console.log('details', details);
            if (details && details.geoFence) {
                this.zoomLevel.set(details.geoFence.zoomLevel);

                if (details.geoFence.defaultCords) {
                  this.userPoint.set(details.geoFence.defaultCords);
                }

                if (details.geoFence.shape) {
                  this.userShape.set(details.geoFence.shape);
                }
            } else {
              this.zoomLevel.set(14);

              this.userPoint.set({
                geometry: {
                    coordinates: [
                      151.2428284863807,
                      -33.87659929440507
                    ],
                  type: "Point"
                },
                properties: {},
                type: "Feature"
              });
            }
        }
    });
});


Template.geoJsonMap.onRendered(function() {
    mapboxgl.accessToken = Meteor.settings.public.mapboxglKey;
//console.log("1 this.userPoint.get():::: ", this.userPoint.get())
    this.loadMap = ((container) => {

        //console.log("2 this.userPoint.get():::: ", this.userPoint.get())
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
            //console.log("loadMap:: ", this.zoomLevel.get(), this.userPoint.get())

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
            // console.log("on clreat called ",this,event);
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
        //$('map').trigger( "click" );
        $( "map" ).trigger('mousedown');
        map.on('mousedown', (e) => {
            //this.autorun(() => {
                //salert('ffff')
                console.log("MapDown ::: ", this.draw.getAll())
            let features = this.draw.getAll().features;
            let shape = [];
            let point = [];
            features.forEach((feature, index) => {
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

    //Meteor.setTimeout(() => {
        $('#geoJsonMapModal').modal({
            ready: (modal, trigger) => {
                this.autorun((computation) => {
                    console.log("AUTORUN:::: " );
                    console.log("3 this.userPoint.get():::: ", this.userPoint.get());
                    if(this.userPoint.get()){
                        $("#geoJsonMap").html('');
                        this.loadMap('geoJsonMap');

                        if (this.userShape && this.userShape.get()) {
                            let isGeoFence = {};
                            if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
                                isGeoFence = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({subDomain: getSubdomain(getCookie("selectedSDForSA"))});
                            } else {
                                isGeoFence = AdminSettings.findOne({ subDomain: 'doublebay' });
                            }
                            if (isGeoFence && isGeoFence.geoFence) {
                                let userShape = isGeoFence.geoFence.shape;
                                this.draw.add(userShape);
                            }
                        }
                        if (this.userPoint && this.userPoint.get()) {
                            this.draw.add(this.userPoint.get());
                        }

                        computation.stop();

                    }else{
                        $("#geoJsonMap").html(`<div style="
                            position: absolute;
                            top: 40%;
                            left: 40%;
                            background: #fafafa;
                            font-size: 28px;
                            text-align: center;
                            font-weight: 600;
                            color: #333333;
                        "> Loading Map
                        <img src="/img/loading.gif">
                        </div>`)
                    }
                })
            },
            complete: () => {
                this.draw.deleteAll();
            }
        });
    //}, 400);

    /*Meteor.setTimeout(()=>{
        console.log(":: opening map.");
    },1000)*/
});


Template.geoJsonMap.events({

    'submit #geoJsonForm': (event, inst) => {
        event.preventDefault();
        // console.log(":: inst - ",JSON.stringify(inst.draw.getAll()));

        if (!inst.userPoint.get()) {
            // console.log(":: Please selecte co-ordinates first.");
        }
        let userPoint = inst.userPoint.get();
        userPoint.geometry.coordinates = [];
        let latLong = $('#latLong').val();

        userPoint.geometry.coordinates.push(parseFloat(latLong.split(',')[1].split('=')[1]));
        userPoint.geometry.coordinates.push(parseFloat(latLong.split(',')[0].split('=')[1]));
        let insertObj = {
            shape: inst.userShape.get(),
            point: userPoint,
            zoom: parseInt($('#zoom-level').val())
        };
        console.log("insertObj::: ", insertObj);
        Meteor.call('AdminSettings.updateGeoFence', insertObj,getCookie("selectedSDForSA"), (error, status) => {
            if (error) {
                // console.log(":: error inside updateGeoFence - ", error);
                showAlert('danger', 'Can not update Geo fence details');
            } else {
                // console.log(":: status inside updateGeoFence - ", status);
                if (status) {
                    showAlert('success', 'Geo fence details updated successfully');

                    if(insertObj.point.geometry && insertObj.point.geometry.coordinates)
                        Session.set('defaultCords', insertObj.point.geometry.coordinates);

                    if(insertObj.zoom)
                        Session.set('defaultZoomLevel', insertObj.zoom);

                }
            }
        });
    }

});

Template.geoJsonMap.events({

    'submit #geoJsonForm': (event, inst) => {
        event.preventDefault();
        // console.log(":: inst - ", JSON.stringify( /*inst.draw.getAll()*/ ));
    },

});

Template.geoJsonMap.helpers({
    zoomLevel() {
        $("label[for='zoom-level']").attr({ 'class': 'active' });
        //console.log(, "reactive")
        let isgeoFence = {};
        if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
            isgeoFence = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getSubdomain(getCookie("selectedSDForSA")) });
        } else {
            isgeoFence = AdminSettings.findOne({ subDomain: 'doublebay' });
        }
        if (isgeoFence && isgeoFence.geoFence) {
            return isgeoFence.geoFence.zoomLevel;
        } else {
          // return Template.instance().zoomLevel.get();
          return 14;
        }
    },


    cordinates() {
        let inst = Template.instance();
        let point = inst.userPoint.get();
        //console.log("Helper pOints ", inst.userPoint.get())
        $("label[for='latLong']").attr({ 'class': 'active' });

        if (!point || !point.geometry.coordinates.length)
          return;

            // console.log(":: co-ordinates - ",point.geometry.coordinates);
        // let cordss = point.geometry.coordinates;
        let isgeoFence = {};
        if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
            isgeoFence = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getSubdomain(getCookie("selectedSDForSA")) });
        } else {
            isgeoFence = AdminSettings.findOne({ subDomain: 'doublebay' });
        }
        if (isgeoFence && isgeoFence.geoFence) {
            let cords = {};
            if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
                cords = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getSubdomain(getCookie("selectedSDForSA")) }).geoFence.defaultCords.geometry.coordinates;
            } else {
                cords = AdminSettings.findOne({ subDomain: 'doublebay' }).geoFence.defaultCords.geometry.coordinates;
            }
            return `Latitude=${cords[1]}, Longitude=${cords[0]}`;
        } else {
          let cordss = point.geometry.coordinates;
          return `Latitude=${cordss[1]}, Longitude=${cordss[0]}`;
          // return `Latitude=-33.87659929440507, Longitude=151.2428284863807`;
        }
    },

    isActive(zoomLevel) {
        return zoomLevel ? 'active' : '';
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
