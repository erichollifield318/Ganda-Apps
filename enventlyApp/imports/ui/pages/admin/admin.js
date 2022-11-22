import './admin.html';
import './iconModal.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';

import {
    MenuItemDev
} from '/imports/api/menu_item_dev/menu_item_dev.js';
import {
    EventDev
} from '/imports/api/event_dev/event_dev.js';
import {
    LocationDev
} from '/imports/api/location_dev/location_dev.js';
import {
    AdminSettings
} from '/imports/api/admin_settings/admin_settings.js';
import { Subdomain } from '/imports/api/subdomain/subdomain.js';
import { getSubdomain,setCookie,getCookie,deleteAllCookies } from '/imports/startup/both/global_function.js';
import '../../components/categoriesList/categoriesList.js';
import '/imports/ui/pages/eventForm/eventForm.js';
import './editMenuItemModal.js';
// import './settings.js';
import '/imports/ui/pages/locationForm/locationForm.js';

// import '/imports/ui/pages/subdomain/subdomain.js';
// import '../geoJsonLines/geoJsonLines.js';
// import '../brandingSection/brandingSection.js';
// import '../routeLocations/routeLocations.js';
Template.admin.onCreated(async function() {
    require('./menuItemModal.css');
    // await import('./iconModal.js');
    this.subscribe("subdomain.all");

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
    this.subDomainList = new ReactiveVar(false);
    this.selectedDomain = new ReactiveVar(getCookie("selectedSDForSA"));

    Session.set('selectedIcon',false);
    Session.set('showLoading',false);
    $('.modal').modal();
    Session.setDefault('menuItemSelected', false);
    const categIdArray = this.categIds.get();
    this.autorun(() => {
        // const subDomainHandle =  Meteor.subscribe('subdomain.all');
        var self =this;
        console.log (':: => check')
        if (this.subscriptionsReady()) {
            console.log (':: call ---> ',Subdomain.find().fetch())
            this.subDomainList.set(Subdomain.find().fetch());
            Meteor.setTimeout(() => {
              $('select').material_select();

            }, 500);
        }
        this.client.set(Roles.getRolesForUser(Meteor.user()));
        const menuHandle = Meteor.subscribe('menu_item_dev.all',self.selectedDomain.get());
        if (menuHandle.ready()) {
            if(getSubdomain(self.selectedDomain.get()))
            {
              this.menus.set(dynamicCollections[getSubdomain(self.selectedDomain.get())+'_menu_item_dev'].find({}, {
                  sort: {
                      customIndex: 1
                  }
              }).fetch());
            }
            else {
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
        this.client.set(Roles.getRolesForUser(Meteor.user()));
        const eventHandle = Meteor.subscribe('event_dev.all',self.selectedDomain.get());
        let locationDevHandle = Meteor.subscribe('location_dev.all',self.selectedDomain.get());
        if (eventHandle.ready()) {
            if(getSubdomain(self.selectedDomain.get()))
            {
              this.events.set(dynamicCollections[getSubdomain(self.selectedDomain.get())+'_event_dev'].find().fetch());
            }
            else {
              this.events.set(EventDev.find().fetch());
            }
        }
        if (locationDevHandle.ready()) {
            if(getSubdomain(self.selectedDomain.get()))
            {
                this.customLocations.set(dynamicCollections[getSubdomain(self.selectedDomain.get())+'_location_dev'].find().fetch());
            }
            else {
              this.customLocations.set(LocationDev.find().fetch());
            }
        }
        const adminSettinghandle = Meteor.subscribe('admin_settings.all',self.selectedDomain.get());
        if (adminSettinghandle.ready()) {
        let adminSetting = {};
        if(getSubdomain(self.selectedDomain.get()))
        {
          adminSetting = dynamicCollections[getSubdomain(self.selectedDomain.get())+'_admin_settings'].findOne({
              userId: Meteor.userId()
          });
        }
        else {
          adminSetting = AdminSettings.findOne({
              userId: Meteor.userId()
          });
        }
        Session.set('siteSettings', adminSetting);
      }
    });
    this.removeAdminIp = (() => {
        Meteor.call('deleteAdminIp', Meteor.userId(),getCookie("selectedSDForSA"), function(err, res) {
            if (err) {
                console.log(":: ERR inside deleteAdminIp - ", err);
            }
        });
    });
    this.addAdminIp = (() => {
        Meteor.call('saveAdminIp', Meteor.userId(),getCookie("selectedSDForSA"), function(err, res) {
            if (err) {
                console.log(":: ERR inside saveAdminIp - ", err);
            }
            /*else
                            console.log(":: RES inside saveAdminIp - ",res)*/
        });
    });
    $(window).bind('beforeunload', () => this.removeAdminIp());
    // We are upserting admin IP in every 10 seconds, If admin window is open
    this.addAdminIp(); //So, that we can add admin IP as soon as admin loggs-in
    setInterval(() => this.addAdminIp(), 10000);
});
Template.admin.onRendered(function adminOnRendered() {
    const template = Template.instance();
    // Initialize materialize js components
    $('.modal').modal();
    $('.button-collapse').sideNav();
    $('select').material_select();
    $('.collapsible').collapsible();
    // Hide categories on reload and show "select menu..." message, needs to wait a little
    Meteor.setTimeout(() => {
        template.menuSelected.set(false);
        $('.noSelect').show();
    }, 1);
    Tracker.autorun(() => {
        template.editMenu.get();
        Materialize.updateTextFields();
        if (FlowRouter.getParam('menuItem')) {
            template.showLocationModal.set(false);
            template.showSubdomainPage.set(false);
            $('.noSelect').hide();
            template.menuSelected.set(true);
        }
    });
    Tracker.autorun(() => {
        if (template.categIds.get()) {
            let categIds = _.compact(template.categIds.get());
            categIds = _.map(categIds, function(id) {
                return Number(id);
            });
            Meteor.call('categories.getName', categIds,template.selectedDomain.get(), (error, result) => {
                if (error) {
                    console.log('error', error);
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
            ready: (modal, trigger) => {},
            complete: () => {
                Session.set('selectedIcon', false);
                this.editMenu.set("");
            }
        });
        $('#createMenuItem').modal({
            ready: (modal, trigger) => {},
            complete: () => {
                $("#new-menu-Item").val("");
                $("#menu-item-color").val("");
            }
        });
    }, 500);

if (this.subscriptionsReady()) {
    const Sortable = require('sortablejs');
    var el = document.getElementById('sortable-list');
    var sortable = new Sortable(el, {
        // Element dragging ended
        onEnd: function(evt) {
            var itemEl = evt.item; // dragged HTMLElement
            let menuId = $(itemEl).find('.menuItem')[0].id;
            Meteor.call('menuItemDev.updateCustomIndex', evt.oldIndex, evt.newIndex, menuId,getCookie("selectedSDForSA"), (error, result) => {
                if (error) {
                    console.log('error', error);
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
        onEnd: function(evt) {
            var itemEl = evt.item; // dragged HTMLElement
            let subMenuItemId = $(itemEl).find('.subMenuItem')[0].id;
            let menuId = FlowRouter.getParam('menuItem');
            if (evt.oldIndex == evt.newIndex) {
                return;
            }
            Meteor.call('menuItemDev.updateSubMenuCustomIndex', evt.oldIndex, evt.newIndex, menuId, subMenuItemId,getCookie("selectedSDForSA"), (error, result) => {
                if (error) {
                    console.log('error', error);
                    showAlert('danger', 'Can not move this menu item');
                } else {
                    if (result) {
                        showAlert('success', 'Menu item move successfully');
                    }
                }
            });
        }
    });
  }
});
Template.admin.helpers({

    checkUser () {
        return Roles.userIsInRole(Meteor.userId(),['super-admin'], Roles.GLOBAL_GROUP);
    },


    initialColor() {

        return "#FFFFFF";

    },
    menuItems() {
        return Template.instance().menus.get();
    },
    menuEdit() {
        return Template.instance().editMenu.get();
    },
    eachMenu() {
        let menuItem = {};
        if(getSubdomain(getCookie("selectedSDForSA")))
        {
          menuItem = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_menu_item_dev'].findOne(Template.instance().editMenu.get());
        }
        else {
          menuItem = MenuItemDev.findOne(Template.instance().editMenu.get());
        }
        if (menuItem && menuItem.preference && menuItem.preference.icon)
            if (menuItem && menuItem.preference && !menuItem.preference.iconColor) {
                menuItem.preference.iconColor = menuItem.preference.color || "#FFFFFF"; //As ByDefault it takes white  Background.
            }
        return menuItem;
    },
    selectedCategories() {
      if(getSubdomain(getCookie("selectedSDForSA")))
      {
        dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_menu_item_dev'].find();
      }
      else {
        return MenuItemDev.find();
      }
    },
    selectedMenu() {
        const menuId = FlowRouter.getParam('menuItem');
        let selectedMenu = {};
        if(getSubdomain(getCookie("selectedSDForSA")))
        {
          selectedMenu = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_menu_item_dev'].findOne(menuId) || {};
        }
        else {
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
        if(getSubdomain(getCookie("selectedSDForSA")))
        {
        menuItem = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_menu_item_dev'].findOne(Template.instance().editMenu.get());
        }
        else {
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
        var maxTimeStmap = _.max(publishDetails, function(publishDetail) {
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

    showLocationModal(){
        return Template.instance().showLocationModal.get()||''
    },
    showSubdomainPage () {
        return Template.instance().showSubdomainPage.get() || '';
    },
    subdomainList (){
      return Template.instance().subDomainList.get() || [];
    },
    isselected (){
      if(getCookie("selectedSDForSA") == this.name)
        return 'selected';
      else return '';
    }
});
Template.admin.events({
    'click #geoJsonMapTrigger' (event, inst) {
        // event.preventDefault();
        import ('../geoJsonLines/geoJsonLines.js').then(() => {
            inst.loadTemplate.set("geoJsonMap");
            Meteor.setTimeout(() => {
                $("#geoJsonMapModal").modal('open');
            }, 600)
        })
    },
    'click #settingsModalTrigger' (event, inst) {
        // event.preventDefault();
        import ('./settings.js').then(() => {
            inst.loadTemplate.set("settingsModal");
            Meteor.setTimeout(() => {
                $("#settingsModal").modal();
                $("#settingsModal").modal('open');
            }, 200)
        });
    },
    'click #brandingSectionTrigger' (event, inst) {
        // event.preventDefault();
        import ('../brandingSection/brandingSection.js').then(() => {
            inst.loadTemplate.set("brandingSection");
            Meteor.setTimeout(() => {
                $("#brandingSection").modal();
                $("#brandingSection").modal('open');
            }, 200)
        });
    },
    'click #routeLocationsTrigger' (event, inst) {
        // event.preventDefault();
        import ('../routeLocations/routeLocations.js').then(() => {
            inst.loadTemplate.set("routeLocations");
            Meteor.setTimeout(() => {
                $("#routeLocations").modal();
                $("#routeLocations").modal('open');
            }, 200)
        });
    },
    'click #createMenuItemTrigger' (event, inst) {
        // event.preventDefault();
        import ('./newMenuItemModal.js').then(() => {
            inst.loadTemplate.set("newMenuItemModal");
            Meteor.setTimeout(() => {
                $("#createMenuItem").modal();
                $("#createMenuItem").modal('open');
            }, 200)
        });
    },

    'click #subdomain' (event, inst) {
        import('../subdomain/subdomain.js').then(()=>{
            $('.adminLanding').hide();
            inst.showLocationModal.set(false);
            inst.showSubdomainPage.set(true);
        });

    },

    'click #locationsTrigger'(event, inst){

        // event.preventDefault();
        import ('../locationsDataTable/locationsDataTable.js').then(() => {
            $('.adminLanding').hide();
            inst.showSubdomainPage.set(false);
            inst.showLocationModal.set(true);
            /*Meteor.setTimeout(()=>{
                $("#createMenuItem").modal();
                $("#createMenuItem").modal('open');
            },200)*/
        });
    },

    'click #termsServiceTrigger'(event, inst){
        // event.preventDefault();
        import('../termsofservice/termsservice.js').then(()=>{
            inst.loadTemplate.set("termsservice");
            Meteor.setTimeout(()=>{
                $("#termsservice").modal();
                $("#termsservice").modal('open');
            },200)
        });
    },

    'click #privacyPolicyTrigger'(event, inst){
        // event.preventDefault();
        import('../privacypolicy/privacypolicy.js').then(()=>{
            inst.loadTemplate.set("privacypolicy");
            Meteor.setTimeout(()=>{
                $("#privacypolicy").modal();
                $("#privacypolicy").modal('open');
            },200)
        });
    },

    'click #copyrightTrigger'(event, inst){
        // event.preventDefault();
        import('../copyright/copyright.js').then(()=>{
            inst.loadTemplate.set("copyright");
            Meteor.setTimeout(()=>{
                $("#copyright").modal();
                $("#copyright").modal('open');
            },200)
        });
    },

    'focus .new-menu-color'(event){
        $('.new-menu-color').colorpicker({
            container: $('.new-menu-color-pick'),
        });
    },
    'focus .edit-menu-color' (event) {
        $('.edit-menu-color').colorpicker({
            container: $('.edit-menu-color-pick'),
        });
    },
    'click #addMenu' (event) {
        let fields = {
            name: $('#menu-name').val(),
            icon: $('#insert-menu-icon').val() ? $('#insert-menu-icon').val() : null,
            color: $("#menu-item-color-admin-new-menu-modal").val()
        }
        Meteor.call('menuItemDev.insert', fields,getCookie("selectedSDForSA"), (error) => {
            if (error) {
                console.log('error', error);
                showAlert('danger', 'Can not add this menu');
            } else {
                showAlert('success', 'Menu added successfully');
            }
        });
    },
    'click .getMenuToEdit' (event, templateInstance) {
        templateInstance.editMenu.set($(event.target).attr('id'));
    },
    'click .editMenu' (event) {
        const newName = $('#menu-name-edit').val();
        let updateStatus;
        if(getSubdomain(getCookie("selectedSDForSA")))
        {
          updateStatus = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_menu_item_dev'].update($(event.target).attr('id'), {
              $set: {
                  name: newName,
                  'preference.color': $("#edit-menu-color2").val(),
                  'preference.icon': $("#edit-menu-icon").val(),
                  'preference.iconColor': $(".edit-menu-icon-color").val()
              }
          });
        }
        else {
          updateStatus = MenuItemDev.update($(event.target).attr('id'), {
              $set: {
                  name: newName,
                  'preference.color': $("#edit-menu-color2").val(),
                  'preference.icon': $("#edit-menu-icon").val(),
                  'preference.iconColor': $(".edit-menu-icon-color").val()
              }
          });
        }
        if (updateStatus) showAlert('success', 'Menu updated successfully');
        else showAlert('danger', 'Can not update this menu');
    },
    'dragstart .chip-locations' (event, inst) {
        event.stopPropagation();
        inst.sortable.option("disabled", true);
        inst.draggedId.set(event.target.dataset.customlocationid);
    },
    'drop .droppable-area' (event, inst) {
        event.preventDefault()
        inst.sortable.option("disabled", false);
        Meteor.call('menuItemDev.updateLocation', {
            subMenuId: event.target.id,
            locationId: inst.draggedId.get()
        },getCookie("selectedSDForSA"))
    },
    'dragover #adminMain, dragover .openButton, dragover #editMenu, dragover #newMenu, dragover #admin-nav ' (event, inst) {
        event.preventDefault()
    },
    'drop #adminMain, drop .openButton, drop #editMenu, drop #newMenu, drop #admin-nav' (event, inst) {
        event.preventDefault()
        inst.sortable.option("disabled", false);
    },
    'click .deleteMenu' (event, inst) {
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
                if(getSubdomain(getCookie("selectedSDForSA")))
                {
                deleteStatus = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_menu_item_dev'].remove(menuId);
                }
                else {
                  deleteStatus = MenuItemDev.remove(menuId);
                }
                if (deleteStatus) {
                    showAlert('success', `Menu deleted successfully`);
                } else {
                    showAlert('danger', `Can not delete this menu`);
                }
                FlowRouter.go(`/${inst.client.get()}`);
            }
        });
    },
    'click .openButton' (event) {
        $('.button-collapse').sideNav('show');
    },
    'click #logoutButton' (event, inst) {
        inst.removeAdminIp();
        deleteAllCookies();
        Meteor.logout();
        FlowRouter.go('/');
    },
    'click .navClose' (event) {
        event.stopPropagation();
        // hide sideNav
        $('.button-collapse').sideNav('hide');
        // $('.button-collapse').sideNav('hide');
    },
    'click .remove-category-from-query' (event) {

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
        }, (isConfirm) => {
            if (isConfirm) {
                const dataObject = {
                    // _id: Session.get('menuItemSelected'),
                    menuKey: FlowRouter.getParam('menuItem'),
                    // client: FlowRouter.getParam('client'),
                    thisItemId: $(event.target).attr('data-thisItemId'),
                    categoryId: $(event.target).attr('data-sensisId'),
                };
                Meteor.call('menuItemDev.removeCategory', dataObject,getCookie("selectedSDForSA"), (error, result) => {
                    if (error) {
                        console.log('error', error);
                        showAlert('danger', `Can not remove this category`);
                    }
                    if (result) {
                        showAlert('success', `Category removed successfully`);
                    }
                });
            }
        });


    },
    'click .remove-event-from-query' (event) {
        swal({
            title: "Are you sure?",
            text: "Are you sure you want to delete this event.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
        }, (isConfirm) => {
            if (isConfirm) {
                const dataObject = {
                    // _id: Session.get('menuItemSelected'),
                    menuKey: FlowRouter.getParam('menuItem'),
                    // client: FlowRouter.getParam('client'),
                    thisItemId: $(event.target).attr('data-thisItemId'),
                    eventId: $(event.target).attr('data-eventId'),
                };
                Meteor.call('menuItemDev.removeEvent', dataObject,getCookie("selectedSDForSA"), (error, result) => {
                    if (error) {
                        console.log('error', error);
                        showAlert('danger', `Can not remove this event`);
                    }
                    if (result) {
                        showAlert('success', `Event removed successfully`);
                    }
                });
            }
        });

    },
    'click .remove-custom-location-from-query' (event) {
        swal({
            title: "Are you sure?",
            text: "Are you sure you want to delete this location.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
        }, (isConfirm) => {
            if (isConfirm) {
                const dataObject = {
                    menuKey: FlowRouter.getParam('menuItem'),
                    thisItemId: $(event.target).attr('data-thisItemId'),
                    customLocationId: $(event.target).attr('data-customLocationId'),
                };
                Meteor.call('menuItemDev.removeLocation', dataObject,getCookie("selectedSDForSA"), (error, result) => {
                    if (error) {
                        console.log('error', error);
                        showAlert('danger', `Can not remove this event`);
                    }
                    if (result) {
                        showAlert('success', `Event removed successfully`);
                    }
                });
            }
        });

    },
    'click .view-edit-event' (event, templateInstance) {
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
    'click .view-edit-custom-location' (event, templateInstance) {
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
    'keypress #new-menu-Item' (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    },
    'click .menuItem' (event, templateInstance) {
        event.preventDefault();
        $('.button-collapse').sideNav('hide');
        $('.adminLanding').css("display", "none");
        const menuId = $(event.target).attr('id');
        templateInstance.editMenu.set(menuId);
        FlowRouter.go(`/admin/${menuId}`);
    },
    'click .delete-category' (event, inst) {
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
        }, (isConfirm) => {
            if (isConfirm) {
                const deleteObject = {
                    name: $(event.target).attr('id'),
                    menuId: FlowRouter.getParam('menuItem'),
                }
                Meteor.call('menuItemDev.remove', deleteObject,getCookie("selectedSDForSA"), function(error, result) {
                    if (error) {
                        showAlert('danger', `Can not delete this menu item`);
                    } else {
                        showAlert('success', `Menu Item deleted successfully`);
                    }
                });
            }
        });
    },
    'click .edit-menu-item' (event, templateInstance) {
        templateInstance.editItemId.set($(event.target).attr('id'));
        templateInstance.editItemMenuId.set(FlowRouter.getParam('menuItem'));
        $("#editMenuItem").modal('open');
    },
    'click .searchButtons' (event) {
        Session.set('menuItemSelected', $(event.target).attr('id'));
    },
    'click .publish' (event) {
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
        }, function(isConfirm) {
            if (isConfirm) {
                Meteor.call('menuItemDev.publishMenuItems', menuId,getCookie("selectedSDForSA"), function(error, result) {
                    if (error) {
                        showAlert('danger', 'Error while publishing...');
                    } else {
                        showAlert('success', 'Items published successfully')
                    }
                });
            }
        });
    },
    'click .newItemBtn' (event, inst) {
        Session.set('selectedIcon', false);
    },

    "click .openColorPickerEditAdmin" (event, inst) {
        event.preventDefault();
        $(".edit-menu-color2").click();
    },
    'click .edit-menu-color2' (event, inst) {
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
            init: function(elm, colors)  {},
            actionCallback: (evt, action) => {
                //This Callbacks are general throught life cycle. so need to repeat the code.
                if (action === 'changeXYValue' && $('.edit-menu-color2').val()) {
                    $('.edit-menu-icon-img').css('background-color', $('.edit-menu-color2').val() || '#000');
                    $('.edit-menu-icon-color').val($('.edit-menu-color2').val());
                }
            }
        });
    },
    'click .edit-menu-icon-color' (event, inst) {
        $(".edit-menu-color2").click();
    },
    'click .openColorPicker' (event, inst) {
        $('.edit-menu-color2').click();
    },
    'blur .openColorPicker' (event, inst) {
        $('.edit-menu-color2').blur();
    },
    'click #menu-item-color-admin-new-menu-modal' (event, inst) {
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
            init: function(elm, colors)  {},
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
    "click .openColorPickerNewMenuAdmin" (event, inst) {
        event.preventDefault();
        $("#menu-item-color-admin-new-menu-modal").click();
    },
    "change #subDomainForSuperAdmin" (e,t){
      var selectedSDForSA = $(e.currentTarget).val();
      t.selectedDomain.set(selectedSDForSA)
      console.log('selectedSDForSA ',selectedSDForSA)
      if(selectedSDForSA == 'none')
          deleteAllCookies();
      else
      {
        setCookie("selectedSDForSA", selectedSDForSA, 30);
      }
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
