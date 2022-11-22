import {
    MenuItemDev
} from '/imports/api/menu_item_dev/menu_item_dev.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';
import './fab.html';
import {
    MapData,
    mapCentre
} from '../mapbox/mapbox.js';
var activeZoom = null; //Just to make sure Location really changed.
var activeCenter = []; //Just to make sure the Active Center.
Template.fab.onCreated(function() {
    require('./fab.css');
    Session.set('showLoadingSpinner', true);
    this.menus = new ReactiveVar(false);
    // this.editMenu = new ReactiveVar(false);
    this.client = new ReactiveVar(Session.get('currentClient'));
    Session.setDefault("currentMenu", false);
    //Locate Me button configuration.
    let map = null,
        assignMapDragEvent = () => {
            Meteor.setTimeout(() => {
                map = MapData.getMapObj();
                if (map) { //Once map object assigned we start reading our events.
                    map.on('dragend', () => { //Drag end show Center Button.
                        $('#fabUserLocationBtn').show();
                    });
                    map.on('zoomend', () => { //Zooming move/change should show zoom Button.
                        if (activeZoom != map.getZoom() && activeCenter[0] != map.getCenter().lng) {
                            $('#fabUserLocationBtn').show();
                        }
                    });
                } else {
                    assignMapDragEvent();
                }
            }, 400);
        };
    assignMapDragEvent();
    $(document).on("click", (event) => {


        if (($('#overlay-box').css('display') == "block") && !(event.target.className == "icon-area" || event.target.className == "large material-icons" || event.target.className == "btn-floating mobile-fab-tip uppercase grey darken-1 velocity-animating")) {
            /*alert($('#overlay-box').css('display'))
            if ($('#overlay-box').css('display') == "block") {
                $('#overlay-box').css('display', 'none');
            } else {
                $('#overlay-box').css('display', 'block');
            }*/

            $('#overlay-box').css('display', 'none');
            
            $('.fixed-action-btn').closeFAB();


                $("#mainMenuList").toggle();
        


        }
    })
});
Template.fab.onRendered(function() {
    this.autorun(() => {
        let menuHandle = Meteor.subscribe('menu_item_dev.all');
        if (menuHandle.ready()) {
            console.log(getSubdomain(), "::::::::::::::::::Sub domain")
            if(getSubdomain())
            {
              this.menus.set(dynamicCollections[getSubdomain()+'_menu_item_dev'].find({
                  "publishDetails": {
                      $exists: true
                  }
              }, {
                  sort: {
                      customIndex: 1
                  }
              }).fetch());
            }
            else {
              this.menus.set(MenuItemDev.find({
                  "publishDetails": {
                      $exists: true
                  }
              }, {
                  sort: {
                      customIndex: 1
                  }
              }).fetch());
            }
            Session.set('showLoadingSpinner', false);
            Meteor.setTimeout(() => {
                $("#fabModal").click();
            }, 200);
        }
    });
    // This prevents double clicking on FAB by initializing .bottom-sheet.modal()
    // Meteor.setTimeout(function () {
    //   $('.bottom-sheet').modal();
    // }, 1500);
});
Template.fab.helpers({
    currentClient() {
        return Session.get('currentClient');
    },
    currentMenu() {
        return Session.get('currentClient');
    },
    getMenu() {
        return Template.instance().menus.get();
    },
    getMenuIcon(menu) {
        if (menu && menu.preference && menu.preference.icon) {
            return menu.preference.icon;
        }
        return 'city-15';
    },
    getMenuColor(menu) {
        if (menu && menu.preference && menu.preference.color) {
            return menu.preference.color;
        }
    },
    isVisibleText() {
    var arr = Session.get('categsArray');
    if (arr){
      if (arr.length > 0 ) {
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  },
});
Template.fab.events({
    'click .clicker' (event, inst) {
        event.preventDefault();
        $('#overlay-box').css('display', 'none');
        $('.bottom-sheet').modal();
        //$('.bottom-sheet').modal();
        const modalId = event.currentTarget.id;
        const modalName = event.currentTarget.dataset.name;
        var subdomain = document.location.hostname.split('.');
        Session.set("mainMenuSelected", modalName);
        Logger.log({
            action: `${Meteor.settings.public.userAppActions.mainMenuItemSelected} ${subdomain[0]} ${modalName}`
        });
        // console.log(":: modalName - >  ",modalName);
        inst.data.selectedMenuId.set(modalId);
        Session.set('selectedMenuName', modalName);
        let menus = inst.menus.get();
        let menu = _.findWhere(menus, {
            _id: modalId
        });
        if (menu && menu.items && menu.items.length == 1) {
            /* Code to set base menu color for marker BG */
            if (menu) menu.items[0].baseMenuColor = menu.preference.color;
            showMapBoxModalDirectly(menu.items[0], inst);
        } else {
            $('#bottomSheetModalId').modal('open');
        }
        Session.set("currentMenu", modalId);
        $('.fixed-action-btn').closeFAB();
        $("#mainMenuList").toggle();
        /*mapCentre();*/
    },
    'click #fabModal' (event) {
        event.preventDefault();
        if ($('#overlay-box').css('display') == "block") {
            $('#overlay-box').css('display', 'none');
        } else {
            $('#overlay-box').css('display', 'block');
        }
        var subdomain = document.location.hostname.split('.');
        Logger.log({
            action: `${Meteor.settings.public.userAppActions.mainMenuOpened} ${subdomain[0]}`
        });
        $("#mainMenuList").toggle();
        $('#markerDetailModal').modal();
        $("#markerDetailModal").modal('close');
        event.preventDefault();
    },
    'click #fabUserLocationBtn' (event) {
        event.preventDefault();
        let map = MapData.getMapObj(),
            deviceLocation = Geolocation.currentLocation(),
            deviceCords = [151.24128056575296, -33.8761822273128]; //sydney
        if (deviceLocation && !Meteor.settings.public.isLocal) {
            deviceCords = [deviceLocation.coords.longitude, deviceLocation.coords.latitude];
        }
        activeZoom = map.getZoom();
        activeCenter = deviceCords;
        map.flyTo({
            center: deviceCords,
            around: deviceCords,
            zoom: activeZoom,
            speed: 0.5,
            easing: (t) => {
                if (t === 1) {
                    Meteor.setTimeout(() => { //As Zoom Event Just fired. that might make our button visible.
                        $('#fabUserLocationBtn').hide();
                    }, 0);
                }
                return t;
            }
        });
        $(event.currentTarget).hide();
    },
    'click .heading-list' (event, inst) {
        $('#bottomSheetModalId').modal('open');
        Session.set("currentMenu", null);
    }
});

function showMapBoxModalDirectly(item, inst) {
    if (!Session.get('showMap')) {
        Session.set('showMap', true);
    }
    Session.set('showLoadingSpinner', true);
    $('.fixed-action-btn').closeFAB();
    Session.set('selectedSubMenu', item);
    let itemName = item.name;
    inst.data.selectedMenuItemName.set(itemName);
    var subdomain = document.location.hostname.split('.');
    Logger.log({
        action: `${Meteor.settings.public.userAppActions.subMenuItemSelected} ${subdomain[0]} ${itemName}`
    });
    try {
        let siteSettings = Session.get('siteSettings');
        let suburb = siteSettings && siteSettings.suburb ? siteSettings.suburb : '';
        Meteor.call("bottomSheetModal.getMarkersForItem", item, suburb, subdomain, (error, markersArray) => {
            if (error) {
                console.log(":: error inside getMarkersForItem Meteor call.", error);
            } else {
                Session.set('singleMarker', false);
                Session.set('categsArray', markersArray);
            }
        });
    } catch (exception) {
        console.log(":: locate sensis exception - > ", exception);
    } finally {
        console.log("finally called.............")
    }
}
