import {
  MenuItemDev
} from '/imports/api/menu_item_dev/menu_item_dev.js';
import {dynamicCollections} from '/imports/startup/both/dynamic_collections.js';
import {getSubdomain, getCookie, getSubMenuList} from '/imports/startup/both/global_function.js';
import './fab.html';
import {MapData, mapCentre} from '../mapbox/mapbox.js';
import {atdwRequest} from '../bottomSheetModal/bottomSheetModal.js';
import {AdminSettings} from '/imports/api/admin_settings/admin_settings.js';

var activeZoom = null; //Just to make sure Location really changed.
var activeCenter = []; //Just to make sure the Active Center.
Template.fab.onCreated(function () {


  // console.log("Fab created======>");
  this.isLink = new ReactiveVar(null);
  require('./fab.css');

  Session.set('categsArray', []);
  this.lengthDatabase = new ReactiveVar(0);
  // console.log("initiate under fab");
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
  // console.log("assign map drag event")
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
      $('#overlay-box, #mainMenuList').css('display', 'none');


      // $("#mainMenuList").toggle();

      // console.log("overlay box ");

    }
  })
});
Template.fab.onRendered(function () {
  // console.log("fab is rendered");
  this.autorun(() => {
    let menuHandle = Meteor.subscribe('menu_item_dev.all', getSubdomain(getCookie("selectedSDForSA")));
    if (menuHandle.ready()) {
      if (getSubdomain(getCookie("selectedSDForSA"))) {
        // console.log("current subdomain====>",getSubdomain(getCookie("selectedSDForSA")));

        this.menus.set(dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_menu_item_dev'].find({
          "publishDetails": {
            $exists: true
          }
        }, {
          sort: {
            customIndex: 1
          }
        }).fetch());
      } else {
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
  this.autorun(() => {
    if (Session.get('categsArray') && Session.get('categsArray').length) {
      let totalResult = Session.get('numberOfResults');
      let dbResultData = Session.get('dbResultData') || 0;
      if (!Session.get('categsArray').length < totalResult + dbResultData.length)
        Session.set('showLoadingSpinner', false);
      this.lengthDatabase.set(Session.get('categsArray').length);
    }
  });
  this.autorun(() => {
    this.isLink.set((Session.get('itemUrl') == undefined || !Session.get('itemUrl')) ? true : false);
  });
});
Template.fab.helpers({

  isNotKioskUser() {
    return !Roles.userIsInRole(Meteor.userId(), ['kiosk'], 'kiosk');
  },
  isDomainGctourism() {
    let subDomain = getSubdomain(getCookie("selectedSDForSA"));
    if (subDomain === "gctourism") {
      return true;
    } else {
      return false;
    }
  },
  landingPageModal() {
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings'].findOne({subDomain: getCookie("selectedSDForSA")});
    } else {
      siteSetting = AdminSettings.findOne({subDomain: getCookie("selectedSDForSA")});
    }
    let colors = {
      "nameBackgroundColor": "#757575",
      "showMenusButtonColor": "#000",
      "menuTextColor": "#fff",
      "footerButtonTextColor": "#fff"
    };

    if (siteSetting && siteSetting.colors && siteSetting.colors.landingPageModal) {
      colors = {
        "nameBackgroundColor": `${siteSetting.colors.landingPageModal.nameBackgroundColor}` || "#757575",
        "showMenusButtonColor": `${siteSetting.colors.landingPageModal.showMenusButtonColor}` || "#000",
        "menuTextColor": `${siteSetting.colors.landingPageModal.menuTextColor}` || "#fff",
        "footerButtonTextColor": `${siteSetting.colors.landingPageModal.footerButtonTextColor}` || "#fff"
      }
    }


    return colors;
  },
  backgroundGray() {

    return !Roles.userIsInRole(Meteor.userId(), ['kiosk'], 'kiosk');

  },
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
    if (arr) {
      if (arr.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  },
  dynamicLangMenu(menuName) {
    let currentLang = Session.get('lang');
    return menuName[currentLang];
  },
});
Template.fab.events({
  'click .clicker'(event, inst) {
    event.preventDefault();
    $("div.modal-overlay").remove();
    //$('#overlay-box').css('display', 'none');
    /*$('.bottom-sheet').modal();*/
    //$('.load-items-wrapper').fadeOut();
    //$('.bottom-sheet').modal();
    const modalId = event.currentTarget.id;
    const modalName = event.currentTarget.getAttribute('data-name');
    var subdomain = document.location.hostname.split('.');

    if (modalName != null) {
      // console.log("event ===> " , event)
      // console.log("current target ===> " , event.currentTarget)

      // if (event.currentTarget.dataset != undefined && modalName != undefined){
      //     console.log("Modal name ==> " , modalName);
      //     console.log(modalName);
      // }

      // console.log(`yes this is ${Meteor.settings.public.userAppActions.mainMenuItemSelected} ${subdomain[0]} ${modalName}`);

      // Logger.log(
      //   {
      //     action: `${Meteor.settings.public.userAppActions.mainMenuItemSelected}`,
      //     subDomain: `${subdomain[0]}`,
      //     context: `${modalName}`
      //   });
      var usage_log = {
        action: `${Meteor.settings.public.userAppActions.mainMenuItemSelected}`,
        subDomain: `${subdomain[0]}`,
        context: `${modalName}`
      };

      Meteor.call('UsageLog.insert', usage_log, (error, result) => {
        if (error) {
          console.log('error usage_log', error);
          return;
        }
        console.log('success usage_log', result);
      });
    }


    let selectedMenu = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_menu_item_dev'].find({"_id": modalId}).fetch()[0];
    Session.set("selectedMenuContainsItems", selectedMenu.items && (selectedMenu.items.length > 0));
    Session.set("isEventMenuSelected", selectedMenu.isEvent);
    inst.data.selectedMenuId.set(modalId);
    Session.set('selectedMenuName', modalName);
    let menus = inst.menus.get();
    let menu = _.findWhere(menus, {
      _id: modalId
    });
    if (menu && menu.items && menu.items.length == 1 && (!Session.get("isEventMenuSelected"))) {
      /* Code to set base menu color for marker BG */


      // console.log("under if");
      if (menu) menu.items[0].baseMenuColor = menu.preference.color;
      {
        // console.log('menu.items[0]', menu.items[0])
        showMapBoxModalDirectly(menu.items[0], inst);
      }
    } else {
      // console.log("under else");
      $('#bottomSheetModalId').modal({
        complete: function () {

          let markersArray = Session.get('dbResultData');
          let modalClass = $('#bottomSheetModalId').attr('class');
          // console.log('modalClass', modalClass)
          let numberOfRecordsPerPage = parseInt(Session.get('numberOfRecordsPerPage'));
          let totalResult = Session.get('numberOfResults');
          let dbResultData = Session.get('dbResultData');
          // console.log('totalResult+dbResultData.length', dbResultData, 'dsdbskjd', inst.lengthDatabase.get());
          let atdwKey = Session.get('atdwKey');
          let baseUrl = Session.get('baseUrl');
          let ajaxSetting;
          if (totalResult && dbResultData) {

            Session.set('trueOrFalse', inst.lengthDatabase.get() < totalResult + dbResultData.length)
            // console.log('isTrue:::::::::::::',Session.get('trueOrFalse'))
            // console.log("itemURL:::::::==>", Session.get('itemUrl'))
          }
          let ItemUrl = Session.get('itemUrl') || '';
          let isEvent = ItemUrl.search(/menuType=event/i);
          if (modalClass === 'modal bottom-sheet bottom-nav' && !inst.isLink.get() && Session.get('trueOrFalse')) {
            if (isEvent === -1) {
              ajaxSetting = getLocationList(baseUrl, atdwKey, Session.get('itemUrl'), totalResult);

              if (!Session.get("noExternalDataLoad")) {
                // console.log("under noExternalDataload");
                Session.set('showLoadingSpinner', true);
                $.ajax(ajaxSetting).done(function (response) {
                  if ((totalResult && dbResultData) && (inst.lengthDatabase.get() < totalResult + dbResultData.length)) {
                    // console.log("under totalResult");
                    Session.set('showLoadingSpinner', true);
                    let product;
                    response.products.map((responceObject) => {
                      let allLatLong = responceObject.boundary;
                      let isMultiPoint = allLatLong.search('MULTIPOINT');
                      let locationBoundry = allLatLong;
                      if (isMultiPoint !== -1) {
                        let splitlongLat = allLatLong.split(',')[0].substring(11).replace(' ', ',').split(',');
                        locationBoundry = splitlongLat[1] + ',' + splitlongLat[0];
                      }

                      let longLat = locationBoundry.split(","); // Split Longitude and latitude
                      let dynamicLongitude = longLat[1]; // Latitude
                      let isDynamicLatiitude = longLat[0] // longituds
                      //console.log('dynamicLongitude', dynamicLatiitude)
                      let isInvalidLatitide = isDynamicLatiitude.substring(4, 50);
                      let dotIndex = isInvalidLatitide.lastIndexOf(".");
                      let dynamicLatiitude = isDynamicLatiitude.slice(0, dotIndex);

                      product = {
                        address: responceObject.addresses[0].address_line,
                        categories: responceObject.productCategoryId,
                        image2: responceObject.productImage,
                        isApproved: true,
                        latitude: dynamicLatiitude,
                        longitude: dynamicLongitude,
                        name: responceObject.productName,
                        text1: responceObject.productDescription,
                        from: responceObject.startDate,
                        //location_ref_id: '',
                        to: responceObject.endDate,
                        _id: responceObject.productId,
                        productId: responceObject.productId

                      };
                      markersArray.push(product);
                      Session.set('categsArray', markersArray);
                      Session.set('showLoadingSpinner', false);
                    })
                  }
                }).fail(function () {
                  showAlert('danger', 'Fail to load data Try Again');
                });
              }

              /*}*/
            } else {

              let today = new Date().toISOString().substring(0, 10);
              let twoWeeksDate = new Date(Date.now() + 12096e5).toISOString().substring(0, 10);
              let startDate = "start=" + today;
              let endDate = "end=" + twoWeeksDate;

              getEventList(baseUrl, atdwKey, Session.get('itemUrl'), totalResult, startDate, endDate);
              ajaxSetting = getLocationList(baseUrl, atdwKey, Session.get('itemUrl'), totalResult);
              // console.log("ajax setting");
              Session.set('showLoadingSpinner', true);
              // Restrict load external data in case of user clicked on direction button
              if (!Session.get("noExternalDataLoad")) {
                $.ajax(ajaxSetting).done(function (response) {
                  if ((totalResult && dbResultData) && (inst.lengthDatabase.get() < totalResult + dbResultData.length)) {
                    // console.log("dbResultData");
                    Session.set('showLoadingSpinner', true);
                    let product;
                    response.products.map((responceObject) => {
                      let allLatLong = responceObject.boundary;
                      let isMultiPoint = allLatLong.search('MULTIPOINT');
                      let locationBoundry = allLatLong;
                      if (isMultiPoint !== -1) {
                        let splitlongLat = allLatLong.split(',')[0].substring(11).replace(' ', ',').split(',');
                        locationBoundry = splitlongLat[1] + ',' + splitlongLat[0];
                      }

                      let longLat = locationBoundry.split(","); // Split Longitude and latitude
                      let dynamicLongitude = longLat[1]; // Latitude
                      let isDynamicLatiitude = longLat[0] // longituds
                      //console.log('dynamicLongitude', dynamicLatiitude)
                      let isInvalidLatitide = isDynamicLatiitude.substring(4, 50);
                      let dotIndex = isInvalidLatitide.lastIndexOf(".");
                      let dynamicLatiitude = isDynamicLatiitude.slice(0, dotIndex);

                      product = {
                        address: responceObject.addresses[0].address_line,
                        categories: responceObject.productCategoryId,
                        image2: responceObject.productImage,
                        isApproved: true,
                        latitude: dynamicLatiitude,
                        longitude: dynamicLongitude,
                        name: responceObject.productName,
                        text1: responceObject.productDescription,
                        from: responceObject.startDate,
                        //location_ref_id: '',
                        to: responceObject.endDate,
                        _id: responceObject.productId,
                        productId: responceObject.productId

                      };
                      markersArray.push(product);
                      Session.set('categsArray', markersArray);
                      Session.set('showLoadingSpinner', false);
                    })
                  }
                }).fail(function () {
                  showAlert('danger', 'Fail to load data Try Again');
                });
              }
            }
          }
        } //
      });
      $('#bottomSheetModalId').modal('open');
    }
    Session.set("currentMenu", modalId);
    $('.fixed-action-btn').closeFAB();
    $('#overlay-box, #mainMenuList').css('display', 'none');
    /*mapCentre();*/
  },
  'click #fabModal'(event) {

    // console.log("favmodal click");
    $("#MainMenues").show();
    event.preventDefault();
    if ($('#overlay-box').css('display') == "block") {
      $('#overlay-box, #mainMenuList').css('display', 'none');
    } else {
      $('#overlay-box, #mainMenuList').css('display', 'block');
    }
    if ($('div.fixed-action-btn').hasClass('active'))
      $('#overlay-box, #mainMenuList').css('display', 'none');
    var subdomain = document.location.hostname.split('.');

    // Logger.log({
    //     action: `${Meteor.settings.public.userAppActions.mainMenuOpened}`,
    //     subdomain: `${subdomain[0]}`
    //   },
    // );

    var usage_log = {
        action: `${Meteor.settings.public.userAppActions.mainMenuOpened}`,
        subDomain: `${subdomain[0]}`
      };
    Meteor.call('UsageLog.insert', usage_log, (error, result) => {
      if (error) {
        console.log('error usage_log', error);
        return;
      }
      console.log('success usage_log', result);
    });
    $('#markerDetailModal').modal();
    $("#markerDetailModal").modal('close');
    event.preventDefault();
  },
  'click #fabUserLocationBtn'(event) {
    event.preventDefault();

    let settings, mapObjCenter = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings']) {
      settings = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings'].findOne({subDomain: getCookie("selectedSDForSA")});
    } else {
      settings = AdminSettings.findOne({subDomain: getCookie("selectedSDForSA")});
    }
    if (settings && settings.geoFence && settings.geoFence.defaultCords && settings.geoFence.defaultCords.geometry && settings.geoFence.defaultCords.geometry.coordinates) {
      mapObjCenter = settings.geoFence.defaultCords.geometry.coordinates;
    }
    let deviceLocation = '';
    let deviceCords = undefined;
    if (Meteor.isCordova) {
      navigator.geolocation.getCurrentPosition(function (position) {
        deviceLocation = position;
      });
    } else {
      deviceLocation = Geolocation.currentLocation();
    }

    if (!deviceLocation || Meteor.settings.public.isLocal) {
      // deviceCords = [151.24128056575296, -33.8761822273128]; //sydney
      //mapCentre(deviceCords, isRefreshRequired);
      if (Meteor.user() && Roles.userIsInRole(Meteor.userId(), ['kiosk'], 'kiosk') && Meteor.user().profile.coordinates && Meteor.user().profile.coordinates.long !== '' && Meteor.user().profile.coordinates.lat !== '') {
        deviceCords = [parseFloat(Meteor.user().profile.coordinates.long), parseFloat(Meteor.user().profile.coordinates.lat)]
      } else {
        deviceCords = mapObjCenter || [151.24128056575296, -33.8761822273128];
        // console.log("::: ==> deviceCords 1 ==> ",deviceCords)
      }
    } else {
      if (Meteor.user() && Roles.userIsInRole(Meteor.userId(), ['kiosk'], 'kiosk') && Meteor.user().profile.coordinates && Meteor.user().profile.coordinates.long !== '' && Meteor.user().profile.coordinates.lat !== '') {
        deviceCords = [parseFloat(Meteor.user().profile.coordinates.long), parseFloat(Meteor.user().profile.coordinates.lat)]
      } else {
        deviceCords = [deviceLocation.coords.longitude, deviceLocation.coords.latitude];

        // For testing
        if (parseInt(deviceCords[0]) == 77 && parseInt(deviceCords[1]) == 28) {
          // console.log("::: ==> deviceCords 2 ==> ",deviceCords)
          // deviceCords = [151.24128056575296, -33.8761822273128]; //sydney
          deviceCords = mapObjCenter || [151.24128056575296, -33.8761822273128];
        }
      }
    }

    let map = MapData.getMapObj(),
      /*deviceLocation = Geolocation.currentLocation(),
      deviceCords = [151.24128056575296, -33.8761822273128]; //sydney
      if (deviceLocation && !Meteor.settings.public.isLocal) {
          deviceCords = [deviceLocation.coords.longitude, deviceLocation.coords.latitude];
      }*/
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
  'click .heading-list'(event, inst) {
    Session.set("isEventMenuSelected", false);
    $('#bottomSheetModalId').modal('open');
    if (Roles.userIsInRole(Meteor.userId(), ['kiosk'], 'kiosk')) {
      $("div.modal-overlay").remove();
    }
    Session.set("currentMenu", null);
  }
});

function showMapBoxModalDirectly(item, inst) {
  /*if (!Session.get('showMap')) {
      Session.set('showMap', true);
  }*/
  //alert('call')
  Session.set('pageNumber', 0);
  let itemUrl = '';
  if (item && item.externalResources && item.externalResources.atdw && item.externalResources.atdw.srcUrl)
    itemUrl = item.externalResources.atdw.srcUrl;

  Session.set('itemUrl', itemUrl);
  //Session.set('showLoadingSpinner', true);
  $('.fixed-action-btn').closeFAB();
  $('#overlay-box, #mainMenuList').css('display', 'none');
  Session.set('selectedSubMenu', item);
  let itemName = item.name;
  Session.set('item', item);
  inst.data.selectedMenuItemName.set(itemName);
  var subdomain = document.location.hostname.split('.');
  // Logger.log({
  //   action: `${Meteor.settings.public.userAppActions.subMenuItemSelected}`,
  //   subDomain: `${subdomain[0]}`,
  //   context: `${itemName}`
  // });

  var usage_log = {
    action: `${Meteor.settings.public.userAppActions.subMenuItemSelected}`,
    subDomain: `${subdomain[0]}`,
    context: `${itemName}`
  };
  Meteor.call('UsageLog.insert', usage_log, (error, result) => {
    if (error) {
      console.log('error usage_log', error);
      return;
    }
    console.log('success usage_log', result);
  });
  try {
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings'].findOne({subDomain: getCookie("selectedSDForSA")});
    } else {
      siteSetting = AdminSettings.findOne({subDomain: getCookie("selectedSDForSA")});
    }
    let suburb = siteSetting && siteSetting.suburb ? siteSetting.suburb : '';
    Meteor.call("bottomSheetModal.getMarkersForItem", item, suburb, getCookie("selectedSDForSA"), (error, markersArray) => {
      if (error) {
        // console.log(":: error inside getMarkersForItem Meteor call.", error);
      } else {
        //console.log('item:::::::', markersArray)
        if (item && item.externalResources && item.externalResources.atdw && item.externalResources.atdw.srcUrl) {
          itemUrl = item.externalResources.atdw.srcUrl;
          let eventsFound = itemUrl.search(/menuType=event/i);
          if (eventsFound !== -1) {
            let days = siteSetting.atdw.numberOfDaysForEvents || 10;
            $("#eventStartEndDate").modal();
            $("#eventFrom").val(new Date().toISOString().substring(0, 10));
            $("#eventTo").val(new Date(Date.now() + (86400000 * days)).toISOString().substring(0, 10));
            $("#eventStartEndDate").modal('open');
            Session.set('isModal', true);
            Session.set('showLoadingSpinner', false);
          } else {
            // Session.set('showLoadingSpinner', true);
            Session.set('isATDWRequest', true);
            Session.set('categsArray', markersArray);
            $('.load-items-wrapper').fadeIn();
            atdwRequest();

            //findData(item, inst, adminSettings, menu, itemUrl);
          }
          //Session.set('showLoadingSpinner', true);

          //}
        } else {
          // console.log('markersArraymarkersArray', markersArray)
          if (!Session.get('showMap')) {
            Session.set('showMap', true);
          }
          Session.set('categsArray', markersArray);
          /*if (true) {}
          console.log('here')*/
        }

        Session.set('singleMarker', false);

      }
    });
  } catch (exception) {
    // console.log(":: locate sensis exception - > ", exception);
  } finally {
    // console.log("finally called.............")
  }
}

function getLocationList(baseUrl, urlKey, srcUrl, numberOfRecordsPerPage) {
  // console.log('123456baseUrl', baseUrl, 'utlKey', urlKey, 'srcUrl', srcUrl)
  //let responceObject = `${baseUrl}/${srcUrl}&pge=1&size=${limit}&out=json&key=${urlKey}`;
  let settings = {
    "async": true,
    "crossDomain": true,
    "url": `${baseUrl}/${srcUrl}&pge=1&size=${numberOfRecordsPerPage}&out=json&key=${urlKey}`,
    "method": "GET",
    "headers": {
      "Cache-Control": "no-cache",
      "Postman-Token": "f826355c-01c7-e8a4-9770-eef82adb0486"
    }
  }
  // console.log('full url', `${baseUrl}/${srcUrl}&pge=1&size=${numberOfRecordsPerPage}&out=json&key=${urlKey}`)
  return settings;
}

function getEventList(baseUrl, urlKey, srcUrl, numberOfRecordsPerPage, startDate, endDate) {
  // console.log('123456baseUrl', baseUrl, 'utlKey', urlKey, 'srcUrl', srcUrl)
  let settings = {
    "async": true,
    "crossDomain": true,
    "url": `${baseUrl}/${srcUrl}&pge=1&size=${numberOfRecordsPerPage}&out=json&key=${urlKey}&${startDate}&${endDate}`,
    "method": "GET",
    "headers": {
      "Cache-Control": "no-cache",
      "Postman-Token": "f826355c-01c7-e8a4-9770-eef82adb0486"
    }
  }
  // console.log('full url', `${baseUrl}/${srcUrl}&pge=1&size=${numberOfRecordsPerPage}&out=json&key=${urlKey}&${startDate}&${endDate}`)
  return settings;
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