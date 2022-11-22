import './bottomSheetModal.html';
import {AdminSettings} from '/imports/api/admin_settings/admin_settings.js';

const {MenuItemDev} = require('/imports/api/menu_item_dev/menu_item_dev.js');
import {dynamicCollections} from '/imports/startup/both/dynamic_collections.js';
//import { getSubdomain } from '/imports/startup/both/global_function.js';
import {getSubdomain, getCookie, getSubMenuList} from '/imports/startup/both/global_function.js';
import {Random} from 'meteor/random';

const moment = require('moment');

/*let subMenuData = [{
        menuId: "abc",
        products: []
      },{*/
/*let subMenuData = {[
    menuId: 'ddsd',
    products: [2,3]
  ]}*/

/*let subMenuData = [];*/
let pageNumber = Session.get('pageNumber') || 0;
Template.bottomSheetModal.onCreated(function bottomSheetModalOnCreated() {


  // console.log("bottom sheet created=======>");

  const {ReactiveVar} = require('meteor/reactive-var');
  this.clients = new ReactiveVar(false);
  this.menus = new ReactiveVar(false);
  this.currentEvents = new ReactiveVar(false);
  this.fromDate = new ReactiveVar(null);
  this.toDate = new ReactiveVar(null);
  this.itemId = new ReactiveVar(null);
  this.markerLength = new ReactiveVar(undefined);
  Session.set('eventTypeMarkers', false);
  this.autorun(() => {
    let menuHandle = Meteor.subscribe('menu_item_dev.all', getSubdomain(getCookie("selectedSDForSA")));
    let menuName = Session.get('selectedMenuName');

    // console.log("autorun is running");

    // if (menuName === 'CURRENT EVENT') {
    if (Session.get("isEventMenuSelected")) {
      let siteSetting = {};
      if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings']) {
        siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings'].findOne({subDomain: getCookie("selectedSDForSA")});
      } else {
        siteSetting = AdminSettings.findOne({subDomain: getCookie("selectedSDForSA")});
      }
      if (siteSetting && siteSetting.rssFeed && siteSetting.rssFeedLive) {
        try {
          // Session.set('showLoadingSpinner', true);
          Meteor.call("bottomSheetModal.getRssFeedEvents", siteSetting, (error, eventList) => {
            // Session.set('showLoadingSpinner', false);
            if (error) {
              // console.log(":: error inside getMarkersForItem Meteor call.",error);
            } else {
              // Session.set('categsArray', eventList);
              // console.log("no error=====>");
              // console.log("eventlist ===> " , eventlist);

              this.currentEvents.set(eventList);
            }
          });
        } catch (exception) {
          // console.log( ":: current events fetch exception - > ",exception );
        } finally {
          // console.log(":: current events finally called");
        }
      } else {
        this.currentEvents.set(false);
      }
    } else {
      // console.log("current event is not selected");
      this.currentEvents.set(false);
    }
  });
});
Template.bottomSheetModal.onRendered(function () {
  $("div.modal-overlay").remove();

  this.autorun(() => {

    let numberOfResults = Session.get('numberOfResults') || 0;
    let markerLength = Session.get('markerLength') || 0;
    let self = this;
    let dbMarkerLength = self.markerLength.get() || 0;
    //let markerLength = Session.get('markerLength');

    /* if (Session.get('numberOfResults') === undefined) {

     }*/

    if (Session.get('trueOrFalse') === undefined) {
      Session.set('trueOrFalse', false);
    } else if (Session.get('trueOrFalse')) {
      $('.load-items-wrapper').fadeOut();
    }
    // console.log('true or false', Session.get('trueOrFalse'));
    //if (markerLength < (numberOfResults+dbMarkerLength) && Session.get('isRequestHit') && !Session.get('trueOrFalse')) {
    if (markerLength < (numberOfResults + dbMarkerLength) && Session.get('isRequestHit')) {
      $('.load-items-wrapper').fadeIn();
      Session.set('isATDWRequest', true)
    } else {
      Session.set('isATDWRequest', false);

    }
    if (!Session.get('trueOrFalse')) {
      document.getElementById("bottomSheetModalId").addEventListener("scroll", function () {
        let categoriesArray = Session.get('categsArray');
        let windowHeight = $(window).height();
        let liTagOffset = $(".collection.btm-listing li").last().offset() || 0;
        let itemheight = liTagOffset.top + 106;
        let className = $('#bottomSheetModalId').attr('class');
        if (className === 'modal bottom-sheet bottom-nav open') {
          if (itemheight <= windowHeight && Session.get('isRequestHit')) {
            atdwRequest();
          } else {
            // Session.set('isRequestHit', false);
          }
        }
      });
    }

    /*$('#bottomSheetModalId').scroll(function(){
     let categoriesArray = Session.get('categsArray');
     let windowHeight = $(window).height();
     let abc = $(".collection.btm-listing li").last().offset();
     let itemheight = abc.top+65;
       let className = $('#bottomSheetModalId').attr('class');
       if (className === 'modal bottom-sheet bottom-nav open') {
         if (itemheight <= windowHeight) {
           if (markerLength < (numberOfResults+dbMarkerLength)) {
            atdwRequest();
          } 
         }
       }
       });*/
    // } else {
    //  console.log('ttttttttttttttttttttttttttttttttttttttttttttttttttttttt')
    // }
  });
});

Template.bottomSheetModal.helpers({
  bottomSheetLocationList() {
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings'].findOne({subDomain: getCookie("selectedSDForSA")});
    } else {
      siteSetting = AdminSettings.findOne({subDomain: getCookie("selectedSDForSA")});
    }
    let colors = {
      "modalBackgroundColor": "#323232 !important",
      "modalBorderColor": "#fff solid 6px!important",
      "detailsButtonColor": "#43A047 !important",
      "directionButtonColor": "#1E88E5 !important",
      "callButtonColor": "#ef6c00 !important",
      "directionButtonTextColor": "#fff !important",
      "locationNameFontColor": "#fff !important",
      "locationInfoFontColor": "#b9b9b8 !important",
      "callButtonTextColor": "#fff !important",
      "detailsButtonTextColor": "#fff !important"
    };

    if (siteSetting && siteSetting.colors && siteSetting.colors.bottomSheetLocationList) {
      colors = {
        "modalBackgroundColor": `${siteSetting.colors.bottomSheetLocationList.modalBackgroundColor} !important` || "#323232 !important",
        "modalBorderColor": `${siteSetting.colors.bottomSheetLocationList.modalBorderColor} solid 6px!important` || "#fff solid 6px!important",
        "detailsButtonColor": `${siteSetting.colors.bottomSheetLocationList.detailsButtonColor} !important` || "#43A047 !important",
        "directionButtonColor": `${siteSetting.colors.bottomSheetLocationList.directionButtonColor} !important` || "#1E88E5 !important",
        "callButtonColor": `${siteSetting.colors.bottomSheetLocationList.callButtonColor} !important` || "#ef6c00 !important",
        "directionButtonTextColor": `${siteSetting.colors.bottomSheetLocationList.directionButtonTextColor} !important` || "#fff !important",
        "locationNameFontColor": `${siteSetting.colors.bottomSheetLocationList.locationNameFontColor} !important` || "#fff !important",
        "locationInfoFontColor": `${siteSetting.colors.bottomSheetLocationList.locationInfoFontColor} !important` || "#b9b9b8 !important",
        "callButtonTextColor": `${siteSetting.colors.bottomSheetLocationList.callButtonTextColor} !important` || "#fff !important",
        "detailsButtonTextColor": `${siteSetting.colors.bottomSheetLocationList.detailsButtonTextColor} !important` || "#fff !important"
      }
    }


    return colors;
  },
  bottomSheetSubMenu() {
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings'].findOne({subDomain: getCookie("selectedSDForSA")});
    } else {
      siteSetting = AdminSettings.findOne({subDomain: getCookie("selectedSDForSA")});
    }
    let colors = {
      "headerBackgroundColor": "#939597 !important",
      "listBackgroundColor": "#fafafa !important",
      "iconBoxColor": "#dbdcde !important",
      "headingFontColor": "#ffffff !important",
      "listFontColor": "#1c1c1c !important",
      "modalBackgroundColor": "#ffffff !important",
      "closeButtonBackgroundColor": "#888a8c !important",
      "closeButtonTextColor": "#c8cacc !important"
    };

    if (siteSetting && siteSetting.colors && siteSetting.colors.bottomSheetSubMenu) {
      colors = {
        "headerBackgroundColor": `${siteSetting.colors.bottomSheetSubMenu.headerBackgroundColor} !important` || "#939597 !important",
        "listBackgroundColor": `${siteSetting.colors.bottomSheetSubMenu.listBackgroundColor} !important` || "#fafafa !important",
        "iconBoxColor": `${siteSetting.colors.bottomSheetSubMenu.iconBoxColor} !important` || "#dbdcde !important",
        "headingFontColor": `${siteSetting.colors.bottomSheetSubMenu.headingFontColor} !important` || "#ffffff !important",
        "listFontColor": `${siteSetting.colors.bottomSheetSubMenu.listFontColor} !important` || "#1c1c1c !important",
        "modalBackgroundColor": `${siteSetting.colors.bottomSheetSubMenu.modalBackgroundColor} !important` || "#ffffff !important",
        "closeButtonBackgroundColor": `${siteSetting.colors.bottomSheetSubMenu.closeButtonBackgroundColor} !important` || "#888a8c !important",
        "closeButtonTextColor": `${siteSetting.colors.bottomSheetSubMenu.closeButtonTextColor} !important` || "#c8cacc !important"
      }
    }


    return colors;
  },
  currentClient() {
    return Session.get('currentClient');
  },

  selectedMenu() {
    var selectedMenuId = Template.instance().data && Template.instance().data.selectedMenuId ? Template.instance().data.selectedMenuId.get() : undefined
    if (selectedMenuId) {

      var selectedMenuData = {};
      if (getSubdomain(getCookie("selectedSDForSA"))) {

        selectedMenuData = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_menu_item_dev'].findOne({
          "_id": selectedMenuId,
          "publishDetails": {$exists: true}
        });
      } else {
        selectedMenuData = MenuItemDev.findOne({"_id": selectedMenuId, "publishDetails": {$exists: true}});
      }
      var items = selectedMenuData.items || [];
      items = _.sortBy(items, 'customIndex');
      selectedMenuData['items'] = items;
      Template.instance().menus.set(selectedMenuData);
      if (selectedMenuData.items.length == 1 && (!Session.get("isEventMenuSelected"))) {
        Session.set("currentMenu", null);
      }
      return selectedMenuData;
    } else {

      return {};
    }
  },

  menuId() {
    return Session.get("currentMenu");
  },

  isPublish(itemId) {
    var menu = Template.instance().menus.get()
    // var menu = _.findWhere(menus, {_id: menuId});
    var lastPublishDetail = menu && menu.publishDetails && menu.publishDetails.length > 0 ? _.last(menu.publishDetails) : undefined;
    var itemIds = lastPublishDetail ? lastPublishDetail.itemsIds : [];
    return _.contains(itemIds, itemId);
  },

  getMenuItemIcon(preference) {

    if (preference && preference.icon) {
      return preference.icon;
    }
    return 'city-15'
  },

  getMenuItemColor(preference) {

    if (preference && preference.colors) {
      return preference.colors;
    }
  },
  getBaseMenuColor(preference) {

    if (preference && preference.color) {
      return preference.color;
    }
  },
  checkItems(items) {
    if (items && items.length > 0)
      return true;

    return false;
  },
  getFooterImage() {

    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings'].findOne({subDomain: getCookie("selectedSDForSA")});
    } else {
      siteSetting = AdminSettings.findOne({subDomain: getCookie("selectedSDForSA")});
    }
    let branding = siteSetting && siteSetting.branding ? siteSetting.branding : {};
    if (branding.sidelogo)
      return branding.sidelogo;

    else if (branding.mainImage)
      return branding.mainImage;

    return false;

  },

  isEventsMenu() {
    return Session.get("isEventMenuSelected") && Session.get("selectedMenuContainsItems");
  },

  eventsDate() {
    let adminSettings = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings']) {
      adminSettings = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings'].findOne({subDomain: getCookie("selectedSDForSA")});
    } else {
      adminSettings = AdminSettings.findOne({subDomain: getCookie("selectedSDForSA")});
    }
    let dates = {}, days = adminSettings.atdw.numberOfDaysForEvents || 10;
    dates.from = new Date().toISOString().substring(0, 10);
    dates.to = new Date(Date.now() + (86400000 * days)).toISOString().substring(0, 10);

    return dates;
  },

  currentEvents() {
    let inst = Template.instance();
    return inst.currentEvents.get();
  },

  markers() {
    let markers = Session.get('markers');
    let sortedArray = _.sortBy(markers, 'markerName');
    return sortedArray;
  },

  currentMenu() {
    return Session.get("currentMenu");
  },

  getBeginDate() {
    const beginEndDate = Session.get('selectedSubMenu');
    const beginDate = beginEndDate.begin;
    return moment(beginDate).format('MMMM Do YYYY, h:mm:ss a');
  },

  getEndDate() {
    const beginEndDate = Session.get('selectedSubMenu');
    const endDate = beginEndDate.end;
    return moment(endDate).format('MMMM Do YYYY, h:mm:ss a');
  },

  isPhone() {
    let adminSettings = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings'].find({subDomain: getCookie("selectedSDForSA")}).fetch();
    let settings = adminSettings[0];
    if (settings && settings.displaySettings) {
      // console.log('settings.displaySettings.callButtonOnLocationListModal', settings.displaySettings.callButtonOnLocationListModal)
      return settings.displaySettings.callButtonOnLocationListModal;
    } else {
      return true;
    }
  },
  isKioskUser() {
    return !Roles.userIsInRole(Meteor.userId(), ['kiosk'], 'kiosk');
  },
  dynamicLangMenu(menuName) {
    let currentLang = Session.get('lang');
    return menuName[currentLang];
  },
  dynamicLangMenuRss(menuName) {
    let currentLang = Session.get('lang');
    return menuName[currentLang];
  },
  isEventTypeMarkers() {
    if (Session.get('eventTypeMarkers'))
      return true
  },
  subCategoryHeader() {
    return Session.get('subCategoryHeader');
  },
});

Template.bottomSheetModal.events({
  'click .locate'(event, inst) {
    // console.log("menu is selected");
    event.preventDefault();
    Session.set('eventTypeMarkers', false);
    if (Session.get("isEventMenuSelected")) {
      if (!$('#eventTo').val() && !$('#eventTo').val()) {
        Materialize.toast('Please fill Start & End dates!!!', 2000, 'error-popup-small');
        return false;
      }
    }
    Session.set("noExternalDataLoad", false);
    Session.set('showLoadingSpinner', true);
    Session.set('pageNumber', 0)
    $('.load-items-wrapper').fadeOut();
    //Session.set('isATDWRequest', false);

    $('.fixed-action-btn').closeFAB();
    let itemId = $(event.target).attr('id');
    let adminSettings = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings'].find({
      subDomain: getCookie("selectedSDForSA")
    }).fetch();

    var menu = inst.menus.get();
    var items = menu && menu.items && menu.items.length > 0 ? menu.items : [];
    let item = _.findWhere(items, {
      _id: itemId
    });

    Session.set('item', item)
    inst.itemId.set(item);
    let itemUrl = '';
    if (item && item.externalResources && item.externalResources.atdw && item.externalResources.atdw.srcUrl) {
      Session.set('isRequestHit', true);
      itemUrl = item.externalResources.atdw.srcUrl;

      if (Session.get("isEventMenuSelected")) {
        let eventFrom = $('#eventFrom').val();
        let toDate = $('#eventTo').val();
        let eventURL = '';
        if (eventFrom && toDate) {
          itemUrl = `${itemUrl}&start=${eventFrom}&end=${toDate}`;
        } else if (eventFrom || toDate) {
          if (eventFrom) {
            itemUrl = `${itemUrl}&start=${eventFrom}`;
          } else {
            itemUrl = `${itemUrl}&start=${toDate}`;
          }
        } else {
          itemUrl = itemUrl;
        }
        findData(item, inst, adminSettings, menu, itemUrl);
      } else {
        findData(item, inst, adminSettings, menu, itemUrl);
      }
      // let eventsFound = itemUrl.search(/menuType=event/i);
      /*if (eventsFound !== -1) {
        let days = adminSettings[0].atdw.numberOfDaysForEvents || 10;
        $("#eventStartEndDate").modal();
        $("#eventFrom").val(new Date().toISOString().substring(0, 10));
        $("#eventTo").val(new Date(Date.now() + (86400000 * days)).toISOString().substring(0, 10));
        $("#eventStartEndDate").modal('open');
        Session.set('isModal', true);
        Session.set('showLoadingSpinner', false);
      } else {
        Session.set('showLoadingSpinner', true);
        findData(item, inst, adminSettings, menu, itemUrl);
      }*/
    } else {
      findData(item, inst, adminSettings, menu, itemUrl);
    }
    /*Session.set('itemId', item);
    Session.set('adminSettings', adminSettings);
    Session.set('menu', menu);*/
    Session.set('itemUrl', itemUrl);
    Session.set("isEventMenuSelected", false);

    var subCategoryHeader = {
      title: event.currentTarget.dataset.title,
      icon: event.currentTarget.dataset.icon,
      color: event.currentTarget.dataset.color,
    };
    console.log('event', event);
    console.log('inst', subCategoryHeader);
    Session.set('subCategoryHeader', subCategoryHeader);
  },

  'change #eventFrom'(event, inst) {
    $("#eventTo").val(null);
    let endDate = new Date($("#eventFrom").val());
    var $input = $('#eventTo').pickadate({
      format: 'yyyy-mm-dd',
      container: 'body',
      closeOnSelect: false // Close upon selecting a date,
    });
    var picker = $input.pickadate('picker');
    picker.set({
      min: endDate
    });
  },

  /*'submit #eventStartEndDateForm' (event, inst) {
    event.preventDefault();
    if(!$('#eventTo').val())
      return false;
    Session.set('showLoadingSpinner', true);
      let adminSettings = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings'].find({
         subDomain: getCookie("selectedSDForSA")
      }).fetch();
      var menu = inst.menus.get();
      let itemId = inst.itemId.get();
      let eventFrom = $('#eventFrom').val();
      let toDate = $('#eventTo').val();
      let item = Session.get('item');
      let itemUrl;
      let startingdate;
     if (item && item.externalResources && item.externalResources.atdw && item.externalResources.atdw.srcUrl) {
        itemUrl = item.externalResources.atdw.srcUrl;
       
       if (eventFrom && toDate) {
          startingdate = `${itemUrl}&start=${eventFrom}&end=${toDate}`;
       } else if (eventFrom || toDate) {
        if (eventFrom) {
         startingdate = `${itemUrl}&start=${eventFrom}`;
        } else {
          startingdate = `${itemUrl}&start=${toDate}`;
        }
       } else {
          startingdate = itemUrl;
       }
     }
      Session.set('isModal', false);
      findData(item, inst, adminSettings, menu, startingdate);
      $("#eventStartEndDate").modal('close');
   },*/

  'click .locate-event'(event, inst) {

    // console.log("calling locate-event");

    if (!Session.get('showMap')) {
      Session.set('showMap', true);
    }
    $('.fixed-action-btn').closeFAB();
    Session.set('eventTypeMarkers', true);
    let title = event.currentTarget.dataset.title;
    let item = _.findWhere(inst.currentEvents.get(), {title: title});
    let newItemObj = {};

    /* Code to set base menu color for marker BG */
    let menu = inst.menus.get();
    // if(menu)
    //   item.baseMenuColor = menu.preference.color;

    /* This code to set base manu color and icon */
    if (menu && menu.preference.color && menu.preference.icon) {
      newItemObj.baseMenuColor = menu.preference.color;
      newItemObj.parentMenuIcon = menu.preference.icon;
    }

    newItemObj.markerFor = 'CurrentEvent';
    newItemObj._id = Random.id();
    newItemObj.isApproved = true;

    if (item && item.title) {
      newItemObj.name = item.title;
    }
    if (item && item.address) {
      newItemObj.address = item.address;
    }
    if (item && item.link) {
      newItemObj.website = item.link;
    }
    if (item && item.phone) {
      newItemObj.phone = item.phone;
    }
    if (item && item.image && item.image.url) {
      newItemObj.image1 = item.image.url;
    }
    if (item && item.description) {
      newItemObj.details1 = item.description;
    }
    if (item && item.location && item.location.lat) {
      newItemObj.latitude = item.location.lat;
    }
    if (item && item.location && item.location.lng) {
      newItemObj.longitude = item.location.lng;
    }
    if (item && item.begin) {
      newItemObj.from = new Date(item.begin);
    }
    if (item && item.end) {
      newItemObj.to = new Date(item.end);
    }


    // Find and insert item from currentEvents in here
    Session.set('selectedSubMenu', item);

    let itemName = item.name;
    Session.set('menuItemSelected', itemName);
    inst.data.selectedMenuItemName.set(itemName);

    var subdomain = document.location.hostname.split('.');

    // console.log("subdomain ===> " , subdomain);

    // Logger.log({
    //   action: `${Meteor.settings.public.userAppActions.subMenuItemSelected}`,
    //   subdomain: `${subdomain[0]}`,
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

    // console.log("Logging ====> ${Meteor.settings.public.userAppActions.subMenuItemSelected}");


    // form a new object similiar to the one required in markers array
    // $('.modal.bottom-sheet').modal('close');

    Session.set('categsArray', [newItemObj]);
    Session.set("currentMenu", null);
    Session.set('singleMarker', false);
    Session.set("isEventMenuSelected", false);

    var subCategoryHeader = {
      title: event.currentTarget.dataset.title,
      icon: event.currentTarget.dataset.icon,
      color: event.currentTarget.dataset.color,
    };
    console.log('subCategoryHeader', subCategoryHeader);
    Session.set('subCategoryHeader', subCategoryHeader);
  },

  'click #eventFrom'(event, inst) {
    $('#eventFrom').pickadate({
      min: [Date],
      container: 'body',
      format: 'yyyy-mm-dd',
      closeOnSelect: false // Close upon selecting a date,
    }).pickadate('picker').get('select');

  },

  'click #eventTo'(event, inst) {
    $('#eventTo').pickadate({
      min: [Date],
      container: 'body',
      format: 'yyyy-mm-dd',
      closeOnSelect: false // Close upon selecting a date,
    }).pickadate('picker').get('select');
  },
  'click #loc'(event) {
    let startingDate = $('#eventTo').val();
    let enddate = $('#eventFrom').val();
  },
  'click .mapboxgl-canvas'(event) {
    Template.mapbox.__eventMaps[0]["click .mapboxgl-canvas"].call({
      templateInstance: function () {
      }
    }, event);
  },
  'click .marker'(event) {
    Template.mapbox.__eventMaps[0]["click .marker"].call({
      templateInstance: function () {
      }
    }, event);
  },
  'click .marker-edit-icon'(event, inst) {
    Template.mapbox.__eventMaps[0]["click .marker-edit-icon"].call({
      templateInstance: function () {
      }
    }, event);
  },
  'click .more-info'(event, inst) {
    Template.mapbox.__eventMaps[0]["click .more-info"].call({
      templateInstance: function () {
        return Template.mapbox
      }
    }, event);
  },
  'click .directions'(event, inst) {
    Template.mapbox.__eventMaps[0]["click .directions"].call({
      templateInstance: function () {
        return Template.mapbox
      }
    }, event, inst);
    Session.set("noExternalDataLoad", true);
    $('#bottomSheetModalId').modal('close');
  },
  'click .call'(event, inst) {
    Template.mapbox.__eventMaps[0]["click .call"].call({
      templateInstance: function () {
      }
    }, event);
  },
  'click .custom-close'(event, inst) {
    Session.set('subCategoryHeader', false);
  }
});

function fetchRssFeedEvents() {
  try {
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings'].findOne({subDomain: getCookie("selectedSDForSA")});
    } else {
      siteSetting = AdminSettings.findOne({subDomain: getCookie("selectedSDForSA")});
    }
    console.log(`======THIS IS SITE SETTINGS ${siteSetting} =======>`);

    Meteor.call("bottomSheetModal.getRssFeedEvents", siteSetting, (error, markersArray) => {
      if (error) {
        // console.log(":: error inside getMarkersForItem Meteor call.",error);
      } else {
        // Session.set('categsArray', markersArray);
      }
    });
  } catch (exception) {
    // console.log( ":: current events fetch exception - > ",exception );
  } finally {
    // console.log(":: current events finally called");
  }
}


function findData(item, inst, adminSettings, menu, itemUrl) {

  // console.log("calling findData method");

  // console.log("language selected ====> " , Session.get("lang"));  

  if (menu)
    item.baseMenuColor = menu.preference.color;
  let curr_lang = Session.get('lang');
  Session.set('selectedSubMenu', item);
  let itemName = item.name[curr_lang];
  Session.set('menuItemSelected', itemName);
  inst.data.selectedMenuItemName.set(itemName);
  var subdomain = document.location.hostname.split('.');
  // Logger.log(
  //   {
  //     action: `${Meteor.settings.public.userAppActions.subMenuItemSelected}`,
  //     subdomain: `${subdomain}`,
  //     context: `${itemName}`
  //   }
  // );
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
    var subdomain = document.location.hostname.split('.');
    // console.log("calling bottomSheetModal.getMarkersForItem");

    // const nameHere = await new Promise((resolve , reject) => 

    Meteor.call("bottomSheetModal.getMarkersForItem", item, suburb, getSubdomain(getCookie("selectedSDForSA")), (error, markersArray) => {
      if (error) {
        // console.log(":: error inside getMarkersForItem Meteor callaaaaaaaaaaa.", error);
      } else {

        // console.log("ok bottomSheetModal.getMarkersForItem");
        // Setting bottom sheet modal location data
        Session.set('dbResultData', markersArray);
        //Session.set('dbMarker', markersArray);
        inst.markerLength.set(markersArray.length)
        Session.set('categsArray', markersArray)
        if (adminSettings[0] && adminSettings[0].atdw && adminSettings[0].atdw.baseUrl && adminSettings[0].atdw.key && item && item.externalResources && item.externalResources.atdw && itemUrl) {
          Session.set('isATDWRequest', true);
          $('.load-items-wrapper').fadeIn();
          Session.set('itemUrl', itemUrl);
          atdwRequest();
          //Session.set('showLoadingSpinner', false);
        } else {

          if (!Session.get('showMap')) {
            Session.set('showMap', true);
          }
          Session.set('showLoadingSpinner', false);

        }
        Session.set("currentMenu", null);
      }
    })
    // );
  } catch (exception) {
    // console.log(":: locate sensis exception - > ", exception);
  } finally {
    // $('#autocomplete-input').val(category)
    // console.log("finally called.............")
    Session.set('singleMarker', false);
    if (item.custom_locations.length === 0) {
      $('.modal.bottom-sheet').modal('close');
    }
    /*$('.modal.bottom-sheet').modal('close');*/
  }
}

export function atdwRequest() {
  if (Session.get('isATDWRequest')) {
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_admin_settings'].findOne({subDomain: getCookie("selectedSDForSA")});
    } else {
      siteSetting = AdminSettings.findOne({subDomain: getCookie("selectedSDForSA")});
    }
    let markersArray = Session.get('categsArray');
    let pageNumber = Session.get('pageNumber');
    let numberOfRecordsPerPage = siteSetting.atdw && siteSetting.atdw.numberOfRecordsPerPage ? siteSetting.atdw.numberOfRecordsPerPage : 20;
    pageNumber++;
    //console.log('pageNumber::::', pageNumber)
    Session.set('pageNumber', pageNumber);
    Session.set('isRequestHit', false);
    //Session.set('showLoadingSpinner', true);
    Session.set('baseUrl', siteSetting.atdw.baseUrl);
    Session.set('atdwKey', siteSetting.atdw.key);
    let ajaxSetting = getSubMenuList(siteSetting.atdw.baseUrl, siteSetting.atdw.key, Session.get('itemUrl'), pageNumber, numberOfRecordsPerPage); // 
    $.ajax(ajaxSetting).done(function (response) {
      Session.set('showLoadingSpinner', true);
      Session.set('numberOfResults', response.numberOfResults);
      //console.log('typeOff::', response.numberOfResults)
      response.products.map((responceObject) => {
        Session.set('showLoadingSpinner', true);
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
        // Push the dynamic value in array
        //console.log('responceObject::::::', responceObject)
        const product = {
          address: `${responceObject.addresses[0].address_line}, ${responceObject.addresses[0].city}`,
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
      })
      Session.set('numberOfRecordsPerPage', numberOfRecordsPerPage);
      Session.set('categsArray', markersArray);
      /*Session.set('showLoadingSpinner', false);*/
      if (Session.get('categsArray') !== undefined) {
        Session.set('markerLength', Session.get('categsArray').length)
      }
      // $('.load-items-wrapper').css('display', 'none');       
      $('.load-items-wrapper').fadeOut();
      Session.set('isRequestHit', true);

    }).fail(function () {
      showAlert('danger', 'Fail to load data Try Again');
    });
    ;
    //Session.set('showLoadingSpinner', false);
    if (!Session.get('showMap')) {
      Session.set('showMap', true);
    }
  }
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