import {getSubdomain, setCookie, getCookie, deleteAllCookies} from '/imports/startup/both/global_function.js';
import {dynamicCollections} from '/imports/startup/both/dynamic_collections.js';
import {
  MenuItemDev
} from '/imports/api/menu_item_dev/menu_item_dev.js';
import {Subdomain} from '/imports/api/subdomain/subdomain.js';
import {UsageLog} from '/imports/api/usage_log/usage_log.js';
import {LocationDev} from '/imports/api/location_dev/location_dev.js';
import {ReactiveVar} from 'meteor/reactive-var';
import Chart from 'chart.js/dist/Chart';

import './report.html';
import '../user/user.js';

import datatables from 'datatables.net';
import datatables_bs from 'datatables.net-bs';
import 'datatables.net-bs/css/dataTables.bootstrap.css';
import './report.css';

import {json2csv} from 'json-2-csv';

Template.report.onCreated(function () {
  this.subscribe = Meteor.subscribe('usage_log.all');
  this.client = new ReactiveVar(false);
  this.menus = new ReactiveVar(false);
  // this.subdomain = new ReactiveVar(false);
  // this.showUsers = new ReactiveVar(false);
  // this.selectedSubdomain = new ReactiveVar(null);
  // this.showEdit = new ReactiveVar(false);
  this.reportFlag = new ReactiveVar(false);
  this.reportData = new ReactiveVar(false);
  this.isPageLoad = new ReactiveVar(false);
  this.reportType = new ReactiveVar(false);
  this.selectedDomain = new ReactiveVar(getCookie("selectedSDForSA"));
  this.subCategoryFlag = new ReactiveVar(false);
  this.subCategories = new ReactiveVar(false);
  this.destinationFlag = new ReactiveVar(false);
  this.allDestinations = new ReactiveVar(false);
  this.currentDestinations = new ReactiveVar(false);
  this.destinationDetailsFlag = new ReactiveVar(false);
  this.destination = new ReactiveVar(false);
  this.allUsageLog = new ReactiveVar(false);
  this.currentUsageLogs = new ReactiveVar(false);
  this.dataTable = new ReactiveVar(false);
  this.dataTableHeaders = new ReactiveVar(false);
  this.reportChartData = new ReactiveVar(false);
  this.reportChartInstance = new ReactiveVar(false);
  this.dataTableData = new ReactiveVar(false);

  var self = this;
  this.isPageLoad.set(true);
  datatables(window, $);
  datatables_bs(window, $);

  this.autorun(() => {
    if (!getCookie("selectedSDForSA")) {
      this.client.set("doublebay");
      if (getSubdomain()) {
        setCookie("selectedSDForSA", getSubdomain(), 30);
        self.selectedDomain.set(getSubdomain());
      }
    } else {
      self.client.set(getCookie("selectedSDForSA"));
    }
  });
  this.autorun(() => {
    let menuHandle = Meteor.subscribe('menu_item_dev.all', getSubdomain(getCookie("selectedSDForSA")));
    if (menuHandle.ready()) {

      if (getSubdomain(getCookie("selectedSDForSA"))) {

        this.menus.set(dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_menu_item_dev'].find({
          "publishDetails": {
            $exists: true
          }
        }, {
          sort: {
            customIndex: 1
          }
        }).fetch());
      } else {
        this.menus.set(MenuItemDev.find({
          "publishDetails": {
            $exists: true
          }
        }, {
          sort: {
            customIndex: 1
          }
        }).fetch());
      }
      Meteor.setTimeout(() => {
        $('select').material_select();

      }, 500);

      this.isPageLoad.set(false);

    }

    let destinationHandle = Meteor.subscribe('location_dev.all', getSubdomain(getCookie("selectedSDForSA")));
    if (destinationHandle.ready()) {

      if (getSubdomain(getCookie("selectedSDForSA"))) {

        this.allDestinations.set(dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_location_dev'].find({}, {
          sort: {
            categories: 1
          }
        }).fetch());
      } else {
        this.allDestinations.set(LocationDev.find({}, {
          sort: {
            categories: 1
          }
        }).fetch());
      }
    }

    let usageLogHandle = Meteor.subscribe('usage_log.all', getSubdomain(getCookie("selectedSDForSA")));
    if (usageLogHandle.ready()) {

      if (getSubdomain(getCookie("selectedSDForSA"))) {
        this.allUsageLog.set(dynamicCollections[getSubdomain(getCookie("selectedSDForSA")) + '_usage_log'].find({}).fetch());
      } else {
        this.allUsageLog.set(UsageLog.find({}).fetch());
      }
    }

  });

});

Template.report.onRendered(function () {
  var self = this;
  Meteor.setTimeout(() => {
    $(".datetimepicker").datetimepicker({
      maxDate: 0
    });

  }, 500);
  $('.datepicker').on('mousedown', function (event) {
    event.preventDefault();
  });


  this.autorun(() => {

  });

});

Template.report.onDestroyed(function () {
  // this.selectedReport.set(null);
});

Template.report.helpers({
  report() {
    return UsageLog.find().fetch();
  },
  checkSubdomainCount() {

  },

  selectedDomain() {
    return {selectedDomain: Template.instance().selectedDomain.get() || ''};
  },

  getMenu() {
    return Template.instance().menus.get() || [];
  },

  getSubCategories() {
    return Template.instance().subCategories.get() || [];
  },
  dynamicLangMenu(menuName) {
    let currentLang = Session.get('lang');
    return menuName[currentLang];
  },

  pageLoading() {
    const instance = Template.instance();
    return instance.isPageLoad.get() || false;
  },

  getSubCategoryFlag() {
    return Template.instance().subCategoryFlag.get();
  },

  getDestinationFlag() {
    return Template.instance().destinationFlag.get();
  },

  getDestinationDetailsFlag() {
    return Template.instance().destinationDetailsFlag.get();
  },

  getCurrentDestinations() {
    return Template.instance().currentDestinations.get();
  },

  getReportFlag() {
    return Template.instance().reportFlag.get();
  },

  getReportDataFlag() {
    return Template.instance().reportFlag.get() && Template.instance().reportFlag.get() !== 'user_session';
  },

  getDataTableHeaders() {
    return Template.instance().dataTableHeaders.get();
  },

});

Template.report.events({
  'submit #report-generate-form'(event, inst) {

    event.preventDefault();
    const instance = Template.instance();

    instance.currentUsageLogs.set(false);
    instance.reportFlag.set(false);
    instance.isPageLoad.set(true);
    var allUsageLogs = instance.allUsageLog.get();
    var startDate = new Date($('#report-start-date').val());
    var endDate = new Date($('#report-end-date').val());
    if (!$('#report-start-date').val() || !$('#report-end-date').val()) {
      Bert.alert({
        title: 'Warning',
        message: "Please select the Start Date and End Date",
        type: 'danger',
        style: 'growl-top-right',
        icon: 'fa-warning',
      });
      instance.isPageLoad.set(false);
    } else {
      if (instance.dataTable.get()) {
        instance.dataTable.get().destroy();
      }
      if (instance.reportChartInstance.get()) {
        instance.reportChartInstance.get().destroy();
      }
      var tableData = [];
      instance.dataTableHeaders.set(['Content', 'Count']);

      var reportChartData = {
        labels: [],
        datasets: [
          {
            label: '',
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1,
            data: []
          }
        ]
      };

      if (allUsageLogs.length > 0) {
        switch ($('#report-type').val()) {
          case 'main_category':

            instance.reportFlag.set('main_category');
            instance.currentUsageLogs.set(removeDuplicateContext(allUsageLogs.filter(function (each) {
              return (each.action === 'main menu item selected') && (new Date(each.createdAt) >= startDate) && (new Date(each.createdAt) <= endDate);
            }), 'context').sort((a, b) => (a.count < b.count) ? 1 : ((b.count < a.count) ? -1 : 0)));

            for (var i = 0; i < instance.currentUsageLogs.get().length; i++) {
              var temp = [];
              temp.push(instance.currentUsageLogs.get()[i].context);
              temp.push(instance.currentUsageLogs.get()[i].count);
              tableData.push(temp);
              if (i < 10) {
                reportChartData.labels.push(instance.currentUsageLogs.get()[i].context);
                var colorAttribute = 'rgba(' + randomColorAttrbute() + ',' + randomColorAttrbute() + ',' + randomColorAttrbute() + ',';
                reportChartData.datasets[0].backgroundColor.push(colorAttribute + '0.2)');
                reportChartData.datasets[0].borderColor.push(colorAttribute + '1)');
                reportChartData.datasets[0].data.push(instance.currentUsageLogs.get()[i].count);
              }
            }
            reportChartData.datasets[0].label = "Main Category";
            break;
          case 'sub_category':
            instance.reportFlag.set('sub_category');
            instance.currentUsageLogs.set(removeDuplicateContext(allUsageLogs.filter(function (each) {
              return (each.action === 'sub menu item selected') && (new Date(each.createdAt) >= startDate) && (new Date(each.createdAt) <= endDate);
            }), 'context').sort((a, b) => (a.count < b.count) ? 1 : ((b.count < a.count) ? -1 : 0)));

            for (var i = 0; i < instance.currentUsageLogs.get().length; i++) {
              var temp = [];
              temp.push(instance.currentUsageLogs.get()[i].context);
              temp.push(instance.currentUsageLogs.get()[i].count);
              tableData.push(temp);
              if (i < 10) {
                reportChartData.labels.push(instance.currentUsageLogs.get()[i].context);
                var colorAttribute = 'rgba(' + randomColorAttrbute() + ',' + randomColorAttrbute() + ',' + randomColorAttrbute() + ',';
                reportChartData.datasets[0].backgroundColor.push(colorAttribute + '0.2)');
                reportChartData.datasets[0].borderColor.push(colorAttribute + '1)');
                reportChartData.datasets[0].data.push(instance.currentUsageLogs.get()[i].count);
              }
            }
            reportChartData.datasets[0].label = "Sub Category";
            break;
          case 'destination':
            instance.reportFlag.set('destination');
            var reportDestinations = [];

            if ($('#report-main-category').val() === 'all') {
              instance.currentUsageLogs.set(removeDuplicateContext(allUsageLogs.filter(function (each) {
                return (each.action === 'list menu item selected') && (new Date(each.createdAt) >= startDate) && (new Date(each.createdAt) <= endDate)
              }), 'context').sort((a, b) => (a.count < b.count) ? 1 : ((b.count < a.count) ? -1 : 0)));
            } else if ($('#report-sub-category').val() === 'all') {
              var curMenus = instance.menus.get().find(each => each._id === $('#report-main-category').val());
              for (var i = 0; i < curMenus.items.length; i++) {
                if (curMenus.items[i].sensis_locations.length > 0) {
                  var destinationResult = instance.allDestinations.get().filter(function (each) {
                    return curMenus.items[i].sensis_locations.includes(each.location_ref_id)
                  });
                  for (var j = 0; j < destinationResult.length; j++) {
                    reportDestinations.push(destinationResult[j]);
                  }
                }

              }
              instance.currentUsageLogs.set(removeDuplicateContext(allUsageLogs.filter(function (each) {
                return (each.action === 'list menu item selected') && (new Date(each.createdAt) >= startDate) && (new Date(each.createdAt) <= endDate)
                  && (reportDestinations.some(eachDestination => eachDestination.name === each.context))
              }), 'context').sort((a, b) => (a.count < b.count) ? 1 : ((b.count < a.count) ? -1 : 0)));
            } else if ($('#report-destination').val() === 'all') {
              var subCat = instance.subCategories.get().find(each => each._id === $('#report-sub-category').val());
              reportDestinations = instance.allDestinations.get().filter(function (each) {
                return subCat.sensis_locations.includes(each.location_ref_id)
              });
              instance.currentUsageLogs.set(removeDuplicateContext(allUsageLogs.filter(function (each) {
                return (each.action === 'list menu item selected') && (new Date(each.createdAt) >= startDate) && (new Date(each.createdAt) <= endDate)
                  && (reportDestinations.some(eachDestination => eachDestination.name === each.context))
              }), 'context').sort((a, b) => (a.count < b.count) ? 1 : ((b.count < a.count) ? -1 : 0)));
            } else {
              reportDestinations = instance.allDestinations.get().filter(function (each) {
                return each._id === $('#report-destination').val();
              });
              instance.currentUsageLogs.set(removeDuplicateContext(allUsageLogs.filter(function (each) {
                return (each.action === 'list menu item selected') && (new Date(each.createdAt) >= startDate) && (new Date(each.createdAt) <= endDate)
                  && (reportDestinations.some(eachDestination => eachDestination.name === each.context))
              }), 'context').sort((a, b) => (a.count < b.count) ? 1 : ((b.count < a.count) ? -1 : 0)));
            }


            for (var i = 0; i < instance.currentUsageLogs.get().length; i++) {
              var temp = [];
              temp.push(instance.currentUsageLogs.get()[i].context);
              temp.push(instance.currentUsageLogs.get()[i].count);
              tableData.push(temp);
              if (i < 10) {
                reportChartData.labels.push(instance.currentUsageLogs.get()[i].context);
                var colorAttribute = 'rgba(' + randomColorAttrbute() + ',' + randomColorAttrbute() + ',' + randomColorAttrbute() + ',';
                reportChartData.datasets[0].backgroundColor.push(colorAttribute + '0.2)');
                reportChartData.datasets[0].borderColor.push(colorAttribute + '1)');
                reportChartData.datasets[0].data.push(instance.currentUsageLogs.get()[i].count);
              }
            }

            reportChartData.datasets[0].label = "Destination";
            break;
          case 'user_session':
            instance.reportFlag.set('user_session');
            instance.dataTableHeaders.set(['Action', 'Date']);
            instance.currentUsageLogs.set(allUsageLogs.filter(function (each) {
              return (each.action === 'app start' || each.action === 'app loaded') && (new Date(each.createdAt) >= startDate) && (new Date(each.createdAt) <= endDate);
            }).sort((a, b) => (a.createdAt < b.createdAt) ? 1 : ((b.createdAt < a.createdAt) ? -1 : 0)));

            for (var i = 0; i < instance.currentUsageLogs.get().length; i++) {
              var temp = [];
              temp.push(capitalizeFirstLetter(instance.currentUsageLogs.get()[i].action));
              temp.push(formatDate(instance.currentUsageLogs.get()[i].createdAt));
              tableData.push(temp);
            }

            break;

          default:
            instance.currentUsageLogs.set(false);
            instance.reportFlag.set(false);
            break;
        }
      }

      instance.reportChartData.set(reportChartData);
      instance.dataTableData.set(tableData);
      Meteor.setTimeout(() => {

        instance.dataTable.set($('.report-table').DataTable(
          {
            data: tableData
          }
        ));

        console.log('reportChartData', reportChartData);

        if (reportChartData.labels.length > 0) {
          instance.reportChartInstance.set(new Chart('report-chart', {
            type: 'horizontalBar',
            data: reportChartData,
            options: {
              maintainAspectRatio: false,
              scales: {
                xAxes: [{
                  ticks: {
                    beginAtZero: true
                  }
                }]
              }
            },
          }));
        }


        instance.isPageLoad.set(false);

      }, 500);
    }


    instance.isPageLoad.set(false);

  },

  "change #report-type"(event, inst) {
    const instance = Template.instance();
    if ($('#report-type').val() === 'destination') {
      instance.destinationFlag.set(true);
      Meteor.setTimeout(() => {
        $('#report-main-category').material_select();
      }, 500);
    } else {
      instance.destinationFlag.set(false);
      instance.subCategoryFlag.set(false);
      instance.destinationDetailsFlag.set(false);
    }
  },

  "click #report-export"(event, inst) {
    const instance = Template.instance();
    console.log("usage_log", instance.dataTableData.get());
    console.log("flag", instance.reportFlag.get());
    var jsonInput = [];
    if (instance.reportFlag.get !== 'user_session') {
      for (var i = 0; i < instance.dataTableData.get().length; i++) {
        jsonInput.push({
          Content: instance.dataTableData.get()[i][0],
          Count: instance.dataTableData.get()[i][1]
        });
      }
    } else {
      jsonInput.push({
        Action: instance.dataTableData.get()[i][0],
        Date: instance.dataTableData.get()[i][1]
      });
    }

    json2csv(jsonInput, function (err, csvContent) {
      if (err) throw err;
      console.log(csvContent);
      var encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "report_data.csv");
      document.body.appendChild(link); // Required for FF

      link.click();

    });
  },

  "change #report-main-category"(event, inst) {
    const instance = Template.instance();
    if ($('#report-main-category').val() === 'all') {
      instance.subCategoryFlag.set(false);
    } else {
      instance.subCategoryFlag.set(true);

      instance.subCategories.set(instance.menus.get().find(function (each) {
        return each._id === $('#report-main-category').val();
      }).items.filter(function(each) { return each.sensis_locations.length > 0; }));

      console.log('subCategories', instance.subCategories.get());

      Meteor.setTimeout(() => {
        $('#report-sub-category').material_select();

      }, 500);
    }
  },

  "change #report-sub-category"(event, inst) {
    const instance = Template.instance();
    if ($('#report-sub-category').val() === 'all') {

      instance.destinationDetailsFlag.set(false);
    } else {
      instance.destinationDetailsFlag.set(true);
      instance.currentDestinations.set(instance.allDestinations.get().filter(function (each) {
        return instance.subCategories.get().find(function (eachSub) {
          return eachSub._id === $('#report-sub-category').val()
        }).sensis_locations.includes(each.location_ref_id);
      }));
      Meteor.setTimeout(() => {
        $('#report-destination').material_select();

      }, 500);
    }
  },

  "change #report-destination"(event, inst) {
    const instance = Template.instance();
    instance.destination.set($('#report-destination').val());
  },

});

function removeDuplicateContext(inputArray, property) {
  var returnArray = [];
  for (var i = 0; i < inputArray.length; i++) {
    var tempFlag = false;
    for (var j = 0; j < returnArray.length; j++) {
      if (returnArray[j][property] === inputArray[i][property]) {
        returnArray[j].count++;
        tempFlag = true;
      }
    }
    if (!tempFlag) {
      inputArray[i].count = 1;
      returnArray.push(inputArray[i]);
    }
  }
  return returnArray;
}

function formatDate(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;

}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function randomColorAttrbute() {
  return Math.floor((Math.random() * 255) + 1);
}