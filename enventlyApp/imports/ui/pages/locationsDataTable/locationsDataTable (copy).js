import './locationsDataTable.html';
import './editLocationModal.js';
import { Categories } from '/imports/api/categories/categories';
import { LocationStatus } from '/imports/api/locationsDataTable/locationStatus';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';
import '/imports/ui/components/pagination/pagination.js';

Template.locationsDataTable.onCreated(function() {
  //
  this.refreshCounter = new ReactiveVar(0);

  // Simple flat for showing edit modal
  this.showEditModal = new ReactiveVar(false);

  // Will contain the location that has been selected for 'edit' operation
  this.selectedLocation = new ReactiveVar(false);

  // Will contain selected categories results coming from sensis
  this.sensisLocations = new ReactiveVar([]);

  // Will contain datatable searched results
  this.tableSearchedLocations = new ReactiveVar([]);

  // Will contain flag, if somthing is getting searched or not
  this.isSearchingInTable = new ReactiveVar(false);

  // Will contain category list fro all menu items
  this.categoryList = new ReactiveVar(false);

  // Will contain the current sorting
  this.currentSorting = new ReactiveVar('name-asc');

  // Will contain final Locations that are going to be rendered on table and on which we have to perform pagination.
  this.finalLocations = new ReactiveVar(false);

  // variables used for pagination
  this.currentPage = new ReactiveVar(1);
  this.totalRecords = new ReactiveVar(0);
  this.recordPerPage = new ReactiveVar(10);

  // Will contain records only for current page
  this.paginatedRecords = new ReactiveVar([]);

  Session.set('showLoading', true);
  Meteor.setTimeout(()=>{
    Session.set('showLoading', false);
  }, 10000);

  // Bringing all menuItem categories
  Meteor.call('fetchCategoryDetails', (error, result) => {
    if (error) {
      console.log(":: fetchCategoryDetails error - > ", error);
    } else {
      console.log(":: fetchCategoryDetails result - > ", result);
      this.categoryList.set(result);
    }
  });

  this.autorun(()=>{
    this.subscribe('locationStatus.all');
    console.log(":: this.sensisLocations = > ",this.sensisLocations.get().length);



    // if (this.finalLocations.get() && this.finalLocations.get().length) {

    let currentPage = this.currentPage.get();
    let recordPerPage = this.recordPerPage.get();
    let skipRecords = (currentPage-1)*recordPerPage;
    let filteredArr = [];
console.log(":: Skip Records - > ",skipRecords);
console.log(":: Records Per Page - > ",recordPerPage);

    // if user has searhed something then we are giving first priority to search results.
    if(this.isSearchingInTable.get() && this.tableSearchedLocations.get()) {
console.log("SETTING SEARCHED LOCATIONS.");
      // this.finalLocations.set(this.tableSearchedLocations.get());
      this.totalRecords.set(this.tableSearchedLocations.get().length);
      filteredArr = _.first( _.rest(this.tableSearchedLocations.get(), skipRecords), recordPerPage);
    } else {
console.log("SETTING CATEGORY LOCATIONS.");
      this.totalRecords.set(this.sensisLocations.get().length);
      filteredArr = _.first( _.rest(this.sensisLocations.get(), skipRecords), recordPerPage);
    }

console.log(":: Filtered Array - ",filteredArr);
    this.paginatedRecords.set(filteredArr);
    // }

  });
});

Template.locationsDataTable.onRendered(function() {
  $('select').material_select();

  // for keeping track of current sorting.
  this.autorun(()=>{
    let sortingType = this.currentSorting.get();
    performSorting(sortingType, this);
  });

  Meteor.setTimeout(()=>{
    require('./locationsDataTable.css');
    var swiper = new Swiper('.swiper-container', {
        resistance : '100%',
        speed: 400,
        slidesPerView: 5,
        slidesPerColumn: 2,
        prevButton: '.prevButton',
        nextButton: '.nextButton',
        // slidesPerGroup: 3,
        // cssWidthAndHeight: true,
        /*createPagination:true,
        paginationHide: false,
        pagination: '.my-pagination',
        paginationClickable: true,*/
        // slidesPerViewFit: true,
    });
console.log('Initial Swiper',swiper);
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
    console.log(":: category list - --- > ",instance.categoryList.get());
    return instance.categoryList.get();
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
    if (this.address){
    	return this.address;
    }

    if (this && this.primaryAddress) {
      let addLine1 = this.primaryAddress.addressLine;
      let state = this.primaryAddress.state;
      return `${addLine1?addLine1+', ':''}${state?state:''}`;
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
    console.log(totalRecords,"totalRecordstotalRecordstotalRecordstotalRecordstotalRecords")
    // if (totalRecords && totalRecords.length) {
      let currentPage = instance.currentPage.get();
      let recordPerPage = instance.recordPerPage.get();
      let skipRecords = (currentPage-1)*recordPerPage;
      let recordsTill = skipRecords+recordPerPage;
      recordsTill = recordsTill<totalRecords?recordsTill:totalRecords;
      if(totalRecords)
        return `Showing ${skipRecords+1} to ${recordsTill} of ${totalRecords} entities`;
      else return ``;
  }
});

Template.locationsDataTable.events({
  'click .arr-item': function(event, inst) {
    console.log("SORTING",event.currentTarget.dataset.sort);
    let sortName = event.currentTarget.dataset.sort;
    inst.currentSorting.set(sortName);
  },

  'keyup #tableLocationSearch': function(event, inst) {
    let searchedString = event.currentTarget.value;
    console.log(":: event currentTarget --- > ",searchedString);
    let locations = inst.sensisLocations.get();

    if (searchedString!=='') {
      inst.isSearchingInTable.set(true);
      let temp = [];
      temp = locations.filter((loc, i)=>{
        console.log(":: location name --- > ",loc.name);
        console.log(":: searchedString --- > ",searchedString);
        console.log(":: Is Found True ----> ",loc.name.includes(searchedString));
        let locationName = loc.name.toLowerCase();
        return locationName.includes(searchedString.toLowerCase());
      });
console.log(":: SEARCHED LOCATIONS  ==== ",temp);
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
    console.log(":: catId = ",catId," :: catName",catName,event.currentTarget);
    let locations = inst.sensisLocations.get();

    // clearing Datatable search
    $('#tableLocationSearch').val("");
    inst.isSearchingInTable.set(false);
    inst.tableSearchedLocations.set([]);

    if ($(event.currentTarget).hasClass('orange')) {
      $(event.currentTarget).removeClass('orange');

      inst.sensisLocations.set(locations.filter((loc, i) => {
        let categoryIds = '';
        if (loc && loc.categories && Array.isArray(loc.categories))
          categoryIds = _.pluck(loc.categories, 'id').join();

        if (loc && loc.categories && !Array.isArray(loc.categories) && loc.categories.id)
          categoryIds = loc.categories.id;

        console.log("::: Category Ids - ",categoryIds, typeof categoryIds);
        console.log("::: CatId - ",catId.toString(), typeof catId.toString());
        console.log(":: Is Matched - > ",!(categoryIds && categoryIds.includes(catId.toString())))
        return !(categoryIds && categoryIds.includes(catId.toString()))
      }));
    } else {
      $(event.currentTarget).addClass('orange');
      Session.set('showLoading', true);
      Meteor.call('findLocationsByCategory', catId, catName, Meteor.userId(), (error, result)=>{
        Session.set('showLoading',false);
        if (error) {
          console.log(":: Error in findLocationsByCategory call - ",error);
          showAlert('danger', `No record found for this category`);
        } else if (result && result.length){
          console.log(":: Locations for ",catName," -- ",result);
          inst.sensisLocations.set(inst.sensisLocations.get().concat(result));
        } else {
          console.log(":: NO LOCATION FOUND.");
          showAlert('danger', `No record found for this category`);
        }
      });
    }
  },

  'click .location-status': function(event, instance) {
    console.log(":: Clicked location-status - ",this);
    this.isApproved = getLocationStatus(this);

    if(this && (this[this.location_ref] && this[this.location_ref].length)) {
      this.type = "Custom Location";
    }else this.type = "Sensis Location";

    Meteor.call("changeLocationStatus", this, (error, result)=>{
      if (error) {
        console.log(":: changeLocationStatus Error - ",error);
        showAlert('danger', `Can not ${this.isApproved?"disapprove":"approve"} this location`);
      } else {
        showAlert('success', `Location ${this.isApproved?"disapproved":"approved"} successfully`);
        instance.refreshCounter.set(instance.refreshCounter.get()+1);
      }
    });
  },

  'click #location-edit': function(event, instance) {
    console.log(":: Clicked location-edit - ",this);
    let location = this;
    location.isApproved = getLocationStatus(this);

    if(location.location_ref=="custom_data"||location.location_ref=="location_data") {
      location.type = "Custom Location";

      if(this[this.location_ref] && this[this.location_ref].length) {
        location.text1 = this[this.location_ref][0].text1;
        location.text2 = this[this.location_ref][0].text2;
        location.image1 = this[this.location_ref][0].image1;
        location.image2 = this[this.location_ref][0].image2;
      }
    } else {
      location.type = "Sensis Location";
    }

    console.log(":: location to be edited is ---> ",location);
    instance.selectedLocation.set(location);
    instance.showEditModal.set(true);
    Meteor.setTimeout(()=>{
      $('#editLocationModal').modal({
        ready: (modal, trigger) => {
           console.log(":: editLocationModal ready.");
        },
        complete: () => {
          console.log(":: editLocationModal destroyed.");
          instance.selectedLocation.set(false);
          instance.showEditModal.set(false);
          instance.refreshCounter.set(instance.refreshCounter.get()+1);
        }
      });
      $('#editLocationModal').modal('open');
    }, 500);
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
  if(getSubdomain())
  {
    locationStatus = dynamicCollections[getSubdomain()+'_location_status'].findOne({$or: [{ locationId: location._id }, { locationId: location.aboutId }]});
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





function performSorting(sorting, inst) {
  // console.log('PERFORMING SORTING ',sorting);

  let locationInst = false;

  if (inst.isSearchingInTable.get() && inst.tableSearchedLocations.get()) {
// console.log("PERFORMING SORTING ON SEARCHED RESULTS.",sorting);
    locationInst = inst.tableSearchedLocations;
    // this.finalLocations.set(this.tableSearchedLocations.get());
  } else {
    locationInst = inst.sensisLocations;
// console.log("PERFORMING SORTING ON SENSIS RESULTS.",sorting);
  }

  $('.sorting-icon').css('color', 'silver');
  $(`.${sorting}`).css('color', 'black');
  // changing the currentfileds data-sort value to other one.
  let sortDataset = sorting.split('-');
  let resultedArray = [];

  // if user wants descending order then we are just reversing the array
  if (sortDataset[1]==='desc') {
    resultedArray = resultedArray.reverse();
  }
  // console.log(":: SORTING LOCATIONS RESULT--- ",resultedArray);
  // console.log("::SORT DATASET - >",sortDataset);
  let newSortDataset = `${sortDataset[0]}-${sortDataset[1]=='asc'?'desc':'asc'}`;
  // console.log("::NEW SORT DATASET - >",newSortDataset);
  $(`.${sortDataset[0]}-h`).attr('data-sort', newSortDataset);
  // locationInst.set(resultedArray);

  return

  // if performing ascending sort by default
  if(locationInst.get() && locationInst.get().length){
    // console.log(":: SORTING LOCATIONS --- ",locationInst.get());
    if (sortDataset[0]==='name') {
      resultedArray = _.sortBy(locationInst.get(), function(location) {
          return location.name;
      });

    } else if(sortDataset[0]=='address') {

    } else if(sortDataset[0]=='phone') {

    } else if(sortDataset[0]=='website') {

    } else if(sortDataset[0]=='category') {

    }

  }
}
