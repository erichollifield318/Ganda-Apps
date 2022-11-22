import './locationsDataTable.html';
import './editLocationModal.js';
import { Categories } from '/imports/api/categories/categories';
import { LocationStatus } from '/imports/api/locationsDataTable/locationStatus';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain,getCookie } from '/imports/startup/both/global_function.js';
import '/imports/ui/components/pagination/pagination.js';
import { MenuItemDev } from '/imports/api/menu_item_dev/menu_item_dev.js';

Template.locationsDataTable.onCreated(function() {
  this.showMap = new ReactiveVar(false);
  this.refreshCounter = new ReactiveVar(0);
  // searching flag
  this.searching = new ReactiveVar(false);
  // Will contain searched category text
  this.searchQuery = new ReactiveVar('');
  // Simple flat for showing edit modal
  this.showEditModal = new ReactiveVar(false);
  // Will contain the location that has been selected for 'edit' operation
  this.selectedLocation = new ReactiveVar(false);
  // Will contain selected categories results coming from sensis
  this.sensisLocations = new ReactiveVar([]);
  // Will contain datatable searched results
  this.tableSearchedLocations = new ReactiveVar([]);
  // Will contain flag, if somthing is getting searched on table or not
  this.isSearchingInTable = new ReactiveVar(false);
  // Will contain flag, if somthing is getting searched on sensis or not
  this.isSearchingInSensis = new ReactiveVar(false);
  // Will contain category list fro all menu items
  this.categoryList = new ReactiveVar([]);
  // Will contain the current sorting
  this.currentSorting = new ReactiveVar('name-asc');
  // Will contain the category list that have been selected
  this.selectedCategories = new ReactiveVar([]);

  // variables used for pagination
  this.currentPage = new ReactiveVar(1);
  this.totalRecords = new ReactiveVar(0);
  this.recordPerPage = new ReactiveVar(10);
  this.selectedDomain = new ReactiveVar(getCookie("selectedSDForSA"));

  // Will contain records only for current page
  this.paginatedRecords = new ReactiveVar([]);

  Session.set('showLoading', true);
  Meteor.setTimeout(()=>{
    Session.set('showLoading', false);
  }, 10000);

  // Bringing all menuItem categories
  Meteor.call('fetchCategoryDetails',getCookie("selectedSDForSA"), (error, result) => {
    if (error) {
      // console.log(":: fetchCategoryDetails error - > ", error);
    } else {
      // console.log(":: fetchCategoryDetails result - > ", result);
      // console.log("::BEFORE CATEGORY SORTING ---- ",_.pluck(result, 'name'));
      result = _.sortBy(result, function(category) {
        return category.name.trim().toLowerCase();
      });
      this.categoryList.set(result);
    }
  });

  // method for fetching all local locations
  this.getAllLocations = (()=>{
    Session.set('showLoading', true);
    Meteor.call('getAllLocations',getCookie("selectedSDForSA"), (error, result) => {
      Session.set('showLoading', true);
      if (error) {
        showAlert('danger', `No record found for this category`);
      } else {
        result = _.sortBy(result, function(location) {
          if(location.name) {
            return location.name.trim().toLowerCase();
          };
        });
        this.sensisLocations.set(result);
        this.totalRecords.set(result.length);
        console.log(":: getAllLocations ==== > ",result);
      }
    });
  })

  this.autorun(()=>{
    // console.log('==>',getCookie("selectedSDForSA"))
    this.subscribe('locationStatus.all',this.selectedDomain.get());
    this.subscribe('menu_item_dev.all',this.selectedDomain.get());
    let currentPage = this.currentPage.get();
    let recordPerPage = this.recordPerPage.get();
    let skipRecords = (currentPage-1)*recordPerPage;
    let filteredArr = [];
// console.log(":: Skip Records - > ",skipRecords);
// console.log(":: Records Per Page - > ",recordPerPage);
    let sourceRecord = [];
    // if user has searhed something then we are giving first priority to search results.
    if(this.isSearchingInTable.get() && this.tableSearchedLocations.get() && this.currentSorting.get()) {
// console.log("SETTING SEARCHED LOCATIONS.");
      this.totalRecords.set(this.tableSearchedLocations.get().length);
      let sourceRecord = performSorting(this.tableSearchedLocations.get(), this.currentSorting.get());
      // console.log(":: SORTED ARRAY == > ",sourceRecord);
      filteredArr = _.first( _.rest(sourceRecord, skipRecords), recordPerPage);
    } else {
// console.log("SETTING CATEGORY LOCATIONS.");
      this.totalRecords.set(this.sensisLocations.get().length);
      let sourceRecord = performSorting(this.sensisLocations.get(), this.currentSorting.get());
      // console.log(":: SORTED ARRAY == > ",sourceRecord);
      filteredArr = _.first( _.rest(sourceRecord, skipRecords), recordPerPage);
    }
// console.log(":: Filtered Array - ",filteredArr);
    this.paginatedRecords.set(filteredArr);
    // }
  });
});

Template.locationsDataTable.onRendered(function() {
  $('select').material_select();

  this.listMarkers = ((type) => {
    Meteor.call('getAllLocations',getCookie("selectedSDForSA"), (error, result) => {
        if (error) {
          showAlert('danger', `No record found for this category`);
        }
        else if (type == "map") {
          if (result.length) {
              result = result.map((elem) => {
                  elem.isApproved = getLocationStatus(elem);
                  return elem;
              });
          };
          this.showMap.set(true);
            Session.set('currentClient', 'admin');
            Session.set('categsArray', result);
        }
        else {
          this.sensisLocations.set(result);
          this.totalRecords.set(result.length);
        }
    });

  }),

  this.locationMarkers = ((event, instance, self) => {
      let location = self;

      console.log("1 Modal Loation:::: ", location)
      location.isApproved = getLocationStatus(self);

      if(location.location_ref=="custom_location"||location.location_ref=="location_data") {
          location.type = "Custom Location";

          if(self[self.location_ref] && self[self.location_ref].length) {
              location.text1 = self[self.location_ref][0].text1;
              location.text2 = self[self.location_ref][0].text2;
              location.image1 = self[self.location_ref][0].image1;
              location.image2 = self[self.location_ref][0].image2;
          }
      } else {
          location.type = "Sensis Location";
      }

      console.log("2 Modal Loation:::: ", location)
      // console.log(":: location to be edited is ---> ",location);
      instance.selectedLocation.set(location);
      Meteor.setTimeout(()=>{
          $('#editLocationModal').modal({
              ready: (modal, trigger) => {
                  // console.log(":: editLocationModal Ready.");
              },
              complete: () => {
                  // console.log(":: editLocationModal Completed.");
                  instance.getAllLocations();
                  instance.selectedLocation.set(false);
                  instance.showEditModal.set(false);
                  instance.refreshCounter.set(instance.refreshCounter.get()+1);
              }
          });
          $('#editLocationModal').modal('open');
      }, 500);
      instance.showEditModal.set(true);
  }),
  // for keeping track of current sorting.
  /*this.autorun(()=>{
    let sortingType = this.currentSorting.get();
    performSorting(sortingType, this);
  });*/

  this.autorun(()=>{
    let sorting = this.currentSorting.get();
    if(sorting/* && this.paginatedRecords.get() && this.paginatedRecords.get().length*/) {
      $('.sorting-icon').css('color', 'silver');
      $(`.${sorting}`).css('color', 'black');
      // changing the currentfileds data-sort value to other one.
      let sortDataset = sorting.split('-');
      let newSortDataset = `${sortDataset[0]}-${sortDataset[1]=='asc'?'desc':'asc'}`;
      $(`.${sortDataset[0]}-h`).attr('data-sort', newSortDataset);
    }
  });

  Meteor.setTimeout(()=>{
    $('.modal').modal();
    require('./locationsDataTable.css');
    var swiper = new Swiper('.swiper-container', {
        slidesPerColumnFill: 'row',
        freeMode: true,
        // freeModeMomentumRatio: 2,
        preventClicks: false,
        resistance : '100%',
        speed: 50,
        longSwipesMs: 100,
        controlBy: 'container',
        slidesPerView: 4,
        slidesPerColumn: 4,
        slidesPerGroup: 4,
        scrollbar: '.swiper-scrollbar',
        scrollbarDraggable: true,
        // scrollbarSnapOnRelease: true,
        scrollbarHide: false,
        // prevButton: '.prevButton',
        // nextButton: '.nextButton',
        grabCursor: true,
        mousewheelControl: true,
        mousewheelSensitivity: 5,
        // swipeHandler: '.swiper-pagination',
        pagination: '.swiper-pagination',
        // // paginationType: 'fraction',
        paginationClickable: true,
    });
// console.log('Initial Swiper',swiper);
    // swiper.init();
  }, 5000);
});

Template.locationsDataTable.helpers({
  currentPage() {
    let instance = Template.instance();
    return instance.currentPage;
  },

  totalRecords() {
    let instance = Template.instance();
    return instance.totalRecords;
  },

  recordPerPage() {
    let instance = Template.instance();
    return instance.recordPerPage;
  },

  categories() {
    // return Categories.find({}).fetch();
    let instance = Template.instance();
    // console.log(":: category list - --- > ",instance.categoryList.get());
    return instance.categoryList.get();
  },

  searchCategories() {
    let instance = Template.instance();
    let categoryList = instance.categoryList.get();
    let selectedCategories = instance.selectedCategories.get();
    let searchQuery = instance.searchQuery.get();

    // We are filtering out the categories that are already selected
    let categories = categoryList.filter((categ, i)=>{
      let result = _.where(selectedCategories, {name: categ.name});
      return !(result.length);
    });

    // Performing search
    if(searchQuery!='') {
      return categories.filter((cat, i)=>{
        let catName = cat.name.toLowerCase();
        return catName.includes(searchQuery.toLowerCase());
      });
    } else return categories;
  },

  locations() {
    let instance = Template.instance();
    return instance.paginatedRecords.get();
  },

  convertIntoArray(locations) {
    let output = [];
    for (var key in locations) {
      output.push(locations[key]);
    }
    return output
  },

  showEditModal(){
    let instance = Template.instance();
    return instance.showEditModal.get() ? instance.showEditModal.get() : false;
  },

  selectedLocation(){
    let instance = Template.instance();
    return instance.selectedLocation.get() ? instance.selectedLocation.get() : {};
  },

  getPhone() {
    if (this.primaryContacts && this.primaryContacts.length) {
      let phoneNum = _.where(this.primaryContacts, { type: "PHONE" });

      if (phoneNum && phoneNum.length) {
        return phoneNum[0].value.replace(/\D+/g, '');

      } else if (this && this.secondaryContacts && this.secondaryContacts['Toll Free'] && this.secondaryContacts['Toll Free'].length) {
        let phoneNum = _.where(this.secondaryContacts['Toll Free'], { type: "PHONE" });
        return phoneNum[0].value.replace(/\D+/g, '');

      } else {
        return ;
      }
    }

    if(this.phone){
      return this.phone
    }
  },

  getAddress() {
    // console.log('thisAddress', this.address)
    if (this.address){
      return this.address;
    }

    if (this && this.primaryAddress) {
      let addLine1 = this.primaryAddress.addressLine;
      let state = this.primaryAddress.state;
      return `${addLine1?addLine1+', ':''}${state?state:''}`;
    }
  },

  getEmail() {
    console.log('testLocations', this);
    if (this.email) {
      return this.email
    } else {
      return '';
    }
  },

  getCategory() {
    if (this.categories && !Array.isArray(this.categories)){
      return this.categories.name || this.categories;
    }

    if (this && this.categories && Array.isArray(this.categories)) {
      let temp = _.pluck(this.categories, 'name').join();
      return temp;
    }
  },

  getWebsite() {
    if (this.website){
      return this.website;
    }

    if (this && this.primaryContacts && this.primaryContacts.length) {
      let contactUrl = _.where(this.primaryContacts, { type: "URL" });
      return (contactUrl && contactUrl.length) ? contactUrl[0].value : '';
    }

    return ''
  },

  getLocationId() {
    return this.aboutId?this.aboutId:this._id
  },

  locationStatusBtnColor(isApproved) {
    if(isApproved)
      return "red";
    return "green";
  },

  locationBtnText(isApproved) {
    if(isApproved)
      return "DISAPPROVE";
    return "APPROVE";
  },

  locationStatus(isApproved) {
    if(isApproved)
      return "APPROVED";
    return "DISAPPROVED";
  },

  getType() {
    // console.log(":: this inside getType --- > ",this);
    // inside this.location_ref we will be getting location_data||coustom_data
    if(this && (this[this.location_ref] && this[this.location_ref].length))
      return "Custom Location"
    else return "Sensis Location"
  },

  getLocationStatus() {
    return getLocationStatus(this);
  },

  paginationText() {
    let instance = Template.instance();
    let totalRecords = instance.totalRecords.get();
    // console.log(totalRecords,"totalRecordstotalRecordstotalRecordstotalRecordstotalRecords")
    // if (totalRecords && totalRecords.length) {
      let currentPage = instance.currentPage.get();
      let recordPerPage = instance.recordPerPage.get();
      let skipRecords = (currentPage-1)*recordPerPage;
      let recordsTill = skipRecords+recordPerPage;
      recordsTill = recordsTill<totalRecords?recordsTill:totalRecords;
      if(totalRecords)
        return `Showing ${skipRecords+1} to ${recordsTill} of ${totalRecords} entities`;
      else return ``;
  },

  count() {
    let inst = Template.instance();
    const categoriesCount = inst.categoryList.get().length;
    if (categoriesCount < 100) {
      return `${categoriesCount} matching results`;
    }
    return `+${categoriesCount} results, search to filter.`;
  },

  categories() {
    let inst = Template.instance();
    return inst.categoryList.get()
  },

  searching() {
    return Template.instance().searching.get();
  },

  query() {
    return Template.instance().searchQuery.get();
  },
  showMap() {
      return Template.instance().showMap.get();
  },

  getMenu() {
    return getMenuSubmenuNames(this);
  },

});

Template.locationsDataTable.events({
  // Sensis Location Search Events Starts
  'click #sensisLocationSearch': (event, inst) => {
    let locationText = $('#sensisLocationText').val();

    if (!locationText) {
      showAlert('danger', `Please type location text first`);
      $('#sensisLocationText').focus();
    }

    let siteSettings = Session.get('siteSettings');
    Session.set('showLoading', true);

    Meteor.call("searchLocationOnSensis", locationText, siteSettings.suburb, siteSettings.subDomain, (error, result)=> {
      Session.set('showLoading',false);
      if (error) {
        // console.log(":: LOCATION SEARCH ERROR --- ",error);
        showAlert('danger', `Getting error in searching '${locationText}' on Sensis`);
      } else {

        // console.log(":: LOCATION SEARCH RESULTS --- ",result);
        // clearing Datatable search
        $('#tableLocationSearch').val("");
        inst.isSearchingInTable.set(false);
        inst.tableSearchedLocations.set([]);

        // setting flag for depecting locatios sensis search has happened
        inst.isSearchingInSensis.set(true);

        // clearing selected categories and their results
        let selectedCategs = inst.selectedCategories.set([]);
        $(`.category`).removeClass('deep-orange');
        $(`.category`).addClass('lime');

        inst.sensisLocations.set(result);
      }
    });

  },
  //Export to CSV
  'click #export': function(event, instance) {
      let nameFile = 'fileDownloaded.csv',
      data = instance.sensisLocations.get();
      data = data.map((location) => {
        return {
          Name: location.name,
          Address: location.address?location.address.replace(',','.'):'',
          Phone: location.phone,
          Website: location.website,
          Categories: location.categories,
          'Active Menu': getMenuSubmenuNames(location).mainMenu,
          'Menu Item': getMenuSubmenuNames(location).subMenuName
        }
      });
      if(data.length){
        Meteor.call('exportToCSV', data, function (err, fileContent) {
          if (fileContent) {
            var blob = new Blob([fileContent], {type: "text/plain;charset=utf-8"});
            saveAs(blob, nameFile);
          }
        });
      } else {
        showAlert('danger', `No record found to export`);
      }
  },
  //Export to CSV
  // 'click #export': function(event, instance) {
  //     let nameFile = 'fileDownloaded.csv',
  //         data = instance.sensisLocations.get();
  //     if(data.length){
  //         Meteor.call('exportToCSV', instance.paginatedRecords.get(), function (err, fileContent) {
  //             if (fileContent) {
  //                 var blob = new Blob([fileContent], {type: "text/plain;charset=utf-8"});
  //                 saveAs(blob, nameFile);
  //             }
  //         });
  //     } else {
  //         showAlert('danger', `No record found to export`);
  //     }
  // },
  // Sessis Location Serach Events Ends
  // Events for search modal
  'keyup [name="search"]': (event) => {
    const value = event.target.value.trim();
    Template.instance().searchQuery.set(value);

    // if (value !== '') {
    //   Template.instance().searchQuery.set(value);
    //   Template.instance().searching.set(true);
    // } else if (value === '') {
    //   Template.instance().searchQuery.set(value);
    // }
  },

  'click .close': () => {
      $('#search').val('');
      Template.instance().searchQuery.set('');
  },
  // Events for search modal

  'click .arr-item': function(event, inst) {
    // console.log("SORTING",event.currentTarget.dataset.sort);
    let sortName = event.currentTarget.dataset.sort;
    inst.currentSorting.set(sortName);
  },

  'keyup #tableLocationSearch': function(event, inst) {
    let searchedString = event.currentTarget.value;
    // console.log(":: event currentTarget --- > ",searchedString);
    let locations = inst.sensisLocations.get();

    if (searchedString!=='') {
      inst.isSearchingInTable.set(true);
      let temp = [];
      temp = locations.filter((loc, i)=>{
        // console.log(":: location name --- > ",loc.name);
        // console.log(":: searchedString --- > ",searchedString);
        // console.log(":: Is Found True ----> ",loc.name.includes(searchedString));
        let locationName = loc.name.toLowerCase();
        return locationName.includes(searchedString.toLowerCase());
      });
// console.log(":: SEARCHED LOCATIONS  ==== ",temp);
      inst.tableSearchedLocations.set(temp);
    } else {
      inst.isSearchingInTable.set(false);
    }
  },

  'change #recordsPerPage': function(event, inst) {
    inst.recordPerPage.set(parseInt(event.currentTarget.value));
  },

  'click .category': function(event, inst) {
    let catId = event.currentTarget.id;
    let catName = event.currentTarget.dataset.name;
    let locations = inst.sensisLocations.get();

    // clearing Datatable search
    $('#tableLocationSearch').val("");
    inst.isSearchingInTable.set(false);
    inst.tableSearchedLocations.set([]);

    //checking if sensis location search has happened previously or not
    if(inst.isSearchingInSensis.get()){
      // putting down the sensis search flag down
      inst.isSearchingInSensis.set(false);
      // re-init sensis Locations list
      inst.sensisLocations.set([]);
      // clearing searched text field
      $('#sensisLocationText').val('');
    }

    if ($(`#${catId}`).hasClass('deep-orange')) {
      // add orange background to the buttons
      $(`#${catId}`).removeClass('deep-orange');
      $(`#${catId}`).addClass('lime');

      // remove this category from selected category list too
      let selectedCategs = inst.selectedCategories.get()
      selectedCategs = selectedCategs.filter((c, i)=>{
        return c.name!==catName;
      });
      inst.selectedCategories.set(selectedCategs);

      // Filter out the results that belongs to the unselected results
      inst.sensisLocations.set(locations.filter((loc, i) => {
        let categoryIds = '';
        if (loc && loc.categories && Array.isArray(loc.categories))
          categoryIds = _.pluck(loc.categories, 'id').join();

        if (loc && loc.categories && !Array.isArray(loc.categories) && loc.categories.id)
          categoryIds = loc.categories.id;

        return !(categoryIds && categoryIds.includes(catId.toString()))
      }));
    } else {
      $(`#${catId}`).addClass('deep-orange');
      $(`#${catId}`).removeClass('lime');
      Session.set('showLoading', true);

      // hide modal
      $('#addCategoryModal').modal('close');

      // add this category in selected category list
      let selectedCategories = inst.selectedCategories.get();
      selectedCategories = selectedCategories.concat([{ id: catId, name: catName }]);
      inst.selectedCategories.set(selectedCategories);

      Meteor.call('findLocationsByCategory', catId, catName, Meteor.userId(),getCookie("selectedSDForSA"), (error, result)=>{
        Session.set('showLoading',false);
        if (error) {
          // console.log(":: Error in findLocationsByCategory call - ",error);
          showAlert('danger', `No record found for this category`);
        } else if (result && result.locations && result.locations.length) {
          result.locations.map((loc)=>{
            loc.subMenu = result.submenuName;
            loc.mainMenu = result.menuName;
            return loc; })
          // console.log(":: Locations for ",catName," -- ",result.locations);
          inst.sensisLocations.set(inst.sensisLocations.get().concat(result.locations));
        } else {
          // console.log(":: NO LOCATION FOUND.");
          showAlert('danger', `No record found for this category`);
        }
      });
    }
  },

  'click .location-status': function(event, instance) {
    
    this.isApproved = getLocationStatus(this);
    // console.log(":: Clicked location-status - ", this.isApproved);
    if(this && (this[this.location_ref] && this[this.location_ref].length)) {
      this.type = "Custom Location";
    }else this.type = "Sensis Location";

    Meteor.call("changeLocationStatus", this, getCookie("selectedSDForSA"), (error, result)=>{
      if (error) {
        // console.log(":: changeLocationStatus Error - ",error);
        showAlert('danger', `Can not ${this.isApproved?"disapprove":"approve"} this location`);
      } else {
        showAlert('success', `Location ${this.isApproved?"disapproved":"approved"} successfully`);
        instance.getAllLocations();
        instance.refreshCounter.set(instance.refreshCounter.get()+1);
      }
    });
  },

  'click #category-search': function(event, inst) {
    $('#addCategoryModal').modal('open');
  },

  'click #marker-button': function (event, instance) {
    event.preventDefault();

    /*
    $("#routeLocations").modal();
    $("#routeLocations").modal('open');*/

    $("#routeLocationsMarkers").modal();
    $("#routeLocationsMarkers").modal('open');
    return instance.listMarkers("map");
    },
  'click #list-button': function(event, instance) {
    event.preventDefault()
    let defBtn = event.target;
    if ($(defBtn).hasClass("white")){
      $(defBtn).removeClass("white");
      $(defBtn).addClass("grey");
      $(defBtn).css('color', 'white');

      // Fetch all local locations
      return instance.listMarkers("list");

    }else {
      $(defBtn).removeClass("grey");
      $(defBtn).addClass("white");
      $(defBtn).css('color', 'black');
      instance.sensisLocations.set([]);
    }
  },
  'click .marker-edit-icon': function(event, instance) {
    event.stopImmediatePropagation();
    let markerDetails = Session.get('categsArray').filter((marker) => {
        let markerId = marker._id || marker.aboutId
        if (marker && markerId && event.currentTarget.id)
            return markerId === event.currentTarget.id
    });
    return instance.locationMarkers(event, instance, markerDetails[0]);
  },

  'click #location-edit': function(event, instance) {
    return instance.locationMarkers(event, instance, this);
  },
  /*'click #location-delete': function(event, instance){
    console.log(":: Clicked location-delete - ",this);
    swal({
      title: "Are you sure?",
      text: "Are you sure you want to delete this location",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      closeOnConfirm: true,
      closeOnCancel: true
    }, (isConfirm) => {
        if (isConfirm) {
          Meteor.call("deleteBusinessLocation", this, (error, result)=>{
            if (error) {
              console.log(":: deleteBusinessLocation Error - ",error);
              showAlert('danger', `Can not delete this location`);
            } else {
              showAlert('success', `Location deleted successfully`);
              instance.refreshCounter.set(instance.refreshCounter.get()+1);
            }
          });
        }
    });
  },*/
});

function getLocationStatus(location) {
  let locationStatus = {};
  if(getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_location_status'])
  {
    locationStatus = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_location_status'].findOne({$or: [{ locationId: location._id }, { locationId: location.aboutId }]});
  }
  else {
    locationStatus = LocationStatus.findOne({$or: [{ locationId: location._id }, { locationId: location.aboutId }]});
  }
  // console.log(":: Location Status For - > ",location);
  if (!locationStatus || locationStatus.isApproved) {
      return true;
  } return false;
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


function performSorting(locations, key) {
  // console.log('PERFORMING SORTING ',sorting);
  let result = locations;
  // console.log(locations,key);
  if (locations && locations.length) {
    // spliting the key as it contains sorting type and key name on which we need to perform.
    let sortDataset = key.split('-');
    // alert(`:: SORT ARRAY BY ${key}`);

    if (sortDataset[0]==='name') {
      result = _.sortBy(locations, function(location) {
        return location.name.trim().toLowerCase();
      });

    }/* else if(sortDataset[0]=='address') {

    } else if(sortDataset[0]=='phone') {

    } else if(sortDataset[0]=='website') {

    } */
    else if(sortDataset[0]=='category') {
      result = _.sortBy(locations, function(location) {

        if (Array.isArray(location.categories)) {
          return location.categories[0].name.trim().toLowerCase();
        } else if (location.categories && !location.categories.name) {
          return location.categories.trim().toLowerCase();
        } else if (location.categories && location.categories.name) {
          return location.categories.name.trim().toLowerCase();
        }
      });

    } else if(sortDataset[0]=='menuItem') {
      result = _.sortBy(locations, function(location) {
        return getMenuSubmenuNames(location).subMenuName;
      });
    } else if(sortDataset[0]=='menu') {
      result = _.sortBy(locations, function(location) {
        return getMenuSubmenuNames(location).mainMenu;
      });
    }
    // if user wants descending order then we are just reversing the array
    if (sortDataset[1]==='desc') {
      result = result.reverse();
    }
  }
  return result;
}


function getMenuSubmenuNames(location) {
  let menu = [];
  let subDomain = getSubdomain(getCookie("selectedSDForSA"));
  if( subDomain && dynamicCollections[ subDomain+'_menu_item_dev'])
  {
    menu = dynamicCollections[subDomain+'_menu_item_dev'].find({'items.custom_locations': { $in: [location._id] }}).fetch();
  }
  else {
    menu = MenuItemDev.find({'items.custom_locations': { $in: [location._id] }}).fetch();
  }
  let mainMenu={}, subMenuName={};

  if(menu && menu.length){
      mainMenu = menu[0].defaultLangForMenu;
      var subMenu = _.filter(menu[0].items, (obj) => {
          return obj.custom_locations && obj.custom_locations.findIndex( id => id === location._id) !=-1;
      });
      //console.log("Items:::: ", menu[0].items, "SubMenu ::::: ", subMenu)
      //subMenuName = menu[0].items[0].defaultLangforSubmenu;
      subMenuName = subMenu.length && subMenu[0].defaultLangforSubmenu || '';
  }else{
    mainMenu = subMenuName =  '';
  }
  return {mainMenu, subMenuName};
}
