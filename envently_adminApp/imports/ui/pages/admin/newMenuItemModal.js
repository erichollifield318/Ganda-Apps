import './newMenuItemModal.html';
import {
    MenuItemDev
} from '/imports/api/menu_item_dev/menu_item_dev.js';
import { getCookie } from '/imports/startup/both/global_function.js';
import { TAPi18n } from 'meteor/tap:i18n';
import './externalResource.js';
import { v4 as uuidv4 } from 'uuid';

Template.newMenuItemModal.onCreated(function() {
    this.loadTemplate = new ReactiveVar(false);
    Session.set('selectedIcon', false);
    require('./menuItemModal.css');
});
Template.newMenuItemModal.onRendered(function() {
    $('.materialboxed').materialbox();
    var showMenuId = Session.get('lang');
    Meteor.setTimeout(() => {
        $('#insertMenuIconModal').modal();
        $("#createExternalResource").modal();
    }, 500)
    require('./languagesSubmenu.css');
    $(".allLanguageSubMenu").hide();
    $("#"+showMenuId).show();
});
Template.newMenuItemModal.helpers({
    externalResourceObject () {
        // console.log("new")
        Session.set('externalResources', '');
        return { externalResourceObject: ''};
    },
    selectedNewMenuIcon() {

        if (Session.get('selectedIcon')) {
            return Session.get('selectedIcon');
        }
        return "star-15";

    },
    initialColor(){

        return "#FFFFFF";

    },
    loadTemplate() {
        return Template.instance().loadTemplate.get() || '';
    },
    languagesListForSubMenu () {
    
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
});
Template.languageSelectSubmenu.onRendered(function() {
  this.autorun(()=>{
    Session.set('lang', 'en');
    $('select').material_select();
  });
  require('./languages.css');
  const selectedLanguage = Session.get('lang');
});
Template.languageSelectSubmenu.helpers({
  languagesListSubmenu () {
    
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
    // console.log("====>",languageOptions);
    return languageOptions;
  },
  activeLanguage () {
    // Get current language
    const activeLanguage = Session.get('lang');

    // Get language from the current data context
    const languageTag = this.tag;

    // Add class "selected" to highlight active language
    if (activeLanguage === languageTag) {
      return 'selected';
    }
    return '';
  },
});
Template.newMenuItemModal.events({
    'click #addExternalResourcesModal' (event, inst) {
        // event.preventDefault();
        $('#atdw-result').css('display','none');
        $('#tree').children().remove();
        $("#createExternalResource").modal('open');

    },
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
                }
            }
        });
    },
    'submit #newMenuItem' (event,inst) {
        event.preventDefault();
         if($("#en #subMenu-name").val() == ""){
            showAlert('danger', 'Please fill english name of menu');
            return false;
        }
        const languages = TAPi18n.getLanguages();
        const name= {};
        _.forEach(languages, (language, tag) => {
              // Get language object
              const languageOption = language;
              // Get language tag (short language name)
              languageOption.tag = tag;
              if($("#"+languageOption.tag+" #subMenu-name").val()){
                name[languageOption.tag] = $("#"+languageOption.tag+" #subMenu-name").val()
              }
              else{
                    name[languageOption.tag] = $("#en #subMenu-name").val()
              }          
              // Add language option to array
        });
        const clientObject = {
            _id: uuidv4(),
            menuKey: FlowRouter.getParam('menuItem'),
            name: name,
            client: FlowRouter.getParam('client'),
            externalResources: { 
                atdw: {
                    srcUrl:  Session.get('externalResourceUrl') || ''
                }
            },
            defaultLangforSubmenu:$("#en #subMenu-name").val(),
            sensis_categories: [],
            sensis_locations: [],
            custom_locations: [],
            events: [],
            preference: {
                icon: $("#menu-item-icon").val(),
                colors: $("#menu-item-color-new-menu").val()
            }
        };
        // console.log(clientObject);
        Meteor.call('menuItemDev.newMenuItem', clientObject,getCookie("selectedSDForSA"), (error, response) => {
            if (error || response.error) {
                showAlert('info', `${clientObject.defaultLangforSubmenu} is Already Selected, try another name.`)
            } else {
                Session.set('externalResourceUrl',false);
                showAlert('success', `You just added ${clientObject.defaultLangforSubmenu} to the menu`)
                _.forEach(languages, (language, tag) => {
                    // Get language object
                    const languageOption = language;
                    // Get language tag (short language name)
                    languageOption.tag = tag;
                    $("#"+languageOption.tag+" #subMenu-name").val("");
                });
                $("#createMenuItem").modal('close');
            }
        });
    }
});
Template.languageSelectSubmenu.events({
   'change #language-select' (event) {
         // Get language from the current data context
      const language = event.target.value;
     /* const */
      // Update selected language in Session
      Session.set('lang', language);
      var showMenuId = Session.get('lang');
        $(".allLanguageSubMenu").hide();
        $("#"+showMenuId).show();
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
