import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { Session } from 'meteor/session';
// Import needed templates


FlowRouter.route('/', {
  name: 'appHome',
  triggersEnter: [
    function () {
      Meteor.setTimeout(() => {
        $('.modal').modal();
      }, 100);
    }
  ],
  action() {

    Promise.all([
      import('../../ui/pages/admin/admin.js'),
      import('../../ui/pages/client/client.js'),
      import('../../ui/pages/home/home.js')
    ]).then(() => {
      var subdomain = document.location.hostname.split('.');
      if(Meteor.settings.public.isLocal)
        var subdomain = ['admin','doublebay','paddington'];
      Session.setDefault('currentClient', null);
      Session.setDefault('categsArray', null);
      
      switch (subdomain[0]) { 
        case 'admin':
          Session.set('currentClient', 'admin');
          BlazeLayout.render('adminBody', {
            main: 'admin',
          });
          break;
        case 'doublebay':
          Session.set('currentClient', 'doublebay');
          BlazeLayout.render('appBody', {
            main: 'client',
          });
          break;
        case 'paddington':
          Session.set('currentClient', 'paddington');
          BlazeLayout.render('appBody', {
            main: 'client',
          });
          break;
        default:
          Session.set('currentClient', 'ganda.app');
          BlazeLayout.render('appBody', {
            main: 'appHome',
          });
      }
    }).catch((error)=> console.log("error while promise return", error));
  },
});

Accounts.onLogin(() => {
  Meteor.setTimeout(() => {
    FlowRouter.go(`/${Roles.getRolesForUser(Meteor.user())}`);
  }, 500);
});

FlowRouter.notFound = {
  name: 'notFound',
  action() {
    Promise.all([
      import('../../ui/layouts/admin/adminBody.js'),
      import('../../ui/pages/not-found/not-found.js')
    ]).then(() => {
      BlazeLayout.render('appBody', {
        main: 'appNotFound',
      });
    }).catch((error)=> console.log("error while promise return", error));
  }
};

FlowRouter.route('/doublebay', {
  name: 'doublebay',
  action() {
    // console.log(":: INSIDE ACTION doublebay")
    Promise.all([
      import('../../ui/pages/admin/admin.js')
    ]).then(() => {
      // console.log(":: INSIDE ACTION.THEN")
      BlazeLayout.render('adminBody', {
        main: 'admin',
      });
    }).catch((error)=> console.log("error while promise return", error));
  },
});

FlowRouter.route('/:client/:menuItem', {
  name: 'menuItem',
  async action() {
    try{
    await import('../../ui/pages/admin/admin.js'); 
    BlazeLayout.render('adminBody', {
      main: 'admin',
    });
    } catch(error){console.log("error inside routeof router dynamic", error)}
  }
});
