import './searchBar.html';
import { Meteor } from 'meteor/meteor';
import { Categories } from '/imports/api/categories/categories.js';
import { LocationDev } from '/imports/api/location_dev/location_dev.js';
import { EventDev } from '/imports/api/event_dev/event_dev.js';
import { CacheDev } from '/imports/api/cache_dev/cache_dev.js';
import { mapCentre } from '../mapbox/mapbox.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Template.searchBar.onCreated(function() {
  const { ReactiveVar }  =  require('meteor/reactive-var');
  require("./searchBar.css")
  this.searchQuery = new ReactiveVar();
  this.searching = new ReactiveVar(false);
  this.showLoader = new ReactiveVar(false);
  this.isWaiting = false;
  this.subMenuNames = [];
  this.subMenusWithPrefrence=[];

  this.itemsPreference = {};
  Meteor.call('menuItemDev.getSubMenuNames', (error, subMenuNames)=>{
      if(error){
        console.log(":: error inside menuItemDev.getSubMenuNames Meteor call.",error);

      }else{

          this.subMenuNames = _.union(_.flatten(_.pluck(subMenuNames, 'names')));
          /*console.log(subMenuNames, "SubMenusNames:::::::")*/
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
    let tempStr = val.replace(/\s/g, "");
    if(tempStr.length<3 && fromClose !== true){
      showAlert('danger', 'Please enter atleast 3 characters');
      return
    }

    Session.set('showLoadingSpinner',true);
    var subdomain = document.location.hostname.split('.');
    let siteSettings = Session.get('siteSettings');
    let suburb = siteSettings && siteSettings.suburb ? siteSettings.suburb : '';
    Meteor.call("bottomSheetModal.getMarkersForSearchedItem", val, suburb, subdomain, (error, markers)=>{
      this.isWaiting = false;
      if(error){
        console.log(":: error inside getMarkersForItem Meteor call.",error);
      }else{
        Session.set('showMap',true);
        Session.set('categsArray', markers);
      }
    });
  });

})

Template.searchBar.onRendered(function() {
  this.autorun(() => {
    let oldCategorySubsId=false,oldEventSubsId=false,oldLocationSubsId=false;

    // commented out temporarily
    /*let categorySubs = this.subscribe('categoriesSearch', this.searchQuery.get(), () => {
      // console.log(":: subscribing for category.",this.searchQuery.get());
    });*/

    let eventSubs = this.subscribe('event_dev.search', this.searchQuery.get(), () => {
      // console.log(":: subscribing for event.",this.searchQuery.get());
    });

    let locationSubs = this.subscribe('location_dev.search', this.searchQuery.get(), () => {
      // console.log(":: subscribing for location.",this.searchQuery.get());
    });

    // commented out temporarily
    /*let cacheSubs = this.subscribe('cache_dev.search', this.searchQuery.get(), () => {
      // console.log(":: subscribing for location.",this.searchQuery.get());
    });*/

    var eachCategory=[],eachEvent=[],eachLocation=[],eachCacheData=[];
    // commented out temporarily
    /*var categories = Categories.find().fetch();
    // console.log(":: categories - > ",categories.length);
    eachCategory = categories.map((category, key) => {
      return category.name;
    });*/

    var locations = [];
    if (locationSubs.ready()) {
    if(getSubdomain())
    {
      locations = dynamicCollections[getSubdomain()+'_location_dev'].find().fetch();
    }
    else {
      locations = LocationDev.find().fetch();
    }

    eachLocation = locations.map((location, key) => {
      this.itemsPreference[location._id]['name'] = location.name;
      return location.name;
    });
  }

    var events = [];
    if (eventSubs.ready()) {
    if(getSubdomain())
    {
      events = dynamicCollections[getSubdomain()+'_event_dev'].find().fetch();
    }
    else {
      events = EventDev.find().fetch();
    }

    // console.log(":: events - > ",events.length);
    eachEvent = events.map((event, key) => {
      return event.name;
    });
}
    // commented out temporarily
    /*var cacheData = CacheDev.find().fetch();
    // console.log(":: events - > ",events.length);
    eachCacheData = cacheData.map((cache, key) => {
      return cache.name;
    });*/

    // console.log(`:: CATEGORY SUGGESTIONS FOR ${this.searchQuery.get()} - > `,eachCategory );
   // console.log(`:: LOCATION SUGGESTIONS FOR ${this.searchQuery.get()} - > `,eachLocation );
   // console.log(`:: EVENT SUGGESTIONS FOR ${this.searchQuery.get()} - > `,eachEvent );
     //console.log(this,`:: CACHE SUGGESTIONS FOR ${this.searchQuery.get()} - > `,eachCacheData );
   //  console.log("eachcate:::::::::::::::", eachCategory)
    let searchResult = _.union(eachLocation, eachEvent, eachCategory, eachCacheData, this.subMenuNames);
    if(!this.searchQuery.get()) {
        searchResult = [];
    }
    //console.log(":: total search results", this.subMenuNames);
    if(searchResult && searchResult.length){
      // refocusing[ using this for fixing the delay suggestion list issue ]
      $("#autocomplete-input").focusout()
      $("#autocomplete-input").focus()
      function toObject(arr) {
        const rv = {};
        for (i = 0; i < arr.length; i += 1)
          rv[i] = arr[i];
        return rv;
      }
      const autoCompleteObject = toObject(searchResult);
      var newObj =  _.reduce(_.invert(autoCompleteObject), (memo, value, key)=> {
        let subMenuItem=this.subMenusWithPrefrence.find(o => {
          return o.names === key
        });

        if (subMenuItem && subMenuItem.preference.icon) {
          memo[key] = `./img/maki/${subMenuItem.preference.icon}.svg`;
        }
        else
        {
          let locationItem=_.find(this.itemsPreference, obj => {
             return obj.name === key
          });
          if (locationItem && locationItem.icon)
            memo[key] = `./img/maki/${locationItem.icon}.svg`;
          else
            memo[key] = './img/maki/marker-15.svg';
        }

        return memo;
      }, {});

      $('input.autocomplete').autocomplete({
        data: newObj,
        limit: 20, // The max amount of results that can be shown at once. Default: Infinity.
        minLength: 0,
        onAutocomplete: (val) => {
          if(!this.isWaiting){
              this.isWaiting = true;
            try {
              this.performSearch(val);
            } catch (exception) {
                console.log( ":: predective search exception - > ",exception );
            } finally {
              Session.set('selectedSubMenu', false)
            }
          }
        }
      });
    } else {

      $('.autocomplete-content').remove();

    }
  });
})

Template.searchBar.helpers({
  isHome(){
    if (Session.get('showMap')) {
      return false;
    }
    return true;
  },
  // searching() {
  //   return Template.instance().searching.get();
  // },
  query() {
    return Template.instance().searchQuery.get();
  },
  categories() {
    if(getSubdomain())
    {
      return dynamicCollections[getSubdomain()+'_categories'].find()
    }
    else {
      return Categories.find();
    }
  },
  getMenuItemName(){
    return Template.instance().data.selectedMenuItemName.get() || '';
  },

  showLoader(){
    return Template.instance().showLoader.get();
  },

  opts(){
    return {
      lines: 11 // The number of lines to draw
    , length: 0 // The length of each line
    , width: 4 // The line thickness
    , radius: 5 // The radius of the inner circle
    , scale: 1 // Scales overall size of the spinner
    , corners: 1 // Corner roundness (0..1)
    , color: '#000' // #rgb or #rrggbb or array of colors
    , opacity: 0.15 // Opacity of the lines
    , rotate: 0 // The rotation offset
    , direction: 1 // 1: clockwise, -1: counterclockwise
    , speed: 1 // Rounds per second
    , trail: 60 // Afterglow percentage
    , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
    , zIndex: 2e9 // The z-index (defaults to 2000000000)
    , className: 'spinner' // The CSS class to assign to the spinner
    , bottom: '0%' // Top position relative to parent
    , left: '0%' // Left position relative to parent
    , shadow: false // Whether to render a shadow
    , hwaccel: false // Whether to use hardware acceleration
    , position: 'absolute' // Element positioning
    }
  }
})


Template.searchBar.events({
  'keyup [name="search"]' (event, template) {
    let value = event.target.value.trim();
      setTimeout(() => {
        template.searchQuery.set(value);
      }, 300);
  },
  'focus #autocomplete-input' (event, template){
    $('.admin-console-link').attr('src','/adminConsoleIcon-black.png');
  },
  'click #autocomplete-input' ( event, template ) {
    $('#overlay-box').css('display','none');
    $('.fixed-action-btn').closeFAB();
    $('.admin-console-link').attr('src','/adminConsoleIcon-black.png');
     Session.set('singleMarker',false);
  },
  'click .closeIcon' ( event, inst ) {
    // setTimeout(() => {
      inst.searchQuery.set("");
      $("#autocomplete-input").val("")
      // inst.performSearch("", true);
      Session.set('categsArray', []);
      Session.set('singleMarker',false);
    // }, 300);
  },
  'submit #searchForm'(event, inst){

    event.preventDefault();
    console.log(':::-->>submit')
    inst.performSearch($('#autocomplete-input').val());
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
