import './admin.html';
import './iconModal.js';
import {TAPi18n} from 'meteor/tap:i18n';

import {dynamicCollections} from '/imports/startup/both/dynamic_collections.js';

import {
  MenuItemDev
} from '/imports/api/menu_item_dev/menu_item_dev.js';
import {
  EventDev
} from '/imports/api/event_dev/event_dev.js';
import {
  LocationDev
} from '/imports/api/location_dev/location_dev.js';
import {AdminSettings} from '/imports/api/admin_settings/admin_settings.js';
import {Subdomain} from '/imports/api/subdomain/subdomain.js';
import {getSubdomain, setCookie, getCookie, deleteAllCookies} from '/imports/startup/both/global_function.js';
import '../../components/categoriesList/categoriesList.js';
import '/imports/ui/pages/eventForm/eventForm.js';
import './editMenuItemModal.js';
// import './settings.js';
const Sortable = require('sortablejs');
import '/imports/ui/pages/locationForm/locationForm.js';

Template.admin.onCreated(function () {
  require('./menuItemModal.css');
  // await import('./iconModal.js');
  this.subscribe("subdomain.all");
  Session.set('isHide', true);
  this.menus = new ReactiveVar(false);
  this.draggedId = new ReactiveVar(false);
  this.editMenu = new ReactiveVar(false);
  this.client = new ReactiveVar(false);
  this.menuSelected = new ReactiveVar(false);
  this.categIds = new ReactiveVar([]);
  this.categoryNames = new ReactiveVar(false);
  this.events = new ReactiveVar(false);
  this.customLocations = new ReactiveVar(false);
  this.viewEvent = new ReactiveVar(false);
  this.eventId = new ReactiveVar(false);
  this.viewCustomLocation = new ReactiveVar(false);
  this.customLocationId = new ReactiveVar(false);
  this.editItemId = new ReactiveVar(false);
  this.editItemMenuId = new ReactiveVar(false);
  this.loadTemplate = new ReactiveVar(false);
  this.showLocationModal = new ReactiveVar(false);
  this.showSubdomainPage = new ReactiveVar(false);
  this.showReportPage = new ReactiveVar(false);
  this.subDomainList = new ReactiveVar(false);
  this.showUsersListPage = new ReactiveVar(false);
  this.showAdvertisementPage = new ReactiveVar(false);
  this.selectedDomain = new ReactiveVar(getCookie("selectedSDForSA"));
  Session.set('selectedIcon', false);
  Session.set('showLoading', false);
  $('.modal').modal();
  Session.setDefault('menuItemSelected', false);
  const categIdArray = this.categIds.get();

  /* Settings default center & zoom for maps */
  Session.set('defaultCords', [151.2453195148433, -33.8756055719675]); // DoubleBay Longitude, Latitude
  Session.set('defaultZoomLevel', 9);
  //getting subdomain specific center & zoom values
  Meteor.call('AdminSettings.details', getCookie("selectedSDForSA"), (error, details) => {
    if (error)
      console.log(":: Mehod call- AdminSettings.details ", error);
    else {
      if (details && details.geoFence) {

        if (details.geoFence.defaultCords && details.geoFence.defaultCords.geometry) {
          Session.set('defaultCords', details.geoFence.defaultCords.geometry.coordinates)
        }

        if (details.geoFence) {
          Session.set('defaultZoomLevel', details.geoFence.zoomLevel)
        }
      }
    }
  });

  this.autorun(() => {
    // const subDomainHandle =  Meteor.subscribe('subdomain.all');
    var self = this;
    if (!getCookie("selectedSDForSA")) {
      this.client.set("doublebay");
      if (getSubdomain()) {
        setCookie("selectedSDForSA", getSubdomain(), 30);
        this.selectedDomain.set(getSubdomain());
      }
    } else {
      // console.log("subdomain is selected");
      this.client.set(getCookie("selectedSDForSA"));
    }
    if (Roles.userIsInRole(Meteor.userId(), ['admin'], 'admin')) {

      console.log('Before adminSubdomain', getCookie('adminSubdomain'));
      if (getCookie('adminSubdomain')) {
        self.client.set(getCookie('adminSubdomain'))
        setCookie("selectedSDForSA", getCookie('adminSubdomain'));
      } else if (Array.isArray(Meteor.users.findOne({_id:Meteor.userId()}).profile.subdomainName)) {
        self.client.set(Meteor.users.findOne({_id:Meteor.userId()}).profile.subdomainName[0]);
        setCookie("adminSubdomain", Meteor.users.findOne({_id:Meteor.userId()}).profile.subdomainName[0], 30);
        setCookie("selectedSDForSA", Meteor.users.findOne({_id:Meteor.userId()}).profile.subdomainName[0]);
      } else {
        setCookie("adminSubdomain", getSubdomain());
      }
    }
    console.log('After adminSubdomain', getCookie('adminSubdomain'));

    if (this.subscriptionsReady()) {
      this.subDomainList.set(Subdomain.find().fetch());
      Meteor.setTimeout(() => {
        $('select').material_select();

      }, 500);
    }

    var  menuHandle;
    if (Array.isArray(Meteor.users.findOne({_id:Meteor.userId()}).profile.subdomainName)) {
      menuHandle = Meteor.subscribe('menu_item_dev.all', getCookie('adminSubdomain'));
    } else {
      menuHandle = Meteor.subscribe('menu_item_dev.all', self.selectedDomain.get());
    }
    if (menuHandle.ready()) {
      console.log('self.selectedDomain.get()', self.selectedDomain.get());
      console.log('getSubdomain(self.selectedDomain.get())', getSubdomain(self.selectedDomain.get()));
      if (getSubdomain(self.selectedDomain.get()) && dynamicCollections[getSubdomain(self.selectedDomain.get()) + '_menu_item_dev']) {
        console.log('singleSetting', dynamicCollections[getSubdomain(self.selectedDomain.get()) + '_menu_item_dev']);
        this.menus.set(dynamicCollections[getSubdomain(self.selectedDomain.get()) + '_menu_item_dev'].find({}, {
          sort: {
            customIndex: 1
          }
        }).fetch());
      } else if (Array.isArray(Meteor.users.findOne({_id:Meteor.userId()}).profile.subdomainName) && dynamicCollections[getCookie('adminSubdomain') + '_menu_item_dev']) {
        this.menus.set(dynamicCollections[getCookie('adminSubdomain') + '_menu_item_dev'].find({}, {
          sort: {
            customIndex: 1
          }
        }).fetch());
        console.log('cookie', getCookie('adminSubdomain'));
        console.log('getSubdomain',getSubdomain(getCookie('adminSubdomain')));
      } else {
        this.menus.set(MenuItemDev.find({}, {
          sort: {
            customIndex: 1
          }
        }).fetch());
      }
      const categsData = this.menus.get().map((menu) => {
        categIdArray.push(_.pluck(menu.items, 'sensis_categories'));
        return _.flatten(categIdArray);
      });
      this.categIds.set(_.uniq(_.flatten(categsData)));
    }
  });
  this.autorun(() => {
    var self = this;
    // this.client.set(Roles.getRolesForUser(Meteor.user()));
    var  eventHandle;
    if (Array.isArray(Meteor.users.findOne({_id:Meteor.userId()}).profile.subdomainName)) {
      eventHandle = Meteor.subscribe('event_dev.all', getCookie('adminSubdomain'));
    } else {
      eventHandle = Meteor.subscribe('event_dev.all', self.selectedDomain.get());
    }

    var  locationDevHandle;
    if (Array.isArray(Meteor.users.findOne({_id:Meteor.userId()}).profile.subdomainName)) {
      locationDevHandle = Meteor.subscribe('location_dev.all', getCookie('adminSubdomain'));
    } else {
      locationDevHandle = Meteor.subscribe('location_dev.all', self.selectedDomain.get());
    }

    // const eventHandle = Meteor.subscribe('event_dev.all', self.selectedDomain.get());
    // let locationDevHandle = Meteor.subscribe('location_dev.all', self.selectedDomain.get());
    if (eventHandle.ready()) {
      if (getSubdomain(self.selectedDomain.get()) && dynamicCollections[getSubdomain(self.selectedDomain.get()) + '_event_dev']) {
        this.events.set(dynamicCollections[getSubdomain(self.selectedDomain.get()) + '_event_dev'].find().fetch());
      } else if (Array.isArray(Meteor.users.findOne({_id:Meteor.userId()}).profile.subdomainName) && dynamicCollections[getCookie('adminSubdomain') + '_event_dev']) {
        this.events.set(dynamicCollections[getCookie('adminSubdomain') + '_event_dev'].find().fetch());
      } else {
        this.events.set(EventDev.find().fetch());
      }
    }
    if (locationDevHandle.ready()) {
      if (getSubdomain(self.selectedDomain.get()) && dynamicCollections[getSubdomain(self.selectedDomain.get()) + '_location_dev']) {
        this.customLocations.set(dynamicCollections[getSubdomain(self.selectedDomain.get()) + '_location_dev'].find().fetch());
      } else if (Array.isArray(Meteor.users.findOne({_id:Meteor.userId()}).profile.subdomainName) && dynamicCollections[getCookie('adminSubdomain') + '_location_dev']) {
        this.events.set(dynamicCollections[getCookie('adminSubdomain') + '_location_dev'].find().fetch());
      } else {
        this.customLocations.set(LocationDev.find().fetch());
      }
    }

    var  adminSettinghandle;
    if (Array.isArray(Meteor.users.findOne({_id:Meteor.userId()}).profile.subdomainName)) {
      adminSettinghandle = Meteor.subscribe('admin_settings.all', getCookie('adminSubdomain'));
    } else {
      adminSettinghandle = Meteor.subscribe('admin_settings.all', self.selectedDomain.get());
    }

    // const adminSettinghandle = Meteor.subscribe('admin_settings.all', self.selectedDomain.get());
    if (adminSettinghandle.ready()) {
      let adminSetting = {};
      if (getSubdomain(self.selectedDomain.get()) && dynamicCollections[getSubdomain(self.selectedDomain.get()) + '_admin_settings']) {
        adminSetting = dynamicCollections[getSubdomain(self.selectedDomain.get()) + '_admin_settings'].findOne({
          userId: Meteor.userId()
        });
      } else if (Array.isArray(Meteor.users.findOne({_id:Meteor.userId()}).profile.subdomainName) && dynamicCollections[getCookie('adminSubdomain') + '_admin_settings']) {
        adminSetting = dynamicCollections[getCookie('adminSubdomain') + '_admin_settings'].findOne({
          userId: Meteor.userId()
        });
      } else {
        adminSetting = AdminSettings.findOne({
          userId: Meteor.userId()
        });
      }
      Session.set('siteSettings', adminSetting);
    }
  });
});
Template.admin.onRendered(function () {
  var showMenuId = Session.get('lang');
  Session.set('langSubmenuEdit', 'en');
  $(".allLanguageMenu").hide();
  $("#" + showMenuId).show();
  const template = Template.instance();
  // Initialize materialize js components
  $('.modal').modal();
  $('.button-collapse').sideNav();
  $('select').material_select();
  $('.collapsible').collapsible();
  // Hide categories on reload and show "select menu..." message, needs to wait a little
  Meteor.setTimeout(() => {
    template.menuSelected.set(false);
    Session.set('isHide', true);
  }, 1);
  Tracker.autorun(() => {
    template.editMenu.get();
    Materialize.updateTextFields();
    if (FlowRouter.getParam('menuItem')) {
      template.showLocationModal.set(false);
      template.showSubdomainPage.set(false);
      template.showReportPage.set(false);
      template.showAdvertisementPage.set(false);
      Session.set('isHide', false);
      template.menuSelected.set(true);
    }
  });
  Tracker.autorun(() => {
    if (template.categIds.get()) {
      let categIds = _.compact(template.categIds.get());
      categIds = _.map(categIds, function (id) {
        return Number(id);
      });
      Meteor.call('categories.getName', categIds, template.selectedDomain.get(), (error, result) => {
        if (error) {
          // console.log('error', error);
        }
        template.categoryNames.set(result);
      });
    }
  });
  Meteor.setTimeout(() => {
    $('#newMenu').modal({
      ready: (modal, trigger) => {
        // Session.set('selectedIcon', false);
      },
      complete: () => {
        Session.set('selectedIcon', false);
      }
    });
    $('#editMenu').modal({
      ready: (modal, trigger) => {
      },
      complete: () => {
        Session.set('selectedIcon', false);
        this.editMenu.set("");
      }
    });
    $('#createMenuItem').modal({
      ready: (modal, trigger) => {
      },
      complete: () => {
        $("#new-menu-Item").val("");
        $("#menu-item-color").val("");
      }
    });
  }, 500);
  this.autorun(() => {

    let self = this;
    if (this.subscriptionsReady()) {
      Meteor.setTimeout(() => {
        var el = document.getElementById('sortable-list');
        var sortable = new Sortable(el, {
          // Element dragging ended
          onEnd: function (evt) {
            var itemEl = evt.item; // dragged HTMLElement
            let menuId = $(itemEl).find('.menuItem')[0].id;
            Meteor.call('menuItemDev.updateCustomIndex', evt.oldIndex, evt.newIndex, menuId, getCookie("selectedSDForSA"), (error, result) => {
              if (error) {
                // console.log('error', error);
                showAlert('danger', 'Can not move this menu');
              } else {
                if (result) {
                  showAlert('success', 'Menu move successfully');
                }
              }
            });
          }
        });
        var el = document.getElementById('sortable-submenu-list');
        this.sortable = new Sortable(el, {
          // Element dragging ended
          onEnd: function (evt) {
            var itemEl = evt.item; // dragged HTMLElement
            let subMenuItemId = $(itemEl).find('.subMenuItem')[0].id;
            let menuId = FlowRouter.getParam('menuItem');
            if (evt.oldIndex == evt.newIndex) {
              return;
            }
            Meteor.call('menuItemDev.updateSubMenuCustomIndex', evt.oldIndex, evt.newIndex, menuId, subMenuItemId, getCookie("selectedSDForSA"), (error, result) => {
              if (error) {
                // console.log('error', error);
                showAlert('danger', 'Can not move this menu item');
              } else {
                if (result) {
                  showAlert('success', 'Menu item move successfully');
                }
              }
            });
          }
        });


      }, 100);//setTimeout


    }
  });
});
Template.admin.helpers({
  checkUserSuperAdmin() {
    return Roles.userIsInRole(Meteor.userId(), ['super-admin'], Roles.GLOBAL_GROUP);
  },
  checkAdminOrSuperAdmin() {
    return Roles.userIsInRole(Meteor.userId(), ['super-admin'], Roles.GLOBAL_GROUP) || Roles.userIsInRole(Meteor.userId(), ['admin'], 'admin');
  },
  checkUserAdmin() {
    return Roles.userIsInRole(Meteor.userId(), ['admin'], 'admin');
  },
  initialColor() {

    return "#FFFFFF";

  },

  subdDomainName() {
    // console.log(" === > ",Template.instance().selectedDomain.get())
    if (Template.instance().selectedDomain.get())
      return Template.instance().selectedDomain.get();

  },
  menuItems() {
    console.log('menus', Template.instance().menus.get());
    return Template.instance().menus.get();
  },
  menuEdit() {
    return Template.instance().editMenu.get();
  },
  eachMenu() {
    let menuItem = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && Template.instance().editMenu.get()) {
      menuItem = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_menu_item_dev'].findOne(Template.instance().editMenu.get());
    } else {
      menuItem = MenuItemDev.findOne(Template.instance().editMenu.get());
    }
    if (menuItem && menuItem.preference && menuItem.preference.icon)
      if (menuItem && menuItem.preference && !menuItem.preference.iconColor) {
        menuItem.preference.iconColor = menuItem.preference.color || "#FFFFFF"; //As ByDefault it takes white  Background.
      }
    //console.log(menuItem);
    return menuItem;
  },
  getLangMenuItem() {
    let menuItem = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && Template.instance().editMenu.get()) {
      menuItem = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_menu_item_dev'].findOne(Template.instance().editMenu.get());
    } else {
      menuItem = MenuItemDev.findOne(Template.instance().editMenu.get());
    }

    if (menuItem && menuItem.preference && menuItem.preference.icon)
      if (menuItem && menuItem.preference && !menuItem.preference.iconColor) {
        menuItem.preference.iconColor = menuItem.preference.color || "#FFFFFF"; //As ByDefault it takes white  Background.
      }
    return menuItem ? menuItem : {name: ''};

  },
  selectedCategories() {
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_menu_item_dev']) {
      dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_menu_item_dev'].find();
    } else {
      return MenuItemDev.find();
    }
  },
  selectedMenu() {
    const menuId = FlowRouter.getParam('menuItem');
    let selectedMenu = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && menuId && dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_menu_item_dev']) {
      selectedMenu = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_menu_item_dev'].findOne(menuId) || {};
    } else {
      selectedMenu = MenuItemDev.findOne(menuId) || {};
    }
    let selectedMenuItems = selectedMenu.items || [];
    selectedMenuItems = _.sortBy(selectedMenuItems, 'customIndex');
    var temp = Template.instance();
    return selectedMenuItems;
  },
  client() {
    return Template.instance().client.get();
  },
  categoryName(id) {
    const names = Template.instance().categoryNames.get();
    const category = _.findWhere(names, {
      id: Number(id)
    });
    return category && category.name;
  },
  eventName(id) {
    const events = Template.instance().events.get();
    const event = _.findWhere(events, {
      _id: id
    });
    return event && event.name;
  },
  customLocationName(id) {
    const customLocations = Template.instance().customLocations.get();
    const event = _.findWhere(customLocations, {
      _id: id
    });
    return event && event.name;
  },
  visible() {
    if (!Template.instance().menuSelected.get()) {
      return 'hide';
    }
    return '';
  },
  eventFormData() {
    return {
      "viewEvent": Template.instance().viewEvent,
      "eventId": Template.instance().eventId
    }
  },
  locationFormData() {
    return {
      "viewCustomLocation": Template.instance().viewCustomLocation,
      "customLocationId": Template.instance().customLocationId
    }
  },
  selectedIcon() {
    let inst = Template.instance();
    let menuItem = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && Template.instance().editMenu.get()) {
      menuItem = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_menu_item_dev'].findOne(Template.instance().editMenu.get());
    } else {
      menuItem = MenuItemDev.findOne(Template.instance().editMenu.get());
    }
    if (Session.get('selectedIcon')) {
      return Session.get('selectedIcon');
    } else if (menuItem && menuItem.preference) {
      return menuItem.preference.icon
    } else {
      return "star-15";
    }
  },
  publishedOn(publishDetails) {
    if (!publishDetails) {
      return 'Not published yet';
    }
    var maxTimeStmap = _.max(publishDetails, function (publishDetail) {
      return publishDetail.timeStamp;
    });
    if (!maxTimeStmap || !maxTimeStmap.timeStamp) {
      return 'Not published yet';
    }
    var currentdate = new Date(maxTimeStmap.timeStamp);
    var datetime = currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear() + " " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
    return datetime;
  },
  getEditMenuItemInfo() {
    let inst = Template.instance();
    return inst.editItemId ? inst.editItemId.get() : null
  },
  pageLoading() {
    // If for some reason our spinner dont gets vanished then we will stop shoing that after 10seconds
    Meteor.setTimeout(() => {
      Session.set('showLoading', false)
    }, 20000);
    return Session.get('showLoading');
  },
  loadTemplate() {
    return Template.instance().loadTemplate.get() || '';
  },

  showLocationModal() {
    return Template.instance().showLocationModal.get() || ''
  },
  showSubdomainPage() {
    return Template.instance().showSubdomainPage.get() || '';
  },
  showReportPage() {
    return Template.instance().showReportPage.get() || '';
  },
  showAdvertisementPage() {
    return Template.instance().showAdvertisementPage.get() || '';
  },
  showUsersListPage() {
    console.log()
    if (Template.instance().showUsersListPage.get() && Template.instance().selectedDomain.get()) {
      const subdomain = Subdomain.findOne({name: getCookie('adminSubdomain')});
      if (subdomain)
        return subdomain._id;
      return false
    }
    return false;
  },
  subdomainList() {
    return Template.instance().subDomainList.get() || [];
  },
  adminSubdomainList() {
    if (Meteor.users.findOne({_id:Meteor.userId()})) {
      return Meteor.users.findOne({_id:Meteor.userId()}).profile.subdomainName;
    } else {
      return false;
    }
  },

  checkAdminSubdomainList() {
    if (Meteor.users.findOne({_id:Meteor.userId()})) {
      return Array.isArray(Meteor.users.findOne({_id:Meteor.userId()}).profile.subdomainName);
    } else {
      return 0;
    }
  },
  selectedDomain() {
    return {selectedDomain: Template.instance().selectedDomain.get() || ''};
  },
  isselected() {
    if (getCookie("selectedSDForSA") == this.name)
      return 'selected';
    else return '';
  },
  adminIsSelected(index) {
    if (getCookie('adminSubdomain')) {
      if (Meteor.users.findOne({_id:Meteor.userId()}).profile.subdomainName[index] === getCookie('adminSubdomain')) {
        return 'selected'
      }
    } else if (index == 0) {
      return 'selected';
    } else {
      return '';
    }
  },


  isHide() {
    return !Session.get('isHide') ? 'hide' : '';
  },
  languagesListForMenu() {

    const languageOptions = [];

    // Get all site translation languages
    const languages = TAPi18n.getLanguages();
    // Create Array of Objects with language tag and name
    _.forEach(languages, (language, tag) => {
      // Get language object
      const languageOption = language;
      // Get language tag (short language name)
      languageOption.tag = tag;

      // Add language option to array
      languageOptions.push(languageOption);
    });
    return languageOptions;
  },
  languagesListForMenuEdit() {

    const languageOptions = [];

    // Get all site translation languages
    const languages = TAPi18n.getLanguages();
    // Create Array of Objects with language tag and name
    _.forEach(languages, (language, tag) => {
      // Get language object
      const languageOption = language;
      // Get language tag (short language name)
      languageOption.tag = tag;

      // Add language option to array
      languageOptions.push(languageOption);
    });
    // console.log("value",languageOptions);
    return languageOptions;
  },
  forValue(nameObj, langTag) {
    return nameObj ? nameObj[langTag] : '';
  }
});

Template.admin.events({
  'click #newMenuBtn'(event) {
    Session.set('lang', 'en');
    $(".allLanguageMenu").hide();
    $("#en").show();

  },
  'click #advertisementTrigger'(event, inst) {

    // event.preventDefault();
    import ('../advertisement/advertisement.js').then(() => {
      Session.set('isHide', false);
      inst.showSubdomainPage.set(false);
      inst.showReportPage.set(false);
      inst.showUsersListPage.set(false);
      inst.showLocationModal.set(false);
      inst.showAdvertisementPage.set(true);
    });
  },
  'click #geoJsonMapTrigger'(event, inst) {
    // event.preventDefault();
    import ('../geoJsonLines/geoJsonLines.js').then(() => {
      inst.loadTemplate.set("geoJsonMap");
      Meteor.setTimeout(() => {
        $("#geoJsonMapModal").modal('open');
      }, 600)
    })
  },
  'click #settingsModalTrigger'(event, inst) {
    // event.preventDefault();
    import ('./settings.js').then(() => {
      inst.loadTemplate.set("settingsModal");
      Meteor.setTimeout(() => {
        $("#settingsModal").modal();
        $("#settingsModal").modal('open');
      }, 200)
    });
  },
  'click #brandingSectionTrigger'(event, inst) {
    // event.preventDefault();
    import ('../brandingSection/brandingSection.js').then(() => {
      inst.loadTemplate.set("brandingSection");
      Meteor.setTimeout(() => {
        $("#brandingSection").modal();
        $("#brandingSection").modal('open');
      }, 200)
    });
  },
  'click #routeLocationsTrigger'(event, inst) {
    // event.preventDefault();
    import ('../routeLocations/routeLocations.js').then(() => {
      inst.loadTemplate.set("routeLocations");
      Meteor.setTimeout(() => {
        $("#routeLocations").modal();
        $("#routeLocations").modal('open');
      }, 200)
    });
  },
  'click #createMenuItemTrigger'(event, inst) {
    // event.preventDefault();
    import ('./newMenuItemModal.js').then(() => {
      inst.loadTemplate.set("newMenuItemModal");
      Meteor.setTimeout(() => {
        $("#createMenuItem").modal();
        $("#createMenuItem").modal('open');
      }, 200)
    });
  },

  'click #subdomain'(event, inst) {
    import('../subdomain/subdomain.js').then(() => {
      /* $('.adminLanding').hide();*/
      Session.set('isHide', false);
      /*isHide*/
      inst.showLocationModal.set(false);
      inst.showUsersListPage.set(false);
      inst.showAdvertisementPage.set(false);
      inst.showReportPage.set(false);
      inst.showSubdomainPage.set(true);
    });

  },

  'click #usersList'(event, inst) {
    import('../user/user.js').then(() => {
      Session.set('isHide', false);
      inst.showLocationModal.set(false);
      inst.showSubdomainPage.set(false);
      inst.showAdvertisementPage.set(false);
      inst.showReportPage.set(false);
      inst.showUsersListPage.set(true);
    });

  },

  'click #locationsTrigger'(event, inst) {

    // event.preventDefault();
    import ('../locationsDataTable/locationsDataTable.js').then(() => {
      Session.set('isHide', false);
      inst.showSubdomainPage.set(false);
      inst.showUsersListPage.set(false);
      inst.showAdvertisementPage.set(false);
      inst.showReportPage.set(false);
      inst.showLocationModal.set(true);
    });
  },

  'click #termsServiceTrigger'(event, inst) {
    // event.preventDefault();
    import('../termsofservice/termsservice.js').then(() => {
      inst.loadTemplate.set("termsservice");
      Meteor.setTimeout(() => {
        $("#termsservice").modal();
        $("#termsservice").modal('open');
      }, 200)
    });
  },

  'click #privacyPolicyTrigger'(event, inst) {
    // event.preventDefault();
    import('../privacypolicy/privacypolicy.js').then(() => {
      inst.loadTemplate.set("privacypolicy");
      Meteor.setTimeout(() => {
        $("#privacypolicy").modal();
        $("#privacypolicy").modal('open');
      }, 200)
    });
  },

  'click #copyrightTrigger'(event, inst) {
    // event.preventDefault();
    import('../copyright/copyright.js').then(() => {
      inst.loadTemplate.set("copyright");
      Meteor.setTimeout(() => {
        $("#copyright").modal();
        $("#copyright").modal('open');
      }, 200)
    });
  },

  'click #colorsTrigger'(event, inst) {
    import('../selectColors/selectColors.js').then(() => {
      inst.loadTemplate.set("chooseColors");
      Meteor.setTimeout(() => {
        $("#chooseColors").modal();
        $("#chooseColors").modal('open');
      }, 200)
    });
  },

  'click #adminReport'(event, inst) {
    import('../report/report.js').then(() => {
      /* $('.adminLanding').hide();*/
      Session.set('isHide', false);
      /*isHide*/
      inst.showLocationModal.set(false);
      inst.showUsersListPage.set(false);
      inst.showAdvertisementPage.set(false);
      inst.showSubdomainPage.set(false);
      inst.showReportPage.set(true);
    });

  },

  'focus .new-menu-color'(event) {
    $('.new-menu-color').colorpicker({
      container: $('.new-menu-color-pick'),
    });
  },
  'focus .edit-menu-color'(event) {
    $('.edit-menu-color').colorpicker({
      container: $('.edit-menu-color-pick'),
    });
  },
  'submit #addMenu'(event) {
    event.preventDefault();
    if ($("#en #menu-name").val() == "") {
      showAlert('danger', 'Please fill english name of menu');
      return false;
    }
    let name = {};
    const languages = TAPi18n.getLanguages();
    _.forEach(languages, (language, tag) => {
      // Get language object
      const languageOption = language;
      // Get language tag (short language name)
      languageOption.tag = tag;
      if ($("#" + languageOption.tag + " #menu-name").val()) {
        name[languageOption.tag] = $("#" + languageOption.tag + " #menu-name").val()
      } else {
        name[languageOption.tag] = $("#en #menu-name").val()
      }
      // Add language option to array
    });
    // console.log('menuItem', name)
    let fields = {
      name,
      isEvent: $('#isEvent').is(":checked"),
      icon: $('#insert-menu-icon').val() ? $('#insert-menu-icon').val() : null,
      color: $("#menu-item-color-admin-new-menu-modal").val(),
      defaultLangForMenu: $("#en #menu-name").val(),
    }
    let isDuplicate = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_menu_item_dev'].find({name: fields.name}).count();
    if (isDuplicate === 0) {
      Meteor.call('menuItemDev.insert', fields, getCookie("selectedSDForSA"), (error) => {
        if (error) {
          // console.log('error', error);
          showAlert('danger', 'Can not add this menu');
        } else {
          Session.set('lang', 'en');
          $('#newMenu').modal('close');
          showAlert('success', 'Menu added successfully');
          _.forEach(languages, (language, tag) => {
            // Get language object
            const languageOption = language;
            // Get language tag (short language name)
            languageOption.tag = tag;
            $("#" + languageOption.tag + " #menu-name").val("");
          });
        }
      });
    } else {
      showAlert('danger', 'Duplicate Name can not be inserted');
    }
  },
  'click .getMenuToEdit'(event, templateInstance) {
    templateInstance.editMenu.set('');
    var language = Session.get('lang');
    // console.log($(".allLanguageMenuEdit"));
    Meteor.setTimeout(function () {
      $(".allLanguageMenuEdit").hide();
      $("." + language).show();
    }, 200);

    let menuId = event.target.id;

    // console.log(menuId , 'menuId', $(menuId))
    templateInstance.editMenu.set(menuId);
    $('.getMenuToEdit').removeClass("bg-red");

  },
  'submit .editMenuForm'(event) {
    event.preventDefault();
    if ($(".en #menu-name-edit").val() == "") {
      showAlert('danger', 'Please fill english name of menu');
      return false;
    }
    const languages = TAPi18n.getLanguages();
    let name = {};
    _.forEach(languages, (language, tag) => {
      // Get language object
      const languageOption = language;
      // Get language tag (short language name)
      languageOption.tag = tag;
      if ($("." + languageOption.tag + " #menu-name-edit").val()) {
        name[languageOption.tag] = $("." + languageOption.tag + " #menu-name-edit").val()
      } else {
        name[languageOption.tag] = $(".en #menu-name-edit").val()
      }
      // Add language option to array
    });
    let updateStatus;
    // console.log('getSubdomain(getCookie("selectedSDForSA")) ===> ',getSubdomain(getCookie("selectedSDForSA")))
    if (getSubdomain(getCookie("selectedSDForSA"))) {
      updateStatus = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_menu_item_dev'].update($(event.target).attr('id'), {
        $set: {
          name: name,
          isEvent: $('#edit-isEvent').is(":checked"),
          'preference.color': $("#edit-menu-color2").val(),
          'preference.icon': $("#edit-menu-icon").val(),
          defaultLangForMenu: $(".en #menu-name-edit").val(),
        }
      });
    } else {
      updateStatus = MenuItemDev.update($(event.target).attr('id'), {
        $set: {
          name: $("#en #menu-name-edit").val(),
          'preference.color': $("#edit-menu-color2").val(),
          'preference.icon': $("#edit-menu-icon").val()
        }
      });
    }
    // console.log("updateStatus ==> ",updateStatus)
    if (updateStatus) {
      $('#editMenu').modal('close');
      showAlert('success', 'Menu updated successfully');
    } else {
      showAlert('danger', 'Can not update this menu');
    }
  },
  'dragstart .chip-locations'(event, inst) {
    event.stopPropagation();
    inst.sortable.option("disabled", true);
    inst.draggedId.set(event.target.dataset.customlocationid);
  },
  'drop .droppable-area'(event, inst) {
    event.preventDefault()
    inst.sortable.option("disabled", false);
    Meteor.call('menuItemDev.updateLocation', {
      subMenuId: event.target.id,
      locationId: inst.draggedId.get()
    }, getCookie("selectedSDForSA"))
  },
  'dragover #adminMain, dragover .openButton, dragover #editMenu, dragover #newMenu, dragover #admin-nav '(event, inst) {
    event.preventDefault()
  },
  'drop #adminMain, drop .openButton, drop #editMenu, drop #newMenu, drop #admin-nav'(event, inst) {
    event.preventDefault()
    inst.sortable.option("disabled", false);
  },
  'click .deleteMenu'(event, inst) {
    event.preventDefault();
    let menuId = $(event.target).attr('id')
    swal({
      title: "Are you sure?",
      text: "Are you sure you want to delete this menu",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      closeOnConfirm: true,
      closeOnCancel: true
    }, (isConfirm) => {
      if (isConfirm) {
        let deleteStatus;
        if (getSubdomain(getCookie("selectedSDForSA"))) {
          deleteStatus = dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_menu_item_dev'].remove(menuId);
        } else {
          deleteStatus = MenuItemDev.remove(menuId);
        }
        if (deleteStatus) {
          showAlert('success', `Menu deleted successfully`);
        } else {
          showAlert('danger', `Can not delete this menu`);
        }
        FlowRouter.go(`/`);
      }
    });
  },
  'click .openButton'(event) {
    $('.button-collapse').sideNav('show');
  },
  'click #logoutButton'(event, inst) {
    // inst.removeAdminIp();
    deleteAllCookies();
    Meteor.logout();
    FlowRouter.go('/');
  },
  'click .navClose'(event) {
    event.stopPropagation();
    // hide sideNav
    $('.button-collapse').sideNav('hide');
    // $('.button-collapse').sideNav('hide');
  },
  'click .remove-category-from-query'(event) {

    swal({
      title: "Are you sure?",
      text: "Are you sure you want to delete category.",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      closeOnConfirm: true,
      closeOnCancel: true
    }, function (isConfirm) {
      if (isConfirm) {
        const dataObject = {
          // _id: Session.get('menuItemSelected'),
          menuKey: FlowRouter.getParam('menuItem'),
          // client: FlowRouter.getParam('client'),
          thisItemId: $(event.target).attr('data-thisItemId'),
          categoryId: $(event.target).attr('data-sensisId'),
        };
        Meteor.call('menuItemDev.removeCategory', dataObject, getCookie("selectedSDForSA"), (error, result) => {
          if (error) {
            // console.log('error', error);
            showAlert('danger', `Can not remove this category`);
          }
          if (result) {
            showAlert('success', `Category removed successfully`);
          }
        });
      }
    });


  },
  'click .remove-event-from-query'(event) {
    swal({
        title: "Are you sure?",
        text: "You will not be able to recover this imaginary file!",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel plx!",
        closeOnConfirm: false,
        closeOnCancel: false
      },
      function (isConfirm) {
        if (isConfirm) {
          swal("Deleted!", "Your imaginary file has been deleted.", "success");
          const dataObject = {
            // _id: Session.get('menuItemSelected'),
            menuKey: FlowRouter.getParam('menuItem'),
            // client: FlowRouter.getParam('client'),
            thisItemId: $(event.target).attr('data-thisItemId'),
            eventId: $(event.target).attr('data-eventId'),
          };
          Meteor.call('menuItemDev.removeEvent', dataObject, getCookie("selectedSDForSA"), (error, result) => {
            if (error) {
              // console.log('error', error);
              showAlert('danger', `Can not remove this event`);
            }
            if (result) {
              showAlert('success', `Event removed successfully`);
            }
          });
        } else {
          swal("Cancelled", "Your imaginary file is safe :)", "error");
        }
      });

  },
  'click .remove-custom-location-from-query'(event) {
    swal({
      title: "Are you sure?",
      text: "Are you sure you want to delete this location.",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      closeOnConfirm: false,
      closeOnCancel: true
    }, function (isConfirm) {
      if (isConfirm) {
        swal("Deleted!", "Your imaginary file has been deleted.", "success");
        const dataObject = {
          menuKey: FlowRouter.getParam('menuItem'),
          thisItemId: $(event.target).attr('data-thisItemId'),
          customLocationId: $(event.target).attr('data-customLocationId'),
        };
        Meteor.call('menuItemDev.removeLocation', dataObject, getCookie("selectedSDForSA"), (error, result) => {
          if (error) {
            // console.log('error', error);
            showAlert('danger', `Can not remove this event`);
          }
          if (result) {
            showAlert('success', `Event removed successfully`);
          }
        });
      }
    });

  },
  'click .view-edit-event'(event, templateInstance) {
    event.preventDefault();
    const events = Template.instance().events.get();
    const eventId = $(event.target).attr('data-eventId');
    const eventData = _.findWhere(events, {
      _id: eventId
    });
    templateInstance.viewEvent.set(eventData);
    templateInstance.eventId.set(eventId);
    $("#eventForm").modal('open');
  },
  'click .view-edit-custom-location'(event, templateInstance) {
    event.preventDefault();
    const customLocations = Template.instance().customLocations.get();
    const customLocationId = $(event.target).attr('data-customLocationId');
    const customLocationData = _.findWhere(customLocations, {
      _id: customLocationId
    });
    templateInstance.viewCustomLocation.set(customLocationData);
    templateInstance.customLocationId.set(customLocationId);
    $("#locationForm").modal('open');
  },
  // Handling ENTER key on #new-menu-Item
  'keypress #new-menu-Item'(event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  },
  'click .menuItem'(event, templateInstance) {
    // console.log("menu item clicked");
    event.preventDefault();
    /* console.log("dsdsdsd", $(this).parent())*/
    templateInstance.editMenu.set('');
    $('.button-collapse').sideNav('hide');
    Session.set('isHide', false);
    const menuId = $(event.target).attr('id');
    templateInstance.editMenu.set(menuId);
    FlowRouter.go(`/admin/${menuId}`);

    $('.menuItem').removeClass("bg-color");
    $(event.target).addClass("bg-color");

  },
  'click .delete-category'(event, inst) {
    swal({
      title: "Are you sure?",
      text: "Are you sure you want to delete this sub menu",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      closeOnConfirm: true,
      closeOnCancel: true
    }, function (isConfirm) {
      if (isConfirm) {
        const deleteObject = {
          defaultLangforSubmenu: $(event.target).attr('id'),
          menuId: FlowRouter.getParam('menuItem'),
        }
        Meteor.call('menuItemDev.remove', deleteObject, getCookie("selectedSDForSA"), function (error, result) {
          if (error) {
            showAlert('danger', `Can not delete this menu item`);
          } else {
            showAlert('success', `Menu Item deleted successfully`);
          }
        });
      }
    });
  },
  'click .edit-menu-item'(event, templateInstance) {
    var language = Session.get('langSubmenuEdit');
    templateInstance.editItemId.set($(event.target).attr('id'));
    // console.log('check perems', FlowRouter.getParam('menuItem'))
    templateInstance.editItemMenuId.set(FlowRouter.getParam('menuItem'));
    // console.log( $(".allLanguageSubMenuEdit"));
    // console.log($("."+language));
    $(".allLanguageSubMenuEdit").hide();
    $("." + language).show();

  },
  'click .searchButtons'(event) {
    Session.set('menuItemSelected', $(event.target).attr('id'));
  },
  'click .publish'(event) {
    const menuId = FlowRouter.getParam('menuItem');
    swal({
      title: "Are you sure?",
      text: "ARE YOU SURE YOU WANT TO PUBLISH YOUR DATA . THIS WILL OVERWRITE ALL CURRENTLY LIVE APP CONTENT",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      closeOnConfirm: true,
      closeOnCancel: true
    }, function (isConfirm) {
      if (isConfirm) {
        Meteor.call('menuItemDev.publishMenuItems', menuId, getCookie("selectedSDForSA"), function (error, result) {
          if (error) {
            showAlert('danger', 'Error while publishing...');
          } else {
            showAlert('success', 'Items published successfully')
          }
        });
      }
    });
  },
  'click .newItemBtn'(event, inst) {
    Session.set('selectedIcon', false);
  },

  "click .openColorPickerEditAdmin"(event, inst) {
    event.preventDefault();
    $(".edit-menu-color2").click();
  },
  'click .edit-menu-color2'(event, inst) {
    if (!$('#edit-menu-color2').val()) {
      $('#edit-menu-color2').val('#FFFFFF'); //To Avoid throwing exceptions.
    }
    var colors4 = jsColorPicker('#edit-menu-color2', {
      readOnly: true,
      fps: 60, // the framerate colorPicker refreshes the display if no 'requestAnimationFrame'
      delayOffset: 8, // pixels offset when shifting mouse up/down inside input fields before it starts acting as slider
      CSSPrefix: 'cp-', // the standard prefix for (almost) all class declarations (HTML, CSS)
      size: 3, // one of the 4 sizes: 0 = XXS, 1 = XS, 2 = S, 3 = L (large); resize to see what happens...
      allMixDetails: true, // see Colors...
      alphaBG: 'w', // initial 3rd layer bgColor (w = white, c = custom (customBG), b = black);
      cmyOnly: false, // display CMY instead of CMYK
      opacityPositionRelative: '%', // render opacity slider arrows in px or %
      customCSS: undefined, // if external stylesheet, internal will be ignored...
      noRangeBackground: false, // performance option: doesn't render backgrounds in input fields if set to false
      noHexButton: false, // button next to HEX input could be used for some trigger...
      noResize: true, // enable / disable resizing of colorPicker
      noRGBr: false, // active / passive button right to RGB-R display. Disables rendering of 'real' color possibilities...
      noRGBg: false, // same as above
      noRGBb: false, // same as above
      noAlpha: true, // disable alpha input (all sliders are gone and current alpha therefore locked)
      multipleInstances: true,
      appenTo: document.getElementById('outColorPicker'),
      init: function (elm, colors) {
      },
      actionCallback: (evt, action) => {
        //This Callbacks are general throught life cycle. so need to repeat the code.
        if (action === 'changeXYValue' && $('.edit-menu-color2').val()) {
          $('.edit-menu-icon-img').css('background-color', $('.edit-menu-color2').val() || '#000');
        }
      }
    });
  },
  'click .openColorPicker'(event, inst) {
    $('.edit-menu-color2').click();
  },
  'blur .openColorPicker'(event, inst) {
    $('.edit-menu-color2').blur();
  },
  'click #menu-item-color-admin-new-menu-modal'(event, inst) {
    if (!$('#menu-item-color-admin-new-menu-modal').val()) {
      $('#menu-item-color-admin-new-menu-modal').val('#FFFFFF'); //To Avoid throwing exceptions.
    }
    var colors1 = jsColorPicker('#menu-item-color-admin-new-menu-modal', {
      readOnly: true,
      fps: 60, // the framerate colorPicker refreshes the display if no 'requestAnimationFrame'
      delayOffset: 8, // pixels offset when shifting mouse up/down inside input fields before it starts acting as slider
      CSSPrefix: 'cp-', // the standard prefix for (almost) all class declarations (HTML, CSS)
      size: 3, // one of the 4 sizes: 0 = XXS, 1 = XS, 2 = S, 3 = L (large); resize to see what happens...
      allMixDetails: true, // see Colors...
      alphaBG: 'w', // initial 3rd layer bgColor (w = white, c = custom (customBG), b = black);
      cmyOnly: false, // display CMY instead of CMYK
      opacityPositionRelative: '%', // render opacity slider arrows in px or %
      customCSS: undefined, // if external stylesheet, internal will be ignored...
      noRangeBackground: false, // performance option: doesn't render backgrounds in input fields if set to false
      noHexButton: false, // button next to HEX input could be used for some trigger...
      noResize: true, // enable / disable resizing of colorPicker
      noRGBr: false, // active / passive button right to RGB-R display. Disables rendering of 'real' color possibilities...
      noRGBg: false, // same as above
      noRGBb: false, // same as above
      noAlpha: true, // disable alpha input (all sliders are gone and current alpha therefore locked)
      multipleInstances: true,
      appenTo: document.getElementById('outColorPickerAdminNewItemModal'),
      init: function (elm, colors) {
      },
      actionCallback: (evt, action) => {
        //This Callbacks are general throught life cycle. so need to repeat the code.
        if (action === 'changeXYValue' && $('#menu-item-color-admin-new-menu-modal').val()) {
          $('.edit-menu-icon-img.img').css('background-color', $('#menu-item-color-admin-new-menu-modal').val() || '#000');
          $('.edit-menu-icon-img.img').val($('#menu-item-color-admin-new-menu-modal').val());
          $('.insert-menu-icon-admin').val($('#menu-item-color-admin-new-menu-modal').val());
        }
      }
    });
  },
  "click .openColorPickerNewMenuAdmin"(event, inst) {
    event.preventDefault();
    $("#menu-item-color-admin-new-menu-modal").click();
  },

  "change #subDomainForSuperAdmin"(event, inst) {
    var selectedSDForSA = $(event.currentTarget).val();

    inst.selectedDomain.set(selectedSDForSA);
    if (selectedSDForSA == 'none')
      deleteAllCookies();
    else {
      // console.log("hrhrhrhhrh")
      setCookie("selectedSDForSA", selectedSDForSA, 30);
      /*inst.showSubdomainPage.set(false);
      inst.showUsersListPage.set(false);
      inst.showLocationModal.set(false);
      inst.showAdvertisementPage.set(false);
      inst.loadTemplate.set(false);
      Session.set('isHide', true);
      inst.menuSelected.set(false);
      FlowRouter.go('/');*/
      document.location.reload(true);

      //Meteor._reload.reload();
    }
  },

  "change #subDomainForAdmin"(event, inst) {
    var adminSubdomain = $(event.currentTarget).val();
    inst.selectedDomain.set(adminSubdomain);
    if (adminSubdomain == 'none')
      deleteAllCookies();
    else {
      setCookie("adminSubdomain", adminSubdomain, 30);
      getCookie('selectedSDForSA', adminSubdomain, 30);
      document.location.reload(true);
    }
  }
});
Template.languageSelect.onRendered(function () {
  this.autorun(() => {
    Session.set('lang', 'en');
  });
  require('./languages.css');
  const selectedLanguage = Session.get('lang');
});

Template.languageSelect.helpers({
  languagesList() {

    const languageOptions = [];

    // Get all site translation languages
    const languages = TAPi18n.getLanguages();
    // Create Array of Objects with language tag and name
    _.forEach(languages, (language, tag) => {
      // Get language object
      const languageOption = language;
      // Get language tag (short language name)
      languageOption.tag = tag;

      // Add language option to array
      languageOptions.push(languageOption);
    });
    return languageOptions;
  },
  activeLanguage() {
    // Get current language
    let activeLanguage = Session.get('lang');

    // Get language from the current data context
    const languageTag = this.tag;

    // Add class "selected" to highlight active language
    if (activeLanguage === languageTag) {
      return 'selected';
    }
    return '';
  },
});
Template.languageSelect.events({
  'change #language-select'(event) {
    // Get language from the current data context
    const language = event.target.value;
    /* const */
    // Update selected language in Session
    Session.set('lang', language);
    var showMenuId = Session.get('lang');
    $(".allLanguageMenu").hide();
    $(".allLanguageMenuEdit").hide();
    $("#" + showMenuId).show();
    $("." + showMenuId).show();
  },


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
