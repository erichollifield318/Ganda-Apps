import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';

import './home.html';


import '../../components/mapbox/mapbox.js';
import '../../components/loader/loader.js';


Template.appHome.onRendered(function appHomeOnRendered() {
  Tracker.autorun(() => {
    Session.set('footerHeight', $('footer').height());
  });
  $('.fixed-action-btn').css('bottom', Session.get('footerHeight') + 10);
});


Template.appHome.helpers({
  globalURL() {
    // console.log('URL', Meteor.settings.public.globalURL);

    return Meteor.settings.public.globalURL;
  },
});
