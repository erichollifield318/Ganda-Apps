//import { Subdomain } from '/imports/api/subdomain/subdomain.js';
import { getCookie, getSubdomain } from '/imports/startup/both/global_function.js';
import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';

import './selectColors.html';

Template.chooseColors.onCreated(function() {
    require('./selectColors.css');
    /*this.colorsObject = new ReactiveVar(false);*/
    this.bottomLocationDetails = new ReactiveVar(false);
    this.bottomSheetSubMenu = new ReactiveVar(false);
    this.brandingmodal = new ReactiveVar(false);
    this.enquiryModal = new ReactiveVar(false);
    this.locationInfoPopup = new ReactiveVar(false);
    this.bottomSheetLocationList = new ReactiveVar(false);
    this.menuList = new ReactiveVar(false);
    this.sideNavModal = new ReactiveVar(false);
    this.admin_settings = new ReactiveVar(false);
    this.termsModal = new ReactiveVar(false);
    this.feedbackModal = new ReactiveVar(false);
    this.privacyModal = new ReactiveVar(false);
    this.copyrightModal = new ReactiveVar(false);
    
});

Template.chooseColors.onRendered(function () {
      

});


Template.chooseColors.helpers({


    initialColor() {
        let inst = Template.instance();
        let adminSetting = {};
        if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
                adminSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getSubdomain(getCookie("selectedSDForSA")) });
                
        } else {
            adminSetting = AdminSettings.find();   
        }
        let colors = adminSetting && adminSetting.colors ? adminSetting.colors : {};
        // console.log(colors)

        if (colors) {
            Template.instance().brandingmodal.set(colors.brandingModal || false);

            Template.instance().enquiryModal.set(colors.enquiryModal || false);

            Template.instance().bottomSheetSubMenu.set(colors.bottomSheetSubMenu || false);

            Template.instance().bottomLocationDetails.set(colors.bottomLocationDetails || false);

            Template.instance().sideNavModal.set(colors.sideNavModal || false);

            Template.instance().bottomSheetLocationList.set(colors.bottomSheetLocationList || false);

            Template.instance().locationInfoPopup.set(colors.locationInfoPopup || false);

            Template.instance().menuList.set(colors.landingPageModal || false);

            Template.instance().termsModal.set(colors.termsModal || false);

            Template.instance().feedbackModal.set(colors.feedbackModal || false);

            Template.instance().privacyModal.set(colors.privacyModal || false);

            Template.instance().copyrightModal.set(colors.copyrightModal || false);
        }

        /*let brandingModal = colors.brandingModal || [];
        let enquiryModal = colors.enquiryModal || [];
        let bottomSheetSubMenu = colors.bottomSheetSubMenu || [];
        let bottomLocationDetails = colors.bottomLocationDetails || [];
        let mapBox = colors.mapBox || [];
        let sideNavModal = colors.sideNavModal || [];
        let bottomSheetLocationList = colors.bottomSheetLocationList || [];
        let locationInfoPopup = colors.locationInfoPopup || [];
        let menuList = colors.menuList || [];

        Template.instance().brandingmodal.set(brandingModal);
        Template.instance().enquiryModal.set(enquiryModal);
        Template.instance().bottomSheetSubMenu.set(bottomSheetSubMenu);
        Template.instance().bottomLocationDetails.set(bottomLocationDetails);
        Template.instance().mapBox.set(mapBox);
        Template.instance().sideNavModal.set(sideNavModal);
        Template.instance().bottomSheetLocationList.set(bottomSheetLocationList);
        Template.instance().locationInfoPopup.set(locationInfoPopup);
        Template.instance().menuList.set(menuList);*/

    },

    brandinginitialColor() {
        
        
        let brandingColors = Template.instance().brandingmodal.get();
        let color = {
            'callButtonColor': '#ff7f27',
            'enquiryButtonColor': '#6d6b6b',
            'modalColor': '#6d6b6b',
            'websiteButtonColor': '#22b14c',
            'bodyFontColor': '#d8d8d8',
            'buttonFontColor': '#d8d8d8',
            'headerFontColor':'#d8d8d8',
            'footerColor': '#fafafa',
            'cancleIconColor': '#343434',
            'cancleIconTextColor': '#343434',
            'iconHeadingColor': '#ffffff'
        };
        if (brandingColors) {
            color = { 
                'callButtonColor': brandingColors.callButtonColor || '#ff7f27',
                'enquiryButtonColor': brandingColors.enquiryButtonColor || '#6d6b6b',
                'modalColor': brandingColors.modalColor || '#6d6b6b',
                'websiteButtonColor': brandingColors.websiteButtonColor || '#22b14c',
                'bodyFontColor': brandingColors.bodyFontColor || '#d8d8d8',
                'buttonFontColor': brandingColors.buttonFontColor || '#d8d8d8',
                'headerFontColor': brandingColors.headerFontColor ||'#d8d8d8',
                'footerColor': brandingColors.footerColor ||'#fafafa',
                'cancleIconColor': brandingColors.cancleIconColor || '#343434',
                'cancleIconTextColor': brandingColors.cancleIconTextColor || '#343434',
                'iconHeadingColor': brandingColors.iconHeadingColor || '#ffffff'
            };

        } /*else {
            
            color = { 
                'callButtonColor': brandingColors.callButtonColor,
                'enquiryButtonColor': brandingColors.enquiryButtonColor,
                'modalColor': brandingColors.modalColor,
                'websiteButtonColor': brandingColors.websiteButtonColor,
                'bodyFontColor': brandingColors.bodyFontColor,
                'buttonFontColor': brandingColors.buttonFontColor,
                'headerFontColor':brandingColors.headerFontColor
            }
        } */
        return color;
    },

    initialEnquiryModal() {
        let adminColors = Template.instance().enquiryModal.get();
        let colors = {
            'modalBackgroundColor': '#484848',
            'labelFontColor': '#fff',
            'headingFontColor': '#fff',
            'hoverColor': '#fff',
            'closeButtonBackgroundColor': '#fff' ,
            'closeButtontextColor': '#343434',
            'submitButtonBackgroundColor': '#fff' ,
            'submitButtonTextColor': '#343434',
            'footerBackgroundColor': '#fff',
            'inputBorderColor': '#fff',
            'inputBoxShadowColor': '#fff'
        };
        if (adminColors) {
            colors = { 
                'modalBackgroundColor': adminColors.modalBackgroundColor || '#484848',
                'labelFontColor': adminColors.labelFontColor || '#fff',
                'headingFontColor': adminColors.headingFontColor || '#fff',
                'hoverColor':  adminColors.hoverColor || '#fff',
                'closeButtonBackgroundColor': adminColors.closeButtonBackgroundColor || '#fff' ,
                'closeButtontextColor': adminColors.closeButtontextColor || '#343434',
                'submitButtonBackgroundColor': adminColors.submitButtonBackgroundColor || '#fff' ,
                'submitButtonTextColor': adminColors.submitButtonTextColor || '#343434',
                'footerBackgroundColor': adminColors.footerBackgroundColor || '#fff',
                'inputBorderColor': adminColors.inputBorderColor || '#fff',
                'inputBoxShadowColor': adminColors.inputBoxShadowColor || '#fff'
           
            };
        } /*else {
            colors = {
                'modalBackgroundColor': adminColors.modalBackgroundColor,
                'labelFontColor': adminColors.labelFontColor,
                'headingFontColor': adminColors.headingFontColor
            }
        }*/
        return colors;
    },

    initialBottomLocationDetails() {
        
        let adminColors = Template.instance().bottomLocationDetails.get();
        let colors = {
            'callButtonColor': '#ff7f27', 
            'directionButtonColor': '#00a2e8',
            'modalBackgroundColor': '#484848',
            'modalFooterBackgroundColor': '#484848',
            'shareButtonColor': '#484848',
            'shareButtonTextColor': '#ffffff',
            'websiteButtonColor': '#22b14c',
            'infoFontColor': '#ffffff',
            'headingFontColor': '#ffffff',
            'imageBackgroundColor': '#484848',
            'horizontalLineColor': '#ff7f27',
            'keyTextColor': '#fff',
            'valuetextColor': '#fff',
            'closeButtonTextColor': '#fff',
            'closeButtonbackgroundColor': '#484848',
            
        };
        if (adminColors) {
            colors = { 
                'callButtonColor': adminColors.callButtonColor || '#ff7f27', 
                'directionButtonColor': adminColors.directionButtonColor || '#00a2e8',
                'modalBackgroundColor': adminColors.modalBackgroundColor || '#484848',
                'modalFooterBackgroundColor': adminColors.modalFooterBackgroundColor || '#484848',
                'shareButtonColor': adminColors.shareButtonColor || '#484848',
                'shareButtonTextColor': adminColors.shareButtonTextColor || '#ffffff',
                'websiteButtonColor': adminColors.websiteButtonColor || '#22b14c',
                'infoFontColor': adminColors.infoFontColor || '#ffffff',
                'headingFontColor': adminColors.headingFontColor || '#ffffff',
                'imageBackgroundColor': adminColors.imageBackgroundColor || '#484848',
                'horizontalLineColor': adminColors.horizontalLineColor || '#ff7f27',
                'keyTextColor': adminColors.keyTextColor || '#fff',
                'valuetextColor': adminColors.valuetextColor || '#fff',
                'closeButtonTextColor': adminColors.closeButtonTextColor || '#fff',
                'closeButtonbackgroundColor': adminColors.closeButtonbackgroundColor || '#484848',
                
            };
        } /*else {
            colors = {
                'callButtonColor': adminColors.callButtonColor, 
                'directionButtonColor': adminColors.directionButtonColor,
                'modalBackgroundColor': adminColors.modalBackgroundColor,
                'modalFooterBackgroundColor': adminColors.modalFooterBackgroundColor,
                'shareButtonColor': adminColors.shareButtonColor,
                'websiteButtonColor': adminColors.websiteButtonColor,
                'infoFontColor': adminColors.infoFontColor,
                'headingFontColor': adminColors.headingFontColor
            }
        }*/
        //console.log("aaaaaaaaaaaaaaa", colors)
        return colors;
    },

    initialBottomSheetSubMenu() {
        let adminColors = Template.instance().bottomSheetSubMenu.get();
        let colors = {
            'headerBackgroundColor': '#939597', 
           /* 'iconBackgroundColor': '#01a3e2',*/
            /*'iconColor': '#ffffff',*/
            'listBackgroundColor': '#fafafa',
            'headingFontColor': '#ffffff',
            'iconBoxColor': '#dbdcde',
            'listFontColor': '#1c1c1c',
            'closeButtonBackgroundColor': '#ffffff',
            'closeButtonTextColor': 'fff',
            'modalBackgroundColor': '#888a8c'
        };
        if (adminColors) {
            colors = { 
                'headerBackgroundColor': adminColors.headerBackgroundColor || '#939597', 
                /*'iconBackgroundColor': adminColors.iconBackgroundColor || '#01a3e2',*/
                /*'iconColor': adminColors.iconColor || '#ffffff',*/
                'listBackgroundColor': adminColors.listBackgroundColor || '#fafafa',
                'headingFontColor': adminColors.headingFontColor || '#ffffff',
                'iconBoxColor': adminColors.iconBoxColor || '#dbdcde',
                'listFontColor': adminColors.listFontColor || '#1c1c1c',
                'closeButtonBackgroundColor': adminColors.closeButtonBackgroundColor || '#ffffff',
                'closeButtonTextColor': adminColors.closeButtonTextColor || 'fff',
                'modalBackgroundColor': adminColors.modalBackgroundColor || '#888a8c'
            };
        } /*else {
            colors = {
                'headerBackgroundColor': adminColors.headerBackgroundColor,
                'iconBackgroundColor':adminColors.iconBackgroundColor,
                'iconColor':adminColors.iconColor,
                'listBackgroundColor':adminColors.listBackgroundColor,
                'headingFontColor': adminColors.headingFontColor,
                'iconBoxColor': adminColors.iconBoxColor,
                'listFontColor': adminColors.listFontColor,
            }
        }*/
        return colors;
       
    },



    initialLocationInfoPopup() {
        let adminColors = Template.instance().locationInfoPopup.get();
        let colors = {
            'callButtonColor': '#ef6c00', 
            'detailsButtonColor': '#43A047',
            'directionButtonColor': '#1E88E5',
            'modalBackgroundColor': '#0c0c0c',
            'buttonTextColor': '#fff',
            'locationNameFontColor': '#fff',
            'locationInfoFontColor': '#b9b9b8',
            'directionButtonTextColor': '#fff',
            'callButtonTextColor': '#fff',
            'detailsButtonTextColor': '#fff',
            'crossButtonColor': '#fff'
        };
        if (adminColors) {
            colors = { 
                'callButtonColor': adminColors.callButtonColor || '#ef6c00', 
                'detailsButtonColor': adminColors.detailsButtonColor || '#43A047',
                'directionButtonColor': adminColors.directionButtonColor || '#1E88E5',
                'modalBackgroundColor': adminColors.modalBackgroundColor || '#0c0c0c',
                'buttonTextColor': adminColors.buttonTextColor || '#fff',
                'locationNameFontColor': adminColors.locationNameFontColor || '#fff',
                'locationInfoFontColor': adminColors.locationInfoFontColor || '#b9b9b8',
                'directionButtonTextColor': adminColors.directionButtonTextColor || '#fff',
                'callButtonTextColor': adminColors.callButtonTextColor || '#fff',
                'detailsButtonTextColor': adminColors.detailsButtonTextColor || '#fff',
                'crossButtonColor': adminColors.crossButtonColor || '#fff'
            };
        } /*else {
            colors = {
               'callButtonColor': adminColors.callButtonColor, 
                'detailsButtonColor': adminColors.detailsButtonColor,
                'directionButtonColor': adminColors.directionButtonColor,
                'modalBackgroundColor': adminColors.modalBackgroundColor,
                'buttonTextColor': adminColors.buttonTextColor,
                'locationNameFontColor': adminColors.locationNameFontColor,
                'locationInfoFontColor': adminColors.locationInfoFontColor
            }
        }*/
        return colors;
    },

    initialMenuList() {
        let adminColors = Template.instance().menuList.get();
        let colors = {
            'footerBackgroundColor': '#939597', 
            /*'iconBackgroundColor': '#cf8757',*/
            /*'iconColor': '#ffffff',*/
            'nameBackgroundColor': '#757575',
            'searchBarBackgroundColor': '#616161',
            'showMenusButtonColor': '#000',
            'menuTextColor': '#fff',
            'searchBarTextColor': '#fff',
            'headingTextColor': '#fff866',
            'subHeadingTextColor': '#fff866',
            'footerButtonTextColor': '#ffffff',
            'searchbarCloseButtonColor': '#000',
            'searchBarSearchIconColor': '#D0D0D0',
            'sideNavOpenIconColor': '#ffffff'
        };
        if (adminColors) {
            colors = { 
                'footerBackgroundColor': adminColors.footerBackgroundColor || '#939597', 
                /*'iconBackgroundColor': adminColors.iconBackgroundColor || '#cf8757',*/
                /*'iconColor': adminColors.iconColor || '#ffffff',*/
                'nameBackgroundColor': adminColors.nameBackgroundColor || '#757575',
                'searchBarBackgroundColor': adminColors.searchBarBackgroundColor || '#616161',
                'showMenusButtonColor': adminColors.showMenusButtonColor || '#000',
                'menuTextColor': adminColors.menuTextColor || '#fff',
                'searchBarTextColor': adminColors.searchBarTextColor ||'#fff',
                'headingTextColor': adminColors.headingTextColor ||'#fff866',
                'subHeadingTextColor': adminColors.subHeadingTextColor ||'#fff866',
                'footerButtonTextColor': adminColors.footerButtonTextColor ||'#ffffff',
                'searchbarCloseButtonColor': adminColors.searchbarCloseButtonColor ||'#000',
                'searchBarSearchIconColor': adminColors.searchBarSearchIconColor ||'#D0D0D0',
                'sideNavOpenIconColor': adminColors.sideNavOpenIconColor ||'#ffffff'
            };
        } /*else {
            colors = {
               'footerBackgroundColor': adminColors.footerBackgroundColor, 
                'iconBackgroundColor': adminColors.iconBackgroundColor,
                'iconColor': adminColors.iconColor,
                'nameBackgroundColor': adminColors.nameBackgroundColor,
                'searchBarBackgroundColor': adminColors.searchBarBackgroundColor,
                'showMenusButtonColor': adminColors.showMenusButtonColor,
                'menuTextColor': adminColors.menuTextColor,
                'searchBarTextColor': adminColors.searchBarTextColor
            }
        }*/
        return colors;
    },

    initialSideNavModal() {
        let adminColors = Template.instance().sideNavModal.get();
        let colors = {
            'modalBackgroundColor': '#484848',
            'textColor': '#ffffff',
            'headingTextColor': '#ffffff'
        };
        if (adminColors) {
            colors = { 
                'modalBackgroundColor': adminColors.modalBackgroundColor || '#484848',
                'textColor': adminColors.textColor || '#ffffff',
                'headingTextColor': adminColors.headingTextColor || '#ffffff'
            };
        } /*else {
            colors = {
               'modalBackgroundColor': adminColors.modalBackgroundColor,
               'textColor': adminColors.textColor
            }
        }*/
        return colors;
    },

    initialBottomSheetLocationList() {
       let adminColors = Template.instance().bottomSheetLocationList.get();
        
        let colors = {
            'callButtonColor': '#ef6c00',
            'detailsButtonColor': '#43A047',
            'directionButtonColor': '#1E88E5',
            'modalBackgroundColor': '#323232',
            'modalBorderColor': '#fff',
            'buttonTextColor': '#fff',
            'locationNameFontColor': '#fff',
            'locationInfoFontColor': '#b9b9b8',
            'closeButtonNackgroundColor': '#fff',
            'closeButtonTextColor': '#888a8c',
            'directionButtonTextColor': '#fff',
            'callButtonTextColor': '#fff',
            'detailsButtonTextColor': '#fff',

        };
        if (adminColors) {
            colors = { 
                'callButtonColor': adminColors.callButtonColor || '#ef6c00',
                'detailsButtonColor': adminColors.detailsButtonColor || '#43A047',
                'directionButtonColor': adminColors.directionButtonColor || '#1E88E5',
                'modalBackgroundColor': adminColors.modalBackgroundColor || '#323232',
                'modalBorderColor': adminColors.modalBorderColor || '#fff',
                'buttonTextColor': adminColors.buttonTextColor || '#fff',
                'locationNameFontColor': adminColors.locationNameFontColor || '#fff',
                'locationInfoFontColor': adminColors.locationInfoFontColor || '#b9b9b8',
                'closeButtonNackgroundColor': adminColors.closeButtonNackgroundColor || '#fff',
                'closeButtonTextColor': adminColors.closeButtonTextColor || '#888a8c',
                'directionButtonTextColor': adminColors.directionButtonTextColor || '#fff',
                'callButtonTextColor': adminColors.callButtonTextColor || '#fff',
                'detailsButtonTextColor': adminColors.detailsButtonTextColor || '#fff',
                
            };
        } /*else {
            colors = {
               'callButtonColor': adminColors.callButtonColor,
                'detailsButtonColor': adminColors.detailsButtonColor,
                'directionButtonColor': adminColors.directionButtonColor,
                'modalBackgroundColor': adminColors.modalBackgroundColor,
                'modalBorderColor': adminColors.modalBorderColor,
                'buttonTextColor': adminColors.buttonTextColor,
                'locationNameFontColor': adminColors.locationNameFontColor,
                'locationInfoFontColor': adminColors.locationInfoFontColor
            }
        }*/
        return colors;
    },

    initialFeedbackModal() {
        let adminColors = Template.instance().feedbackModal.get();
        //console.log('adminColors', adminColors)
        let colors = {
            'SentButtonTextColor': '#262626',
            'backgroundColor': '#fafafa',
            'bodyTextColor': '#262626',
            'closeButtonTextColor': '#262626',
            'footerBackgroundColor': '#fff',
            'headingTextColor': '#262626',
            'inputBoxBorderColor': '#262626',
            'footerTopBorderColor': '#BBBBBB'
        };
        if (adminColors) {
            colors = {
                'SentButtonTextColor': adminColors.SentButtonTextColor || '#262626',
                'backgroundColor': adminColors.backgroundColor || '#fafafa',
                'bodyTextColor': adminColors.bodyTextColor || '#262626',
                'closeButtonTextColor': adminColors.closeButtonTextColor || '#262626',
                'footerBackgroundColor': adminColors.footerBackgroundColor || '#fff',
                'headingTextColor': adminColors.headingTextColor || '#262626    ',
                'inputBoxBorderColor': adminColors.inputBoxBorderColor || '#262626',
                'footerTopBorderColor': adminColors.footerTopBorderColor || '#BBBBBB'
            }
        }
        //console.log('footer Color:::::', colors)
        return colors;
    },

    initialTermsModal() {
        let adminColors = Template.instance().termsModal.get();
        let colors = {
            'backgroundColor': '#6D6B6B',
            'bodyTextColor': '#fff',
            'closeButtonTextColor': '#070707',
            'footerBackgroundColor': '#fafafa',
            'headingTextColor': '#fff'
        };
        if (adminColors) {
            colors = {
                'backgroundColor': adminColors.backgroundColor || '#6D6B6B',
                'bodyTextColor': adminColors.bodyTextColor || '#fff',
                'closeButtonTextColor': adminColors.closeButtonTextColor || '#070707',
                'footerBackgroundColor': adminColors.footerBackgroundColor || '#fafafa',
                'headingTextColor': adminColors.headingTextColor || '#fff'
            }
        }
        return colors;
    },

    initialCopyrightModal() {
        let adminColors = Template.instance().copyrightModal.get();
        let colors = {
            'backgroundColor': '#6D6B6B',
            'bodyTextColor': '#fff',
            'closeButtonTextColor': '#070707',
            'footerBackgroundColor': '#fafafa',
            'headingTextColor': '#fff'
        };
        if (adminColors) {
            colors = {
                'backgroundColor': adminColors.backgroundColor || '#6D6B6B',
                'bodyTextColor': adminColors.bodyTextColor || '#fff',
                'closeButtonTextColor': adminColors.closeButtonTextColor || '#070707',
                'footerBackgroundColor': adminColors.footerBackgroundColor || '#fafafa',
                'headingTextColor': adminColors.headingTextColor || '#fff'
            }
        }
        return colors;
    },

    initialPrivacyModal() {
        let adminColors = Template.instance().privacyModal.get();
        let colors = {
            'backgroundColor': '#6D6B6B',
            'bodyTextColor': '#fff',
            'closeButtonTextColor': '#070707',
            'footerBackgroundColor': '#fafafa',
            'headingTextColor': '#fff'
        };
        if (adminColors) {
            colors = {
                'backgroundColor': adminColors.backgroundColor || '#6D6B6B',
                'bodyTextColor': adminColors.bodyTextColor || '#fff',
                'closeButtonTextColor': adminColors.closeButtonTextColor || '#070707',
                'footerBackgroundColor': adminColors.footerBackgroundColor || '#fafafa',
                'headingTextColor': adminColors.headingTextColor || '#fff'
            }
        }
        return colors;
    }

});


Template.chooseColors.events ({

	'click .branding-modal-color' (event, inst) {
        
        if (!$('#branding-modal-color').val()) {
            $('#branding-modal-color').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        colorPicker('#branding-modal-color', 'branding-modal-color-open', '.openColorPickerNewMenuAdmin1');
    },

    'click #branding-website-button' (event, inst) {
        if (!$('#branding-website-button').val()) {
            $('#branding-website-button').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        colorPicker('#branding-website-button', 'branding-website-button-open', '..openColorPickerNewMenuAdmin2');
    },

    'click #branding-cross-text-color' (event, inst) {
        if (!$('#branding-cross-text-color').val()) {
            $('#branding-cross-text-color').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        colorPicker('#branding-cross-text-color', 'branding-cross-text-color-open', '.branding-cross-text-color-div');
    },

    'click #branding-call-button' (event, inst) {
        if (!$('#branding-call-button').val()) {
            $('#branding-call-button').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        colorPicker('#branding-call-button', 'branding-call-button-open', '.openColorPickerNewMenuAdmin3');
    },

    'click #branding-footer-button' (event, inst) {
        if (!$('#branding-footer-button').val()) {
            $('#branding-footer-button').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        colorPicker('#branding-footer-button', 'branding-footer-button-open', '.openColorPickerNewMenuAdmin4');
    },

    'click #menu-list-sideNav-opener' (event, inst) {
        if (!$('#menu-list-sideNav-opener').val()) {
            $('#menu-list-sideNav-opener').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        colorPicker('#menu-list-sideNav-opener', 'menu-list-sideNav-opener-open', '.menu-list-sideNav-opener-div');
    },

    'click #branding-footer-color' (event, inst) {
        if (!$('#branding-footer-color').val()) {
            $('#branding-footer-color').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        colorPicker('#branding-footer-color', 'branding-footer-color-open', '.branding-footer-color-div');
    },

    'click #branding-cross-color' (event, inst) {
        if (!$('#branding-cross-color').val()) {
            $('#branding-cross-color').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        colorPicker('#branding-cross-color', 'branding-cross-color-open', '.branding-cross-color-div');
    },

    'click #icon-heading-color' (event, inst) {
        if (!$('#icon-heading-color').val()) {
            $('#icon-heading-color').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        colorPicker('#icon-heading-color', 'icon-heading-color-open', '.icon-heading-color-div');
    },

    'click #bottom-details-direction-button' (event, inst) {
        if (!$('#bottom-details-direction-button').val()) {
            $('#bottom-details-direction-button').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        colorPicker('#bottom-details-direction-button', 'bottom-details-direction-button-open', '.openColorPickerNewMenuAdmin5');
    },

    'click #bottom-details-horizontal-line-color' (event, inst) {
        if (!$('#bottom-details-horizontal-line-color').val()) {
            $('#bottom-details-horizontal-line-color').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        colorPicker('#bottom-details-horizontal-line-color', 'bottom-details-horizontal-line-color-open', '.bottom-details-horizontal-line-color-div');
    },

    'click #bottom-details-image-color' (event, inst) {
        if (!$('#bottom-details-image-color').val()) {
            $('#bottom-details-image-color').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        colorPicker('#bottom-details-image-color', 'bottom-details-image-color-open', '.bottom-details-image-color-div');
    },

    'click #bottom-details-closeButton-color' (event, inst) {
        if (!$('#bottom-details-closeButton-color').val()) {
            $('#bottom-details-closeButton-color').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        colorPicker('#bottom-details-closeButton-color', 'bottom-details-closeButton-color-open', '.bottom-details-closeButton-color-div');
    },

    'click #bottom-details-closeButton-text-color' (event, inst) {
        if (!$('#bottom-details-closeButton-text-color').val()) {
            $('#bottom-details-closeButton-text-color').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        colorPicker('#bottom-details-closeButton-text-color', 'bottom-details-closeButton-text-color-open', '.bottom-details-closeButton-text-color-div');
    },

    'click #bottom-details-info-key-color' (event, inst) {
        if (!$('#bottom-details-info-key-color').val()) {
            $('#bottom-details-info-key-color').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        colorPicker('#bottom-details-info-key-color', 'bottom-details-info-key-color-open', '.bottom-details-info-key-color-div');
    },

    'click #bottom-details-info-value-color' (event, inst) {
        if (!$('#bottom-details-info-value-color').val()) {
            $('#bottom-details-info-value-color').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        colorPicker('#bottom-details-info-value-color', 'bottom-details-info-value-color-open', '.bottom-details-info-value-color-div');
    },

    'click #enquiry-close-text-color' (event, inst) {
        if (!$('#enquiry-close-text-color').val()) {
            $('#enquiry-close-text-color').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        colorPicker('#enquiry-close-text-color', 'enquiry-close-text-color-open', '.enquiry-close-text-color-div');
    },

    'click #enquiry-close-background-color' (event, inst) {
        if (!$('#enquiry-close-background-color').val()) {
            $('#enquiry-close-background-color').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        colorPicker('#enquiry-close-background-color', 'enquiry-close-background-color-open', '.enquiry-close-background-color-div');
    },

    'click #enquiry-input-border-color' (event, inst) {
        if (!$('#enquiry-input-border-color').val()) {
            $('#enquiry-input-border-color').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        colorPicker('#enquiry-input-border-color', 'enquiry-input-border-color-open', '.enquiry-input-border-color-div');
    },

    'click #enquiry-submit-background-color' (event, inst) {
        if (!$('#enquiry-submit-background-color').val()) {
            $('#enquiry-submit-background-color').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        colorPicker('#enquiry-submit-background-color', 'enquiry-submit-background-color-open', '.enquiry-submit-background-color-div');
    },

    'click #enquiry-submit-text-color' (event, inst) {
        if (!$('#enquiry-submit-text-color').val()) {
            $('#enquiry-submit-text-color').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        colorPicker('#enquiry-submit-text-color', 'enquiry-submit-text-color-open', '.enquiry-submit-text-color-div');
    },

    'click #bottom-details-website-button' (event, inst) {
        if (!$('#bottom-details-website-button').val()) {
            $('#bottom-details-website-button').val('#FFFFFF'); //To Avoid throwing exceptions.
             
        }
        colorPicker('#bottom-details-website-button', 'bottom-details-website-button-open', '.openColorPickerNewMenuAdmin6');
    },

    'click #bottom-details-call-button' (event, inst) {
        if (!$('#bottom-details-call-button').val()) {
            $('#bottom-details-call-button').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#bottom-details-call-button', 'bottom-details-call-button-open', '.openColorPickerNewMenuAdmin7');
    },

    'click #enquiry-modal' (event, inst) {
        if (!$('#enquiry-modal').val()) {
            $('#enquiry-modal').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#enquiry-modal', 'enquiry-modal-open', '.openColorPickerNewMenuAdmin8');
    },

    'click #enquiry-footer-color' (event, inst) {
        if (!$('#enquiry-footer-color').val()) {
            $('#enquiry-footer-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#enquiry-footer-color', 'enquiry-footer-color-open', '.enquiry-footer-color-div');
    },

    'click #enquiry-hover-color' (event, inst) {
         if (!$('#enquiry-hover-color').val()) {
            $('#enquiry-hover-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#enquiry-hover-color', 'enquiry-hover-color-open', '.enquiry-hover-color-div');
    },
    
    'click #bottomsheet-submenu-header-color' (event, inst) {
        if (!$('#bottomsheet-submenu-header-color').val()) {
            $('#bottomsheet-submenu-header-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#bottomsheet-submenu-header-color', 'bottomsheet-submenu-header-color-open', '.openColorPickerNewMenuAdmin9');
    },
    
    'click #bottomsheet-submenu-list-color' (event, inst) {
        if (!$('#bottomsheet-submenu-list-color').val()) {
            $('#bottomsheet-submenu-list-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#bottomsheet-submenu-list-color', 'bottomsheet-submenu-list-color-open', '.openColorPickerNewMenuAdmin10');
    },

    /*'click #bottomsheet-submenu-icon-background-color' (event, inst) {
        if (!$('#bottomsheet-submenu-icon-background-color').val()) {
            $('#bottomsheet-submenu-icon-background-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#bottomsheet-submenu-icon-background-color', 'bottomsheet-submenu-icon-background-color-open', '.openColorPickerNewMenuAdmin11');
    },*/

    /*'click #bottomsheet-submenu-icon-color' (event, inst) {
        if (!$('#bottomsheet-submenu-icon-color').val()) {
            $('#bottomsheet-submenu-icon-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#bottomsheet-submenu-icon-color', 'bottomsheet-submenu-icon-color-open', '.openColorPickerNewMenuAdmin12');
    },*/

    'click #map-box-marker-color' (event, inst) {
        if (!$('#map-box-marker-color').val()) {
            $('#map-box-marker-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#map-box-marker-color', 'map-box-marker-color-open', '.openColorPickerNewMenuAdmin13');
    },

    'click #map-box-path-color' (event, inst) {
        if (!$('#map-box-path-color').val()) {
            $('#map-box-path-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#map-box-path-color', 'map-box-path-color-open', '.openColorPickerNewMenuAdmin14');
    },

    'click #location-list-modal-color' (event, inst) {
        if (!$('#location-list-modal-color').val()) {
            $('#location-list-modal-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#location-list-modal-color', 'location-list-modal-color-open', '.openColorPickerNewMenuAdmin15');
    },

    'click #location-list-modal-border-color' (event, inst) {
        if (!$('#location-list-modal-border-color').val()) {
            $('#location-list-modal-border-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#location-list-modal-border-color', 'location-list-modal-border-color-open', '.openColorPickerNewMenuAdmin16');
    },

    'click #location-list-detail-button' (event, inst) {
        if (!$('#location-list-detail-button').val()) {
            $('#location-list-detail-button').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#location-list-detail-button', 'location-list-detail-button-open', '.location-list-detail-button-div');
    },

    'click #location-list-direction-button' (event, inst) {
        if (!$('#location-list-direction-button').val()) {
            $('#location-list-direction-button').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#location-list-direction-button', 'location-list-direction-button-open', '.openColorPickerNewMenuAdmin18');
    },

    'click #location-call-button' (event, inst) {
        if (!$('#location-call-button').val()) {
            $('#location-call-button').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#location-call-button', 'location-call-button-open', '.openColorPickerNewMenuAdmin19');
    },

    'click #sidenav-modal-color' (event, inst) {
        if (!$('#sidenav-modal-color').val()) {
            $('#sidenav-modal-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#sidenav-modal-color', 'sidenav-modal-color-open', '.openColorPickerNewMenuAdmin20');
    },

    'click #sidenav-heading-text-color' (event, inst) {
        if (!$('#sidenav-heading-text-color').val()) {
            $('#sidenav-heading-text-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#sidenav-heading-text-color', 'sidenav-heading-text-color-open', '.sidenav-heading-text-color-div');
    },

    'click #location-info-modal-color' (event, inst) {
        if (!$('#location-info-modal-color').val()) {
            $('#location-info-modal-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#location-info-modal-color', 'location-info-modal-color-open', '.openColorPickerNewMenuAdmin21');
    },

    'click #location-info-details-button' (event, inst) {
        if (!$('#location-info-details-button').val()) {
            $('#location-info-details-button').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#location-info-details-button', 'location-info-details-button-open', '.openColorPickerNewMenuAdmin22');
    },

    'click #location-info-direction-button' (event, inst) {
        if (!$('#location-info-direction-button').val()) {
            $('#location-info-direction-button').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#location-info-direction-button', 'location-info-direction-button-open', '.openColorPickerNewMenuAdmin23');
    },

    'click #location-info-call-button' (event, inst) {
        if (!$('#location-info-call-button').val()) {
            $('#location-info-call-button').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#location-info-call-button', 'location-info-call-button-open', '.openColorPickerNewMenuAdmin24');
    },

    'click #menu-list-name-color' (event, inst) {
        if (!$('#menu-list-name-color').val()) {
            $('#menu-list-name-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#menu-list-name-color', 'menu-list-name-color-open', '.openColorPickerNewMenuAdmin25');
    },

    'click #menu-list-icon-background-color' (event, inst) {
        if (!$('#menu-list-icon-background-color').val()) {
            $('#menu-list-icon-background-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#menu-list-icon-background-color', 'menu-list-icon-background-color-open', '.openColorPickerNewMenuAdmin26');
    },

    'click #menu-list-icon-color' (event, inst) {
        if (!$('#menu-list-icon-color').val()) {
            $('#menu-list-icon-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#menu-list-icon-color', 'menu-list-icon-color-open', '.openColorPickerNewMenuAdmin27');
    },

    'click #menu-list-footer-color' (event, inst) {
        if (!$('#menu-list-footer-color').val()) {
            $('#menu-list-footer-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#menu-list-footer-color', 'menu-list-footer-color-open', '.openColorPickerNewMenuAdmin28');
    },
    
    'click #menu-list-search-color' (event, inst) {
        if (!$('#menu-list-search-color').val()) {
            $('#menu-list-search-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#menu-list-search-color', 'menu-list-search-color-open', '.openColorPickerNewMenuAdmin29');
    },

    'click #menu-list-footer-button' (event, inst) {
        if (!$('#menu-list-footer-button').val()) {
            $('#menu-list-footer-button').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#menu-list-footer-button', 'menu-list-footer-button-open', '.openColorPickerNewMenuAdmin30');
    },

    'click #menu-list-footer-button-text' (event, inst) {
        if (!$('#menu-list-footer-button-text').val()) {
            $('#menu-list-footer-button-text').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#menu-list-footer-button-text', 'menu-list-footer-button-text-open', '.menu-list-footer-button-text-div');
    },

    'click #menu-list-searchbar-search-icon-color' (event, inst) {
        if (!$('#menu-list-searchbar-search-icon-color').val()) {
            $('#menu-list-searchbar-search-icon-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#menu-list-searchbar-search-icon-color', 'menu-list-searchbar-search-icon-color-open', '.menu-list-searchbar-search-icon-color-div');
    },

    'click #menu-list-heading-color' (event, inst) {
        if (!$('#menu-list-heading-color').val()) {
            $('#menu-list-heading-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#menu-list-heading-color', 'menu-list-heading-color-open', '.menu-list-heading-color-div');
    },

    'click #menu-list-subHeading-color' (event, inst) {
        if (!$('#menu-list-subHeading-color').val()) {
            $('#menu-list-subHeading-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#menu-list-subHeading-color', 'menu-list-subHeading-color-open', '.menu-list-subHeading-color-div');
    },

    'click #menu-list-close-button-color' (event, inst) {
        if (!$('#menu-list-close-button-color').val()) {
            $('#menu-list-close-button-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#menu-list-close-button-color', 'menu-list-close-button-color-open', '.menu-list-close-button-color-div');
    },

    'click #bottom-details-modal-color' (event, inst) {
        if (!$('#bottom-details-modal-color').val()) {
            $('#bottom-details-modal-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#bottom-details-modal-color', 'bottom-details-modal-color-open', '.openColorPickerNewMenuAdmin31');
    },
    'click #bottom-details-modal-footer-color' (event, inst) {
        if (!$('#bottom-details-modal-footer-color').val()) {
            $('#bottom-details-modal-footer-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#bottom-details-modal-footer-color', 'bottom-details-modal-footer-color-open', '.openColorPickerNewMenuAdmin32');
    },

    'click #bottom-details-share-button-color' (event, inst) {
        if (!$('#bottom-details-share-button-color').val()) {
            $('#bottom-details-share-button-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#bottom-details-share-button-color', 'bottom-details-share-button-color-open', '.openColorPickerNewMenuAdmin33');
    },

    'click #bottom-details-share-button-text-color' (event, inst) {
       if (!$('#bottom-details-share-button-text-color').val()) {
            $('#bottom-details-share-button-text-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#bottom-details-share-button-text-color', 'bottom-details-share-button-text-color-open', '.bottom-details-share-button-text-color-div');
    },

    'click #branding-header-font-color' (event, inst) {
        if (!$('#branding-header-font-color').val()) {
            $('#branding-header-font-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#branding-header-font-color', 'branding-header-font-color-open', '.openColorPickerNewMenuAdmin34');
    },

    'click #branding-body-font-color' (event, inst) {
        if (!$('#branding-body-font-color').val()) {
            $('#branding-body-font-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#branding-body-font-color', 'branding-body-font-color-open', '.openColorPickerNewMenuAdmin35');
    },

    'click #branding-body-button-font-color' (event, inst) {
        if (!$('#branding-body-button-font-color').val()) {
            $('#branding-body-button-font-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#branding-body-button-font-color', 'branding-body-button-font-color-open', '.openColorPickerNewMenuAdmin36');
    },

    'click #bottom-details-information-color' (event, inst) {
        if (!$('#bottom-details-information-color').val()) {
            $('#bottom-details-information-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#bottom-details-information-color', 'bottom-details-information-color-open', '.openColorPickerNewMenuAdmin39');
    },

    'click #bottom-details-heading-font-color' (event, inst) {
        if (!$('#bottom-details-heading-font-color').val()) {
            $('#bottom-details-heading-font-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#bottom-details-heading-font-color', 'bottom-details-heading-font-color-open', '.openColorPickerNewMenuAdmin38');
    },

    'click #enquiry-label-color' (event, inst) {
        if (!$('#enquiry-label-color').val()) {
            $('#enquiry-label-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#enquiry-label-color', 'enquiry-label-color-open', '.openColorPickerNewMenuAdmin41');
    },

    'click #enquiry-modal-heading-color' (event, inst) {
        if (!$('#enquiry-modal-heading-color').val()) {
            $('#enquiry-modal-heading-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#enquiry-modal-heading-color', 'enquiry-modal-heading-color-open', '.openColorPickerNewMenuAdmin40');
    },

    'click #enquiry-input-shadow-color' (event, inst) {
        if (!$('#enquiry-input-shadow-color').val()) {
            $('#enquiry-input-shadow-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#enquiry-input-shadow-color', 'enquiry-input-shadow-color-open', '.enquiry-input-shadow-color-div');
    },

    'click #bottomsheet-submenu-icon-box-color' (event, inst) {
        if (!$('#bottomsheet-submenu-icon-box-color').val()) {
            $('#bottomsheet-submenu-icon-box-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#bottomsheet-submenu-icon-box-color', 'bottomsheet-submenu-icon-box-color-open', '.openColorPickerNewMenuAdmin41');
    },
    

    'click #bottomsheet-submenu-header-font-color' (event, inst) {
        if (!$('#bottomsheet-submenu-header-font-color').val()) {
            $('#bottomsheet-submenu-header-font-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#bottomsheet-submenu-header-font-color', 'bottomsheet-submenu-header-font-color-open', '.openColorPickerNewMenuAdmin42');
    },

    'click #bottomsheet-submenu-modal-color' (event, inst) {
        if (!$('#bottomsheet-submenu-modal-color').val()) {
            $('#bottomsheet-submenu-modal-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#bottomsheet-submenu-modal-color', 'bottomsheet-submenu-modal-color-open', '.bottomsheet-submenu-modal-color-div');
    },

    'click #bottomsheet-submenu-close-text-color' (event, inst) {
        if (!$('#bottomsheet-submenu-close-text-color').val()) {
            $('#bottomsheet-submenu-close-text-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#bottomsheet-submenu-close-text-color', 'bottomsheet-submenu-close-text-color-open', '.bottomsheet-submenu-close-text-color-div');
    },

    'click #bottomsheet-submenu-closeButton-color' (event, inst) {
        if (!$('#bottomsheet-submenu-closeButton-color').val()) {
            $('#bottomsheet-submenu-closeButton-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#bottomsheet-submenu-closeButton-color', 'bottomsheet-submenu-closeButton-color-open', '.bottomsheet-submenu-closeButton-color-div');
    },

    'click #bottomsheet-submenu-list-font-color' (event, inst) {
        if (!$('#bottomsheet-submenu-list-font-color').val()) {
            $('#bottomsheet-submenu-list-font-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#bottomsheet-submenu-list-font-color', 'bottomsheet-submenu-list-font-color-open', '.openColorPickerNewMenuAdmin43');
    },

    'click #location-button-text-color' (event, inst) {
        if (!$('#location-button-text-color').val()) {
            $('#location-button-text-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#location-button-text-color', 'location-button-text-color-open', '.openColorPickerNewMenuAdmin44');
    },

    'click #location-name-font-color' (event, inst) {
        if (!$('#location-name-font-color').val()) {
            $('#location-name-font-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#location-name-font-color', 'location-name-font-color-open', '.openColorPickerNewMenuAdmin45');
    },

    'click #location-info-font-color' (event, inst) {
        if (!$('#location-info-font-color').val()) {
            $('#location-info-font-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#location-info-font-color', 'location-info-font-color-open', '.openColorPickerNewMenuAdmin46');
    },

    'click #location-close-background-color' (event, inst) {
        if (!$('#location-close-background-color').val()) {
            $('#location-close-background-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#location-close-background-color', 'location-close-background-color-open', '.location-close-background-color-div');
    },

    'click #location-details-button-text-color' (event, inst) {
        if (!$('#location-details-button-text-color').val()) {
            $('#location-details-button-text-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#location-details-button-text-color', 'location-details-button-text-color-open', '.location-details-button-text-color-div');
    },

    'click #location-call-button-text-color' (event, inst) {
        if (!$('#location-call-button-text-color').val()) {
            $('#location-call-button-text-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#location-call-button-text-color', 'location-call-button-text-color-open', '.location-call-button-text-color-div');
    },
    
    

    'click #location-close-font-color' (event, inst) {
        if (!$('#location-close-font-color').val()) {
            $('#location-close-font-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#location-close-font-color', 'location-close-font-color-open', '.location-close-font-color-div');
    },

    'click #popup-button-text-color' (event, inst) {
        if (!$('#popup-button-text-color').val()) {
            $('#popup-button-text-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#popup-button-text-color', 'popup-button-text-color-open', '.openColorPickerNewMenuAdmin47');
    },

    'click #popup-name-font-color' (event, inst) {
        if (!$('#popup-name-font-color').val()) {
            $('#popup-name-font-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#popup-name-font-color', 'popup-name-font-color-open', '.openColorPickerNewMenuAdmin48');
    },

    'click #popup-detail-button-text-color' (event, inst) {
        if (!$('#popup-detail-button-text-color').val()) {
            $('#popup-detail-button-text-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#popup-detail-button-text-color', 'popup-detail-button-text-color-open', '.popup-detail-button-text-color-div');
    },

    'click #popup-call-button-text-color' (event, inst) {
        if (!$('#popup-call-button-text-color').val()) {
            $('#popup-call-button-text-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#popup-call-button-text-color', 'popup-call-button-text-color-open', '.popup-call-button-text-color-div');
    },

    'click #popup-info-font-color' (event, inst) {
        if (!$('#popup-info-font-color').val()) {
            $('#popup-info-font-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#popup-info-font-color', 'popup-info-font-color-open', '.openColorPickerNewMenuAdmin49');
    },

    'click #searchBar-text-color' (event, inst) {
        if (!$('#searchBar-text-color').val()) {
            $('#searchBar-text-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#searchBar-text-color', 'searchBar-text-color-open', '.openColorPickerNewMenuAdmin51');
    },

    'click #menu-text-color' (event, inst) {
        if (!$('#menu-text-color').val()) {
            $('#menu-text-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#menu-text-color', 'menu-text-color-open', '.openColorPickerNewMenuAdmin50');
    },

    'click #sidenav-text-color' (event, inst) {
        if (!$('#sidenav-text-color').val()) {
            $('#sidenav-text-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#sidenav-text-color', 'sidenav-text-color-open', '.openColorPickerNewMenuAdmin52');
    },

    'click #copyright-modal-background' (event, inst) {
        if (!$('#copyright-modal-background').val()) {
            $('#copyright-modal-background').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#copyright-modal-background', 'copyright-modal-background-open', '.copyright-modal-background-div');
    },

    'click #copyright-heading-font-color' (event, inst) {
        if (!$('#copyright-heading-font-color').val()) {
            $('#copyright-heading-font-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#copyright-heading-font-color', 'copyright-heading-font-color-open', '.copyright-heading-font-color-div');
    },

    'click #copyright-body-font-color' (event, inst) {
        if (!$('#copyright-body-font-color').val()) {
            $('#copyright-body-font-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#copyright-body-font-color', 'copyright-body-font-color-open', '.copyright-body-font-color-div');
    },

    'click #copyright-footer-background-color' (event, inst) {
        if (!$('#copyright-footer-background-color').val()) {
            $('#copyright-footer-background-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#copyright-footer-background-color', 'copyright-footer-background-color-open', '.copyright-footer-background-color-div');
    },

    'click #copyright-close-button-color' (event, inst) {
        if (!$('#copyright-close-button-color').val()) {
            $('#copyright-close-button-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#copyright-close-button-color', 'copyright-close-button-color-open', '.copyright-close-button-color-div');
    },

    'click #privacy-modal-background' (event, inst) {
        if (!$('#privacy-modal-background').val()) {
            $('#privacy-modal-background').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#privacy-modal-background', 'privacy-modal-background-open', '.privacy-modal-background-div');
    },

    'click #privacy-heading-font-color' (event, inst) {
        if (!$('#privacy-heading-font-color').val()) {
            $('#privacy-heading-font-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#privacy-heading-font-color', 'privacy-heading-font-color-open', '.privacy-heading-font-color-div');
    },

    'click #privacy-body-font-color' (event, inst) {
        if (!$('#privacy-body-font-color').val()) {
            $('#privacy-body-font-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#privacy-body-font-color', 'privacy-body-font-color-open', '.privacy-body-font-color-div');
    },

    'click #privacy-footer-background-color' (event, inst) {
        if (!$('#privacy-footer-background-color').val()) {
            $('#privacy-footer-background-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#privacy-footer-background-color', 'privacy-footer-background-color-open', '.privacy-footer-background-color-div');
    },

    'click #privacy-close-button-color' (event, inst) {
        if (!$('#privacy-close-button-color').val()) {
            $('#privacy-close-button-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#privacy-close-button-color', 'privacy-close-button-color-open', '.privacy-close-button-color-div');
    },

    'click #terms-modal-background' (event, inst) {
        if (!$('#terms-modal-background').val()) {
            $('#terms-modal-background').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#terms-modal-background', 'terms-modal-background-open', '.terms-modal-background-div');
    },

    'click #terms-heading-font-color' (event, inst) {
        if (!$('#terms-heading-font-color').val()) {
            $('#terms-heading-font-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#terms-heading-font-color', 'terms-heading-font-color-open', '.terms-heading-font-color-div');
    },

    'click #terms-body-font-color' (event, inst) {
        if (!$('#terms-body-font-color').val()) {
            $('#terms-body-font-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#terms-body-font-color', 'terms-body-font-color-open', '.terms-body-font-color-div');
    },

    'click #terms-footer-background-color' (event, inst) {
        if (!$('#terms-footer-background-color').val()) {
            $('#terms-footer-background-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#terms-footer-background-color', 'terms-footer-background-color-open', '.terms-footer-background-color-div');
    },

    'click #terms-close-button-color' (event, inst) {
        if (!$('#terms-close-button-color').val()) {
            $('#terms-close-button-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#terms-close-button-color', 'terms-close-button-color-open', '.terms-close-button-color-div');
    },

    'click #feedback-modal-background' (event, inst) {
        if (!$('#feedback-modal-background').val()) {
            $('#feedback-modal-background').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#feedback-modal-background', 'feedback-modal-background-open', '.feedback-modal-background-div');
    },

    'click #feedback-heading-font-color' (event, inst) {
        if (!$('#feedback-heading-font-color').val()) {
            $('#feedback-heading-font-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#feedback-heading-font-color', 'feedback-heading-font-color-open', '.feedback-heading-font-color-div');
    },

    'click #feedback-body-font-color' (event, inst) {
        if (!$('#feedback-body-font-color').val()) {
            $('#feedback-body-font-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#feedback-body-font-color', 'feedback-body-font-color-open', '.feedback-body-font-color-div');
    },

    'click #feedback-footer-background-color' (event, inst) {
        if (!$('#feedback-footer-background-color').val()) {
            $('#feedback-footer-background-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#feedback-footer-background-color', 'feedback-footer-background-color-open', '.feedback-footer-background-color-div');
    },

    'click #feedback-close-button-color' (event, inst) {
        if (!$('#feedback-close-button-color').val()) {
            $('#feedback-close-button-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#feedback-close-button-color', 'feedback-close-button-color-open', '.feedback-close-button-color-div');
    },

    'click #feedback-inputBox-border-color' (event, inst) {
        if (!$('#feedback-inputBox-border-color').val()) {
            $('#feedback-inputBox-border-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#feedback-inputBox-border-color', 'feedback-inputBox-border-color-open', '.feedback-inputBox-border-color-div');
    },

    'click #feedback-sent-button-text-color' (event, inst) {
        if (!$('#feedback-sent-button-text-color').val()) {
            $('#feedback-sent-button-text-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#feedback-sent-button-text-color', 'feedback-sent-button-text-color-open', '.feedback-sent-button-text-color-div');
    },

    'click #feedback-footer-top-border-color' (event, inst) {
        if (!$('#feedback-footer-top-border-color').val()) {
            $('#feedback-footer-top-border-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#feedback-footer-top-border-color', 'feedback-footer-top-border-color-open', '.feedback-footer-top-border-color-div');
    },

    'click #popup-cross-button-color' (event, inst) {
        if (!$('#popup-cross-button-color').val()) {
            $('#popup-cross-button-color').val('#FFFFFF'); //To Avoid throwing exceptions.  
        }
        colorPicker('#popup-cross-button-color', 'popup-cross-button-color-open', '.popup-cross-button-color-div');
    },
    


    
    'click #updateColor' (event, inst) {

        let colors = { colors: {
            brandingModal: {
                modalColor: $('#branding-modal-color').val(),
                websiteButtonColor: $('#branding-website-button').val(),
                callButtonColor: $('#branding-call-button').val(),
                enquiryButtonColor:$('#branding-footer-button').val(),
                headerFontColor: $('#branding-header-font-color').val(),
                bodyFontColor: $('#branding-body-font-color').val(),
                buttonFontColor: $('#branding-body-button-font-color').val(),
                footerColor: $('#branding-footer-color').val(),
                cancleIconColor: $('#branding-cross-color').val(),
                cancleIconTextColor: $('#branding-cross-text-color').val(),
                iconHeadingColor: $('#icon-heading-color').val()

            },
            bottomLocationDetails: {
                directionButtonColor: $('#bottom-details-direction-button').val(),
                websiteButtonColor: $('#bottom-details-website-button').val(),
                callButtonColor:$('#bottom-details-call-button').val(),
                modalBackgroundColor: $('#bottom-details-modal-color').val(),
                modalFooterBackgroundColor: $('#bottom-details-modal-footer-color').val(),
                shareButtonColor: $('#bottom-details-share-button-color').val(),
                shareButtonTextColor: $('#bottom-details-share-button-text-color').val(),
                infoFontColor: $('#bottom-details-information-color').val(),
                headingFontColor: $('#bottom-details-heading-font-color').val(),
                imageBackgroundColor: $('#bottom-details-image-color').val(),
                horizontalLineColor: $('#bottom-details-horizontal-line-color').val(),
                keyTextColor: $('#bottom-details-info-key-color').val(),
                valuetextColor: $('#bottom-details-info-value-color').val(),
                closeButtonTextColor: $('#bottom-details-closeButton-text-color').val(),
                closeButtonbackgroundColor: $('#bottom-details-closeButton-color').val()


            },
            enquiryModal: {
                modalBackgroundColor: $('#enquiry-modal').val(),
                headingFontColor: $('#enquiry-modal-heading-color').val(),
                labelFontColor: $('#enquiry-label-color').val(),
                hoverColor: $('#enquiry-hover-color').val(),
                closeButtonBackgroundColor: $('#enquiry-close-background-color').val(),
                closeButtontextColor: $('#enquiry-close-text-color').val(),
                submitButtonBackgroundColor: $('#enquiry-submit-background-color').val(),
                submitButtonTextColor: $('#enquiry-submit-text-color').val(),
                footerBackgroundColor: $('#enquiry-footer-color').val(),
                inputBorderColor: $('#enquiry-input-border-color').val(),
                inputBoxShadowColor: $('#enquiry-input-shadow-color').val()
            },
            bottomSheetSubMenu: {
                headerBackgroundColor: $('#bottomsheet-submenu-header-color').val(),
                listBackgroundColor: $('#bottomsheet-submenu-list-color').val(),
                /*iconBackgroundColor: $('#bottomsheet-submenu-icon-background-color').val(),*/
                /*iconColor: $('#bottomsheet-submenu-icon-color').val(),*/
                iconBoxColor: $('#bottomsheet-submenu-icon-box-color').val(),
                headingFontColor: $('#bottomsheet-submenu-header-font-color').val(),
                listFontColor: $('#bottomsheet-submenu-list-font-color').val(),
                modalBackgroundColor: $('#bottomsheet-submenu-modal-color').val(),
                closeButtonBackgroundColor: $('#bottomsheet-submenu-closeButton-color').val(),
                closeButtonTextColor: $('#bottomsheet-submenu-close-text-color').val()
            },
            
            bottomSheetLocationList: {
                modalBackgroundColor: $('#location-list-modal-color').val(),
                modalBorderColor: $('#location-list-modal-border-color').val(),
                detailsButtonColor: $('#location-list-detail-button').val(),
                directionButtonColor: $('#location-list-direction-button').val(),
                callButtonColor: $('#location-call-button').val(),
                directionButtonTextColor: $('#location-button-text-color').val(),
                locationNameFontColor: $('#location-name-font-color').val(),
                locationInfoFontColor: $('#location-info-font-color').val(),
                closeButtonNackgroundColor: $('#location-close-background-color').val(),
                closeButtonTextColor: $('#location-close-font-color').val(),
                callButtonTextColor: $('#location-call-button-text-color').val(),
                detailsButtonTextColor: $('#location-details-button-text-color').val()
            },
            sideNavModal: {
                modalBackgroundColor: $('#sidenav-modal-color').val(),
                textColor: $('#sidenav-text-color').val(),
                headingTextColor: $('#sidenav-heading-text-color').val()
            },
            locationInfoPopup: {
                modalBackgroundColor: $('#location-info-modal-color').val(),
                detailsButtonColor: $('#location-info-details-button').val(),
                directionButtonColor: $('#location-info-direction-button').val(),
                callButtonColor: $('#location-info-call-button').val(),
                directionButtonTextColor: $('#popup-button-text-color').val(),
                locationNameFontColor: $('#popup-name-font-color').val(),
                locationInfoFontColor: $('#popup-info-font-color').val(),
                callButtonTextColor: $('#popup-call-button-text-color').val(),
                detailsButtonTextColor: $('#popup-detail-button-text-color').val(),
                crossButtonColor: $('#popup-cross-button-color').val()
            },
            landingPageModal: {
                nameBackgroundColor: $('#menu-list-name-color').val(),
                /*iconBackgroundColor: $('#menu-list-icon-background-color').val(),*/
               /* iconColor: $('#menu-list-icon-color').val(),*/
                footerBackgroundColor: $('#menu-list-footer-color').val(),
                searchBarBackgroundColor: $('#menu-list-search-color').val(),
                showMenusButtonColor: $('#menu-list-footer-button').val(),
                searchBarTextColor: $('#searchBar-text-color').val(),
                menuTextColor: $('#menu-text-color').val(),
                headingTextColor: $('#menu-list-heading-color').val(),
                subHeadingTextColor: $('#menu-list-subHeading-color').val(),
                footerButtonTextColor: $('#menu-list-footer-button-text').val(),
                searchbarCloseButtonColor: $('#menu-list-close-button-color').val(),
                searchBarSearchIconColor: $('#menu-list-searchbar-search-icon-color').val(),
                sideNavOpenIconColor: $('#menu-list-sideNav-opener').val()
            },
            feedbackModal: {
                backgroundColor: $('#feedback-modal-background').val(),
                footerBackgroundColor:$('#feedback-footer-background-color').val(),
                closeButtonTextColor:$('#feedback-close-button-color').val(),
                headingTextColor:$('#feedback-heading-font-color').val(),
                bodyTextColor:$('#feedback-body-font-color').val(),
                inputBoxBorderColor:$('#feedback-inputBox-border-color').val(),
                SentButtonTextColor:$('#feedback-sent-button-text-color').val(),
                footerTopBorderColor: $('#feedback-footer-top-border-color').val()

            },
            termsModal: {
                backgroundColor:$('#terms-modal-background').val(),
                footerBackgroundColor:$('#terms-footer-background-color').val(),
                closeButtonTextColor:$('#terms-close-button-color').val(),
                headingTextColor:$('#terms-heading-font-color').val(),
                bodyTextColor:$('#terms-body-font-color').val()
            },
            privacyModal: {
                backgroundColor:$('#privacy-modal-background').val(),
                footerBackgroundColor:$('#privacy-footer-background-color').val(),
                closeButtonTextColor:$('#privacy-close-button-color').val(),
                headingTextColor:$('#privacy-heading-font-color').val(),
                bodyTextColor:$('#privacy-body-font-color').val()
            },
            copyrightModal: {
                backgroundColor:$('#copyright-modal-background').val(),
                footerBackgroundColor:$('#copyright-footer-background-color').val(),
                closeButtonTextColor:$('#copyright-close-button-color').val(),
                headingTextColor:$('#copyright-heading-font-color').val(),
                bodyTextColor:$('#copyright-body-font-color').val()
            },

        }

        }
        // console.log(colors, "color List")
        Meteor.call('AdminSettings.update', colors, getSubdomain(getCookie("selectedSDForSA")), (error, result) => {
                if (error) {
                    Session.set('showLoading',false);
                    error = error.error ? error.error : error;
                    showAlert("danger", "Can not update branding section");
                }else{
                    Session.set('showLoading',false);
                    showAlert("success", "Branding section updated successfully");
                }
            });

    },
});

function colorPicker(inputBoxid, inputBoxClass, iconBoxColor) {
    var colors1 = jsColorPicker(inputBoxid, {
            readOnly: true,
            fps: 60, // the framerate colorPicker refreshes the display if no 'requestAnimationFrame'
            delayOffset: 0, // pixels offset when shifting mouse up/down inside input fields before it starts acting as slider
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
            appenTo: document.getElementById(inputBoxClass),
            /*init: function(elm, colors)  {},*/
            actionCallback: (evt, action) => {
                //This Callbacks are general throught life cycle. so need to repeat the code.
                if (action === 'changeXYValue' && $(inputBoxid).val()) {
                    $(iconBoxColor).css('background-color', $(inputBoxid).val() || '#000');
                    //$('.edit-menu-icon-img.img1').css('background-color', $('#inputBoxid').val() || '#000');
                    //$('.edit-menu-icon-img.img1').val($('#inputBoxid').val());
                    //$(inputBoxClass).val($(inputBoxid).val());
                }
            }
        });
}

function showAlert(type, message){
    Bert.alert({
        title: 'Hey there!',
        message: message,
        type: type,
        style: 'growl-top-right',
        icon: 'fa-check',
    });
}

