import './editMenuItemModal.html';
import { MenuItemDev } from '/imports/api/menu_item_dev/menu_item_dev.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain,getCookie } from '/imports/startup/both/global_function.js';

import './externalResource.js';
Template.editMenuItemModal.onCreated(function() {
    require('./menuItemModal.css');
    this.editMenuItem = new ReactiveVar(false);
    this.menuKey = new ReactiveVar(false);
    this.menuItemId = new ReactiveVar(false);
    this.loadTemplate = new ReactiveVar(false);
});

Template.editMenuItemModal.onRendered(function () {
    var language = Session.get('langSubmenuEdit');
    // console.log(language);
         $(".allLanguageSubMenuEdit").hide();
        $("."+language).show();
    Meteor.setTimeout(() => {
        $('#editMenuItem').modal({
            ready: (modal, trigger) => {
                
                let itemId = this.data.menuItemId?this.data.menuItemId:'null'
                Meteor.call('menuItemDev.getMenuItemInfo', itemId,getCookie("selectedSDForSA"), (error, result) => {
                    if (error) {
                        // console.log('error', error);
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
        $("#createExternalResource").modal();
        $('#insertMenuIconModal').modal();
    }, 500);
    $('#showMenus').material_select();
});

Template.editMenuItemModal.helpers({
    loadTemplate() {
        return Template.instance().loadTemplate.get() || '';
    },
    externalResourceObject () {
        let inst = Template.instance();
        let itemInfo = inst.editMenuItem.get();
        if (itemInfo && itemInfo.externalResources && itemInfo.externalResources.atdw && itemInfo.externalResources.atdw.srcUrl){
            Session.set('externalResources', itemInfo.externalResources.atdw.srcUrl);
           return itemInfo.externalResources.atdw.srcUrl;
        }
        Session.set('externalResources', '');
        return '';
    },
    editMenuItemData() {
        let inst = Template.instance();
        let itemInfo = inst.editMenuItem.get();
        if(itemInfo && itemInfo.menuKey){
            inst.menuKey.set(itemInfo.menuKey);
            inst.menuItemId.set(itemInfo._id);
        }
        let icon = itemInfo && itemInfo.preference && itemInfo.preference.icon ? itemInfo.preference.icon : false;
        Session.set('selectedIcon',icon);
        if (itemInfo && itemInfo.externalResources && itemInfo.externalResources.atdw && itemInfo.externalResources.atdw.srcUrl)
            Session.set('externalResourceUrl', itemInfo.externalResources.atdw.srcUrl);
        else
            Session.set('externalResourceUrl', '');

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
          return dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_menu_item_dev'].find({}, {fields:{_id:1, name:1,defaultLangForMenu:1}}).fetch()
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
    },
    languagesListForSubMenuEdit () {
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
  forValue(nameObj,langTag) {
    return nameObj[langTag];
  },
});

Template.editMenuItemModal.events({
    'click #editExternalResourcesModal' (event, inst) {
        event.preventDefault();
        $('#atdw-result').css('display','none');
        $('#tree').children().remove();
        $("#createExternalResource").modal('open');
    },
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
                }
            }
        });


    },

    'submit .edit-menu-item-save' (event, inst) {
        event.preventDefault();
        if($(".en #Submenu-name-edit").val() == ""){
            showAlert('danger', 'Please fill english name of menu');
            return false;
        }
        const languages = TAPi18n.getLanguages();
        let name= {};
        _.forEach(languages, (language, tag) => {
              // Get language object
              const languageOption = language;
              // Get language tag (short language name)
              languageOption.tag = tag;
              if($("."+languageOption.tag+" #Submenu-name-edit").val()){
                name[languageOption.tag] = $("."+languageOption.tag+" #Submenu-name-edit").val()
              }
              else{
                    name[languageOption.tag] = $(".en #Submenu-name-edit").val()
              }          
              // Add language option to array
        });
        let itemId = $(event.target).attr('id')
        let setFields = {
            'items.$.name':name,
            'items.$.externalResources.atdw.srcUrl': Session.get('externalResourceUrl') || '',
            'items.$.preference': {
                icon: $("#menu-item-icon").val(),
                colors: $("#menu-item-color-edit-modal").val()
            },
            'items.$.defaultLangforSubmenu':$(".en #Submenu-name-edit").val(),
        }
        let selectedMenuId = $('#showMenus').val();
        let menuId = inst.menuKey.get();
        let menuItemId = inst.menuItemId.get();
        let itemInfo = inst.editMenuItem.get();
        Meteor.call('menuItemDev.updateMenuItem',itemId , setFields,getCookie("selectedSDForSA"), (error, response) => {
            if (error || response.error) {
                // console.log("Error while updating menu item");
                showAlert('danger', 'Error while updating menu item');
            } else {
                if(menuId!=selectedMenuId){
                    moveItemToSelectedMenu(selectedMenuId , menuItemId, menuId, itemInfo);
                }else{
                    showAlert('success', 'Menu item updated successfully');
                }
                Session.set('externalResourceUrl', '')
                $('#editMenuItem').modal('close');
            }
        });
        $('#editMenuItem').modal('close');
    },
});
 
Template.languageSelectEditSubmenu.onRendered(function () {
    this.autorun(() => {
            Meteor.setTimeout(() => {
              $(".SubmenuLangSelect").material_select();
            }, 100);
            $(".allLanguageSubMenuEdit").hide();
        $(".en").show();
        Session.set('langSubmenuEdit','en');
    });
});
Template.languageSelectEditSubmenu.helpers({
  languagesList () {
    
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
  activeLanguage () {
    // Get current language
    const activeLanguage = Session.get('langSubmenuEdit');

    // Get language from the current data context
    const languageTag = this.tag;

    // Add class "selected" to highlight active language
    if (activeLanguage === languageTag) {
      return 'selected';
    }
    return '';
  },
});
Template.languageSelectEditSubmenu.events({
   'change #language-select' (event) {
         // Get language from the current data context
      const language = event.target.value;
     /* const */
      // Update selected language in Session
      Session.set('langSubmenuEdit', language);
      var showMenuClass = Session.get('langSubmenuEdit');
        $(".allLanguageSubMenuEdit").hide();
        $("."+showMenuClass).show();
    },


});
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
            // console.log("Error while moving menu item");
            showAlert('danger', 'Error while moving menu item');
        } else {
            showAlert('success', 'Menu item moved successfully');
        }
    });
}
