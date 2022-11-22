import './editMenuItemModal.html';
import { MenuItemDev } from '/imports/api/menu_item_dev/menu_item_dev.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain,getCookie } from '/imports/startup/both/global_function.js';
Template.editMenuItemModal.onCreated(function() {
    require('./menuItemModal.css');
    this.editMenuItem = new ReactiveVar(false);
    this.menuKey = new ReactiveVar(false);
    this.menuItemId = new ReactiveVar(false);
});

Template.editMenuItemModal.onRendered(function () {
    Meteor.setTimeout(() => {
        $('#editMenuItem').modal({
            ready: (modal, trigger) => {
                let itemId = this.data.menuItemId?this.data.menuItemId:'null'
                Meteor.call('menuItemDev.getMenuItemInfo', itemId,getCookie("selectedSDForSA"), (error, result) => {
                    if (error) {
                        console.log('error', error);
                    }
                    this.editMenuItem.set(result);
                });
            },
            complete: () => {
                Session.set('selectedIcon',false);
                this.menuKey.set(false);
                this.menuItemId.set(false);
            }
        });
        $('#insertMenuIconModal').modal();
    }, 500);
    $('#showMenus').material_select();
});

Template.editMenuItemModal.helpers({
    editMenuItemData() {
        let inst = Template.instance();
        let itemInfo = inst.editMenuItem.get();
        if(itemInfo && itemInfo.menuKey){
            inst.menuKey.set(itemInfo.menuKey);
            inst.menuItemId.set(itemInfo._id);
        }
        let icon = itemInfo && itemInfo.preference && itemInfo.preference.icon ? itemInfo.preference.icon : false;
        Session.set('selectedIcon',icon);
        return itemInfo;
    },
    selectedUpdateMenuIcon(){
        let inst = Template.instance();
        let itemInfo = inst.editMenuItem.get();
        if (Session.get('selectedIcon')) {
            return Session.get('selectedIcon');
        }else{
            return itemInfo.preference.icon;
        }
    },
    getMenus(){
        if(getSubdomain(getCookie("selectedSDForSA")))
        {
          return dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_menu_item_dev'].find({}, {fields:{_id:1, name:1}}).fetch()
        }
        else {
          return MenuItemDev.find({}, {fields:{_id:1, name:1}}).fetch()
        }
    },
    initialColor(){
        let inst = Template.instance();
        let itemInfo = inst.editMenuItem.get();
        return itemInfo.preference.colors||"#FFFFFF";
    },

    selected(id){
        let inst = Template.instance();
        if(id===inst.menuKey.get()){
            return 'selected';
        }
    }
});

Template.editMenuItemModal.events({
    "click .openColorPickerEditMenu"(event,inst){
        event.preventDefault();
        $("#menu-item-color-edit-modal").click();
    },
    'click #menu-item-color-edit-modal'(event,inst){
        if (!$('#menu-item-color-edit-modal').val()) {
            $('#menu-item-color-edit-modal').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        var colors2 = jsColorPicker('#menu-item-color-edit-modal', {
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
            appenTo: document.getElementById('outColorPickereditmodal'),
            init: function(elm, colors)  {},
            actionCallback: (evt, action) => {
                //This Callbacks are general throught life cycle. so need to repeat the code.
                if (action === 'changeXYValue' && $('#menu-item-color-edit-modal').val()) {
                    $('.edit-menu-icon-img.img').css('background-color', $('#menu-item-color-edit-modal').val() || '#000');
                    $('.edit-menu-icon-img.img').val($('#menu-item-color-edit-modal').val());
                    $('.edit-menu-icon-color').val($('#menu-item-color-edit-modal').val());
                }
            }
        });


    },

    'click .edit-menu-item-save' (event, inst) {
        let itemId = $(event.target).attr('id')
        let setFields = {
            'items.$.name': $('#edit-menu-Item').val(),
            'items.$.preference': {
                icon: $("#menu-item-icon").val(),
                colors: $("#menu-item-color-edit-modal").val()
            }
        }
        let selectedMenuId = $('#showMenus').val();
        let menuId = inst.menuKey.get();
        let menuItemId = inst.menuItemId.get();
        let itemInfo = inst.editMenuItem.get();
        Meteor.call('menuItemDev.updateMenuItem',itemId , setFields,getCookie("selectedSDForSA"), (error, response) => {
            if (error || response.error) {
                console.log("Error while updating menu item");
                showAlert('danger', 'Error while updating menu item');
            } else {
                if(menuId!=selectedMenuId){
                    moveItemToSelectedMenu(selectedMenuId , menuItemId, menuId, itemInfo);
                }else{
                    showAlert('success', 'Menu item updated successfully');
                }
            }
        });
        $('#editMenuItem').modal('close');
    },

    // 'click .updateIcon'(event, inst){
    //     let icon = $(event.currentTarget.children[0]).text();
    //     icon = icon.split(".");
    //     $('#insertMenuIconModal').modal('close');
    //     seletedItemIcon.set(icon[0]);
    // }
})

function showAlert(type, message){
    Bert.alert({
        title: 'Hey there!',
        message: message,
        type: type,
        style: 'growl-top-right',
        icon: 'fa-check',
    });
}

function moveItemToSelectedMenu(selectedMenuId , menuItemId, menuId, itemInfo){
    itemInfo['menuKey'] = selectedMenuId;
    itemInfo['name'] = $('#edit-menu-Item').val();
    itemInfo['preference'] = {
        icon: $("#menu-item-icon").val(),
        colors: $("#menu-item-color-edit-modal").val()
    };
    Meteor.call('menuItemDev.moveItemToSelectedMenu',selectedMenuId , menuItemId, menuId, itemInfo,getCookie("selectedSDForSA"), (error, response) => {
        if (error) {
            console.log("Error while moving menu item");
            showAlert('danger', 'Error while moving menu item');
        } else {
            showAlert('success', 'Menu item moved successfully');
        }
    });
}
