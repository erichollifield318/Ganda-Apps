import './newMenuItemModal.html';
import {
    MenuItemDev
} from '/imports/api/menu_item_dev/menu_item_dev.js';
import { getCookie } from '/imports/startup/both/global_function.js';

Template.newMenuItemModal.onCreated(function() {
    Session.set('selectedIcon', false);
    require('./menuItemModal.css');
});
Template.newMenuItemModal.onRendered(function() {
    $('.materialboxed').materialbox();
    Meteor.setTimeout(() => {
        $('#insertMenuIconModal').modal();
    }, 500)
});
Template.newMenuItemModal.helpers({
    selectedNewMenuIcon() {

        if (Session.get('selectedIcon')) {
            return Session.get('selectedIcon');
        }
        return "star-15";

    },
    initialColor(){

        return "#FFFFFF";

    }
});
Template.newMenuItemModal.events({
    "click .openColorPickerNewMenu" (event, inst) {
        event.preventDefault();
        $("#menu-item-color-new-menu").click();
    },
    'click #menu-item-color-new-menu' (event, inst) {
        if (!$('#menu-item-color-new-menu').val()) {
            $('#menu-item-color-new-menu').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        var colors3 = jsColorPicker('#menu-item-color-new-menu', {
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
            appenTo: document.getElementById('outColorPickerNewMenu'),
            init: function(elm, colors)  {},
            actionCallback: (evt, action) => {
                //This Callbacks are general throught life cycle. so need to repeat the code.
                if (action === 'changeXYValue' && $('#menu-item-color-new-menu').val()) {
                    $('.edit-menu-icon-img.img').css('background-color', $('#menu-item-color-new-menu').val() || '#000');
                    $('.edit-menu-icon-img.img').val($('#menu-item-color-new-menu').val());
                    $('#edit-menu-icon-color-new-menu').val($('#menu-item-color-new-menu').val());
                }
            }
        });
    },
    'click #newMenuItem' (inst) {
        // Build object to insert
        const clientObject = {
            _id: Meteor.uuid(),
            menuKey: FlowRouter.getParam('menuItem'),
            name: $('#new-menu-Item').val(),
            client: FlowRouter.getParam('client'),
            sensis_categories: [],
            sensis_locations: [],
            custom_locations: [],
            events: [],
            preference: {
                icon: $("#menu-item-icon").val(),
                colors: $("#menu-item-color-new-menu").val()
            }
        };
        Meteor.call('menuItemDev.newMenuItem', clientObject,getCookie("selectedSDForSA"), (error, response) => {
            if (error || response.error) {
                showAlert('info', `${clientObject.name} is Already Selected, try another name.`)
            } else {
                showAlert('success', `You just added ${clientObject.name} to the menu`)
            }
        });
    }
    // 'click .insertIcon'(event, inst){
    //     let icon = $(event.currentTarget.children[0]).text();
    //     icon = icon.split(".");
    //     $('#insertMenuIconModal').modal('close');
    //     seletedItemIcon.set(icon[0]);
    // },
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

function moveItemToSelectedMenu(selectedMenuId, menuItemId, menuId, itemInfo) {
    itemInfo['menuKey'] = selectedMenuId;
    itemInfo['name'] = $('#edit-menu-Item').val();
    itemInfo['preference'] = {
        icon: $("#edit-menu-item-icon").val(),
        colors: $("#edit-menu-item-color").val()
    };
    Meteor.call('menuItemDev.moveItemToSelectedMenu', selectedMenuId, menuItemId, menuId, itemInfo,getCookie("selectedSDForSA"), (error, response) => {
        if (error) {
            showAlert('danger', 'Error while moving menu item');
        } else {
            showAlert('success', 'Menu item moved successfully');
        }
    });
}
