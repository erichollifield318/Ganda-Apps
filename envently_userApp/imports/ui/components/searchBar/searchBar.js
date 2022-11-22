import './searchBar.html';
import { Meteor } from 'meteor/meteor';
import { Categories } from '/imports/api/categories/categories.js';
import { LocationDev } from '/imports/api/location_dev/location_dev.js';
import { AtdwData } from '/imports/api/atdw_data/atdw_data.js';
import { EventDev } from '/imports/api/event_dev/event_dev.js';
import { CacheDev } from '/imports/api/cache_dev/cache_dev.js';
import { mapCentre } from '../mapbox/mapbox.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain, getCookie } from '/imports/startup/both/global_function.js';
import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { screensaver } from '/imports/startup/client/globalHelpers.js';

console.log(" searchBar js runs when server starts");

export const searchQuery = new ReactiveVar();
Template.searchBar.onCreated(function() {
  this.subscribe = Meteor.subscribe('atdw_data', getCookie("selectedSDForSA"));
  const { ReactiveVar }  =  require('meteor/reactive-var');
  require("./searchBar.css")
  /*this.searchQuery = new ReactiveVar();*/
  this.searching = new ReactiveVar(false);
  this.showLoader = new ReactiveVar(false);
  this.locations = new ReactiveVar([]);
  this.events = new ReactiveVar([]);
  this.newObj = new ReactiveVar({});
  this.isWaiting = false;
  this.timer = null;
  this.subMenuNames = [];
  this.subMenusWithPrefrence=[];

  this.itemsPreference = {};
  Meteor.call('menuItemDev.getSubMenuNames', getSubdomain(getCookie("selectedSDForSA")), (error, subMenuNames)=>{
      if(error){
        // console.log(":: error inside menuItemDev.getSubMenuNames Meteor call.",error);

      }else{
          this.subMenuNames = _.union(_.flatten(_.pluck(subMenuNames, 'names')));
          // var arr = [];
          //  this.subMenuNames.forEach((menu) => {
          //   // _.map(menu, function(parseMenu){ return TAPi18n.__(parseMenu) });
          //     TAPi18n.setLanguage("hi");
          //     arr.push( TAPi18n.__(menu));
          //  })
           
           this.subMenuNames = _.map(this.subMenuNames, function(menu){ 
              // let temp = menu.split(".");
              // if(temp.length > 1){
              //     menu = (temp[1].charAt(0).toUpperCase() + temp[1].slice(1)).replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
              //     //menu = menu.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
              // }  
              return menu.en; 
            });

           // this.subMenuNames = arr;
          this.subMenusWithPrefrence=subMenuNames;

          subMenuNames.forEach((items, key) => {
             items.custom_locations.forEach((item, key) => {
                this.itemsPreference[item] = {};
                this.itemsPreference[item]['icon'] = items.preference.icon;
                this.itemsPreference[item]['parentName'] = items.names;
                this.itemsPreference[item]['type'] = 'location';
            });
          });
        //this.subMenuNames = subMenuNames;


      }

  });
  this.performSearch = ((val, fromClose)=>{
    // removing white space for character count

    // console.log("clicked predictive====>");
    let tempStr = val.replace(/\s/g, "");
    if(tempStr.length<3 && fromClose !== true){
      showAlert('danger', 'Please enter atleast 3 characters');
      return
    }

    Session.set('showLoadingSpinner',true);
    var subdomain = document.location.hostname.split('.');
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
    } else{
      siteSetting = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
    }
    let suburb = siteSetting && siteSetting.suburb ? siteSetting.suburb : '';
    Meteor.call("bottomSheetModal.getMarkersForSearchedItem", val, suburb, getSubdomain(getCookie("selectedSDForSA")), (error, markers)=>{
      this.isWaiting = false;
      if(error){
        // console.log(":: error inside getMarkersForItem Meteor call.",error);
      }else{
        Session.set('showMap',true);
        // console.log('markersmarkers', markers);
        Session.set('categsArray', markers);
      }
    });
  });
});

Template.searchBar.onRendered(function() {
  /* Keyboard Initialization */
  $('.keyboard').mlKeyboard({layout: 'en_US'});
  this.autorun(() => {
    
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
    } else{
      siteSetting = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
    }
    
    let oldCategorySubsId=false,oldEventSubsId=false,oldLocationSubsId=false;

      // commented out temporarily
      /*let categorySubs = this.subscribe('categoriesSearch', this.searchQuery.get(), () => {
        // console.log(":: subscribing for category.",this.searchQuery.get());
      });*/

      

      // commented out temporarily

      var eachCategory=[],eachEvent=[],eachLocation=[],eachCacheData=[];
      // commented out temporarily
      /*var categories = Categories.find().fetch();
      // console.log(":: categories - > ",categories.length);
      eachCategory = categories.map((category, key) => {
        return category.name;
      });*/
     this.eventSubs = Meteor.subscribe('event_dev.search', searchQuery.get(), getCookie("selectedSDForSA"));

      this.locationSubs = Meteor.subscribe('location_dev.search', searchQuery.get(), getCookie("selectedSDForSA"));

      var locations = [];
      if (this.locationSubs.ready()) {

        if (getSubdomain(getCookie("selectedSDForSA"))) {

          // console.log("under if to get location");
          locations = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_location_dev'].find().fetch();
        } else {
          // console.log("under else to get location");
          locations = LocationDev.find().fetch();
        }
        eachLocation = locations.map((location, key) => {
          if (this.itemsPreference[location._id])
            this.itemsPreference[location._id]['name'] = location.name;
          return location.name;
        });

        // console.log("earchLocation =====> " , eachLocation);
      }

      var events = [];
      if (this.eventSubs.ready()) {
      if (getSubdomain(getCookie("selectedSDForSA"))) {

        // console.log("under if ");
        events = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_event_dev'].find().fetch();

        // console.log("events ====> " , events);
      } else {
        // console.log("under else");
        events = EventDev.find().fetch();
        // console.log("events ====> " , events);
      }

        // console.log(":: events - > ",events.length);
        eachEvent = events.map((event, key) => {
          return event.name;
        });

        // console.log("eachEvent ====> ", eachEvent);
      }
      /*if (this.locationSubs.ready()) {
        if (getSubdomain(getCookie("selectedSDForSA"))) {
          locations = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_location_dev'].find().fetch();
        } else {
          locations = LocationDev.find().fetch();
        }

        this.locations.set(locations.map((location, key) => {
          this.itemsPreference[location._id]['name'] = location.name;
          return location.name;
        }));
      }
      if (this.eventSubs.ready()) {
        if (getSubdomain(getCookie("selectedSDForSA"))) {
          events = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_event_dev'].find().fetch();
        } else {
          events = EventDev.find().fetch();
        }

          // console.log(":: events - > ",events.length);
        this.events.set(events.map((event, key) => {
          return event.name;
        }));
      }*/
      // commented out temporarily
      /*var cacheData = CacheDev.find().fetch();
      // console.log(":: events - > ",events.length);
      eachCacheData = cacheData.map((cache, key) => {
        return cache.name;
      });*/
      // console.log(`:: LOCATIONS - > `,locations );
      // console.log(`:: EVENTS - > `,events );
      //  console.log(`:: CATEGORY SUGGESTIONS FOR ${this.searchQuery.get()} - > `,eachCategory );
      // console.log(`:: LOCATION SUGGESTIONS FOR - > `,eachLocation );
      // console.log(`:: EVENT SUGGESTIONS FOR - > `,eachEvent );
     //   console.log(this,`:: CACHE SUGGESTIONS FOR ${this.searchQuery.get()} - > `,eachCacheData );

     // Initialize object for hold external atdw data
      let atdwExternalData = {};

      // This section code is written for working on data get from atdw and store in local collection
      if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_atdw_data']) {
        atdwExternalData = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_atdw_data'].find( {}, { productName: 1} ).fetch();
      } else{
        atdwExternalData = AtdwData.findOne({ subDomain: getCookie("selectedSDForSA") });
      }

      // Initialize array
      let productArray = [];
      // Push product name from external atdw data array
      atdwExternalData.forEach((product, index) => {
        productArray[index] = product.productName;
      });
//console.log("productArray@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",productArray);

      // console.log('earch event before get union ====> ' , eachEvent);
 
      let searchResult = _.union(eachLocation, eachEvent, this.subMenuNames, productArray);


      // console.log("searchResult ====>  " , searchResult);
//console.log("searchResult@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",searchResult);
      /*console.log('searchResultsearchResult', searchResult)*/
      if(!searchQuery.get()) {
          searchResult = [];
      }
      // console.log(":: total search results", searchResult);
      if(searchResult && searchResult.length){
        // refocusing[ using this for fixing the delay suggestion list issue ]
        // $("#autocomplete-input").focusout()
        // $("#autocomplete-input").focus()
        function toObject(arr) {
          const rv = {};
          for (i = 0; i < arr.length; i += 1)
            rv[i] = arr[i];
          return rv;
        }
        const autoCompleteObject = toObject(searchResult);
       /* searchResult.map((ree)=>{
          console.log('responce object', ree)
          
        });*//*.search('terms')*/
        this.newObj.set(_.reduce(_.invert(autoCompleteObject), (memo, value, key)=> {

          let subMenuItem=this.subMenusWithPrefrence.find(o => {
            return o.names === key
          });

          if (subMenuItem && subMenuItem.preference.icon) {
            memo[key] = `./assets/img/maki/${subMenuItem.preference.icon}.svg`;
          }
          else
          {
            let locationItem=_.find(this.itemsPreference, obj => {
               return obj.name === key
            });
            if (locationItem && locationItem.icon)
              memo[key] = `./assets/img/maki/${locationItem.icon}.svg`;
            else
              memo[key] = './assets/img/maki/marker-15.svg';
          }

          return memo;
        }, {}));
        // console.log(":: newObj ", this.newObj.get());
        $('input.autocomplete').autocomplete({
          data: this.newObj.get(),
          limit: 20, // The max amount of results that can be shown at once. Default: Infinity.
          minLength: 0,
          onAutocomplete: (val) => {
            if(!this.isWaiting){
                this.isWaiting = true;
              try {
                // console.log("===> val ",val);
                this.performSearch(val);
                $('#bottomSheetModalId').modal();
                $('#bottomSheetModalId').modal('open');
              } catch (exception) {
                  // console.log( ":: predective search exception - > ",exception );
              } finally {
                Session.set('selectedSubMenu', false)
              }
            }
          }
        });
      } else {
        /*console.log("baba G Ka thullu aa gya")*/
        // console.log(":: :: else")
        /*$('.autocomplete-content').remove();*/

      }
  });




  
});

Template.searchBar.helpers({
  isNotKioskUser () {
      return !Roles.userIsInRole(Meteor.userId(),['kiosk'], 'kiosk');
  },

  displayClose () {
    return searchQuery.get() ? 'inline' : 'none' ;
  },

  isMultiLanguage() {
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
    } else{
      siteSetting = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });

    }
    //console.log("1234 is multi lanaguage HIDE", siteSetting)
    if (siteSetting && siteSetting.displayMultiLanguageButton) {
      //console.log("1234 is multi lanaguage display", siteSetting.displayMultiLanguageButton)
      return true;
    } else {
      //console.log("1234 is multi lanaguage HIDE")
      return false;
    }
    
  },

  searchBar () {
    let siteSetting = {};
    if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
      siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
    } else{
      siteSetting = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
    }
    //$('#mainHeading').children().remove();
    let data = {
      "searchBarBackgroundColor" : "#616161 !important",
      "searchBarTextColor" : "#fff !important",
      "searchbarCloseButtonColor" : "#C2E215 !important",
      "searchBarSearchIconColor": "#D0D0D0 !important",
    };

    if (siteSetting && siteSetting.colors && siteSetting.colors.landingPageModal) {
      data = {

        "searchBarBackgroundColor" : `${siteSetting.colors.landingPageModal.searchBarBackgroundColor} !important` || "#616161 !important",
        "searchBarTextColor" : `${siteSetting.colors.landingPageModal.searchBarTextColor} !important` || "#fff !important",
        "headingTextColor" : `${siteSetting.colors.landingPageModal.headingTextColor} !important` || "#ffb866 !important",
        "subHeadingTextColor" : `${siteSetting.colors.landingPageModal.subHeadingTextColor} !important` || "#ffb866 !important",
        "searchbarCloseButtonColor" : `${siteSetting.colors.landingPageModal.searchbarCloseButtonColor} !important` || "#616161 !important",
        "searchBarSearchIconColor" : `${siteSetting.colors.landingPageModal.searchBarSearchIconColor } !important`|| "#D0D0D0 !important",
        "sideNavOpenIconColor" : `${siteSetting.colors.landingPageModal.sideNavOpenIconColor } !important`|| "#fff !important"
      }
    }
    if (siteSetting && siteSetting.branding && siteSetting.branding.landingPageObject) {
      if (window.innerWidth <= 425 && siteSetting.branding.landingPageObject.landingImageMobile){
        // mobile view
        data.landingImage = siteSetting.branding.landingPageObject.landingImageMobile;
      }
      else if (window.innerWidth <= 768 && siteSetting.branding.landingPageObject.landingImageTeblet) {
        // tab view
        data.landingImage = siteSetting.branding.landingPageObject.landingImageTeblet;
      } else {
        // desktop and kiosk view
        data.landingImage = siteSetting.branding.landingPageObject.landingImageKiosk;
      }
      data.landingPageHeadingImage = siteSetting.branding.landingPageObject.landingPageHeadingImage || '';
    }
    if (siteSetting && siteSetting.branding){
      data.landingHeading = siteSetting.branding.heading || '';
      
      data.landingSubHeading = siteSetting.branding.subHeading || '';
    }
    
    return data;
  },
  // getMenuItemName(){
  //   return Template.instance().data.selectedMenuItemName.get() || '';
  // },

  showLoader(){
    return Template.instance().showLoader.get();
  },

  opts(){
    return {
      lines: 11, // The number of lines to draw
      length: 0, // The length of each line
      width: 4, // The line thickness
      radius: 5, // The radius of the inner circle
      scale: 1, // Scales overall size of the spinner
      corners: 1, // Corner roundness (0..1)
      color: '#000', // #rgb or #rrggbb or array of colors
      opacity: 0.15, // Opacity of the lines
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      className: 'spinner', // The CSS class to assign to the spinner
      bottom: '0%', // Top position relative to parent
      left: '0%', // Left position relative to parent
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      position: 'absolute' // Element positioning
    }
  },
    subDomainClass() {
      if (Session.get('currentClient')=="gctourism") {
          return "gcTourism-image";
        } else {
          return "doublebay-image";
        }
    }
})

Template.searchBar.events({
  'keyup [name="search"]' (event, template) {
    screensaver();
    let value = event.target.value.trim();
    setTimeout(() => {
      searchQuery.set(value);
    }, 100);
  },
  'change .keyboard' (event, inst) {
    clearTimeout(inst.timer);
  },
  'focus #autocomplete-input' (event, template){
    $('.admin-console-link').attr('src','/adminConsoleIcon-black.png');
  },
  'click #autocomplete-input' ( event, template ) {
    //$('#overlay-box,#mainMenuList').css('display','none');
    //$("#mainMenuList").css('display','none');
    $('.fixed-action-btn').closeFAB();
    $('#overlay-box, #mainMenuList').css('display', 'none');
    $('.admin-console-link').attr('src','/adminConsoleIcon-black.png');
     Session.set('singleMarker',false);
  },
  'click .closeIcon' ( event, inst ) {
    // setTimeout(() => {
      searchQuery.set("");
      $("#autocomplete-input").val("")
      // inst.performSearch("", true);
      Session.set('categsArray', []);
      Session.set('singleMarker',false);
    // }, 300);
  },
  'submit #searchForm'(event, inst){
    event.preventDefault();
    // console.log(':::-->>submit', )
    let markersArray= [];
    inst.performSearch($('#autocomplete-input').val());
    let termCat = $('#autocomplete-input').val();
    let param =  encodeURIComponent(termCat);
    // ATDW data work only for gctourism sub domain
    if (getSubdomain(getCookie("selectedSDForSA")) == 'gctourism') {
      let settings = {
        "async": true,
        "crossDomain": true,
        "url": `https://atlas.atdw-online.com.au/api/atlas/products?term=${param}&out=json&key=b48bc68600e648a397fe46a4da776f60&rg=Gold%20Coast%20Region`,
        "method": "GET",
        "headers": {
          "Cache-Control": "no-cache",
          "Postman-Token": "f826355c-01c7-e8a4-9770-eef82adb0486"
        }
      }
      $.ajax(settings).done(function(response) {
        Session.set('showLoadingSpinner', true);
        response.products.map((responceObject) => {
          Session.set('showLoadingSpinner', true);
          let allLatLong = responceObject.boundary;
          let isMultiPoint = allLatLong.search('MULTIPOINT');
          let locationBoundry = allLatLong;
          if (isMultiPoint !== -1) {
            let splitlongLat = allLatLong.split(',')[0].substring(11).replace(' ',',').split(',');
            locationBoundry = splitlongLat[1]+','+splitlongLat[0];
          }
           
          let longLat = locationBoundry.split(","); // Split Longitude and latitude
          let dynamicLongitude = longLat[1]; // Latitude
          let dynamicLatiitude = longLat[0] // longituds
          // Push the dynamic value in array
          const product = {
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
        });

        $('#bottomSheetModalId').modal();
        $('#bottomSheetModalId').modal('open');
        //Session.set("currentMenu", event.currentTarget.id);
        Session.set('categsArray', markersArray);
      });
    }
  },
  'click .searchIcon'(event, inst){
    $("#autocomplete-input").val("");
    $("#autocomplete-input").focus();
  },
  // 'focus [name="search"]'(event, template) {
  //   template.searching.set(true);
  // },
  'blur [name="search"]'(event, template) {
    template.searching.set(false);
     $('.admin-console-link').attr('src','/adminConsoleIcon.png');
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

var delay = (function(){
  var timer = 0;
  return function(callback, ms){
  clearTimeout (timer);
  timer = setTimeout(callback, ms);
 };
})();

function searchBarATDW(termCat) {
 let param =  encodeURIComponent(termCat);
 // console.log("param::::", param)
  let settings = {
    "async": true,
    "crossDomain": true,
    "url": `https://atlas.atdw-online.com.au/api/atlas/products?${param}&out=json&key=b48bc68600e648a397fe46a4da776f60`,
    "method": "GET",
    "headers": {
      "Cache-Control": "no-cache",
      "Postman-Token": "f826355c-01c7-e8a4-9770-eef82adb0486"
    }
  }
  // console.log('searchBarUrl', `https://atlas.atdw-online.com.au/api/atlas/products?term=${param}&out=json&key=b48bc68600e648a397fe46a4da776f60`)
 
}
