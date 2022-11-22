import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { Session } from 'meteor/session';

// Import needed templates
if (Meteor.isClient) {
  import '../../ui/layouts/body/body.js';
  import '../../ui/pages/client/client.js';
  import '../../ui/pages/home/home.js';
  import '../../ui/pages/not-found/not-found.js';
  
}
console.log("Inside routes file");


FlowRouter.route('/', {
  name: 'appHome',
  triggersEnter: [
    function () {
      Meteor.setTimeout(() => {
        $('.modal').modal();
      }, 100);
    },
    function () {
      if(Meteor.isCordova) {
        let deviceCords = [];
        let useragent = navigator.userAgent.toLowerCase();
        if (useragent.indexOf("android") > -1) {
          // Ask GPS activation if not activated
          navigator.geolocation.activator.askActivation(function(response) {
            // console.log("gps askActivation Success", response);
            //Success callback
            navigator.geolocation.watchPosition(function(position) {
              deviceCords = [position.coords.longitude, position.coords.latitude];
              Session.set('deviceLocation',deviceCords);
            });
            if (response.status == 8) {
              location.reload(true);
            }
          }, function(response) {
            //Failure callback
            // console.log("gps askActivation Failure", response);
          });
        } else {
          // console.log("inside ios device");
          //Success callback
          navigator.geolocation.watchPosition(function(position) {
            deviceCords = [position.coords.longitude, position.coords.latitude];
            Session.set('deviceLocation',deviceCords);
          }, function (error) {
              console.log('code: '+ error.code, ' message: ' + error.message);
          }, {
              enableHighAccuracy: true 
          });
        }
      }
    }
  ],
  action() {


    import subdomain from '../client/domainconfig.js'; //Fetch the Domain Details

    Session.setDefault('currentClient', null);
    Session.setDefault('categsArray', null);
    Meteor.call('checkSubdomainExist',subdomain.name,(err,res)=>{
      // console.log("===> res ",res)
      if (res) {
        Session.set('currentClient', res);
        BlazeLayout.render('appBody', {
          main: 'client',
        });
      }
      else {
        Session.set('currentClient', 'ganda.app');
        BlazeLayout.render('appBody', {
          main: 'appHome',
        });
      }
    })
  },
});

FlowRouter.notFound = {
  name: 'notFound',
  action() {
    BlazeLayout.render('appBody', {
      main: 'appNotFound',
    });
  },
};
