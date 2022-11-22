import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import './savedlocations.html';
import { Usersdata } from '/imports/api/usersdata/usersdata.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';
Template.savedlocations.onCreated(function() {
    const { ReactiveVar } = require('meteor/reactive-var');
    Meteor.subscribe('admin_settings.all',getSubdomain());
    Meteor.subscribe('usersdata.userLocations',getSubdomain());
    require('./savedlocations.css');
});
Template.savedlocations.onRendered(function() {});
Template.savedlocations.helpers({
    locations() {
        let currentLocation = [-33.877, 151.2412],
            deviceLocation = Geolocation.currentLocation(),
            options = {
                units: 'kilometers'
            };

        if(!Meteor.settings.public.isLocal && deviceLocation && deviceLocation.coords){
            currentLocation = [deviceLocation.coords.latitude, deviceLocation.coords.longitude];
        }
        var from = turf.point(currentLocation),
            to = null,
            userDataList = [];
            if(getSubdomain())
            {
              userDataList = dynamicCollections[getSubdomain()+'_usersdata'].find({}).fetch()
            }
            else {
              userDataList = Usersdata.find({}).fetch()
            }
        return userDataList.map((item)=>{
            if(item.content){
                to = turf.point([item.content.latitude, item.content.longitude]);
                var distance = turf.distance(from, to, options);
                item.distance = String(Math.round(distance * 100) / 100) + " km";
            }else{
                item.distance = ""
            }
            return item;
        });
    },
    count() {
        var count = [];
        if(getSubdomain())
        {
          count = dynamicCollections[getSubdomain()+'_usersdata'].find({}).fetch()
        }
        else {
          count = Usersdata.find({}).fetch()
        }
        return count.length() || 0;
    }
});
Template.savedlocations.events({
    'click .remove-icon' (event, inst) {
        event.preventDefault();
        var data = this.content || {};
        swal({
            title: `Remove ${data.name} ?`,
            text: `Are you sure that you want to remove ${data.name} from Saved List?`,
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
        }, (willDelete) => {
            if (willDelete) {
                Meteor.call("usersdata.remove", this._id, (err, data) => {
                    if (err) {
                        // console.log(err);
                        notifyUser("danger", "Failed to remove location from Saved List.");
                    } else {
                        notifyUser("success", "Location removed from Saved List successfully.");
                    }
                });
            }
        });
    }
});


function notifyUser(type, msg) {
    Bert.alert({
        title: 'Hey there!',
        message: msg,
        type: type,
        style: 'growl-top-right',
        icon: 'fa-check',
    });
};
