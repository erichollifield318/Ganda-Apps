import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { Session } from 'meteor/session';

// Import needed templates
import '../../ui/layouts/admin/adminBody.js';
import '../../ui/pages/admin/admin.js';
import '../../ui/pages/client/client.js';
import '../../ui/pages/home/home.js';
import '../../ui/pages/register/register.js';
import '../../ui/pages/not-found/not-found.js';
import '../../ui/pages/setPassword/setPassword.js';


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
    Session.set('currentClient', 'admin');
      BlazeLayout.render('adminBody', {
        main: 'admin',
      });

    /*import subdomain from '../client/domainconfig.js'; //Fetch the Domain Details

    Session.setDefault('currentClient', null);
    Session.setDefault('categsArray', null);

    
    if(subdomain.name == "admin")
    {
      Session.set('currentClient', 'admin');
      BlazeLayout.render('adminBody', {
        main: 'admin',
      });
    }
    else
    {
      console.log(subdomain.name)
      Meteor.call('checkSubdomainExist',subdomain.name,(err,res)=>{
        if (res) {
          Session.set('currentClient', res);
          BlazeLayout.render('appBody', {
            main: 'client',
          });
        }
        else {
          Session.set('currentClient', 'envent.ly');
          BlazeLayout.render('appBody', {
            main: 'appHome',
          });
        }
      })
    }*/
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

FlowRouter.route ('/join', {
  name: 'register',
  action () {
    BlazeLayout.render ('register');
  },
})

FlowRouter.route('/doublebay', {
  name: 'doublebay',
  action() {
    BlazeLayout.render('adminBody', {
      main: 'admin',
    });
  },
});

FlowRouter.route('/user-invitation/:token', {
  name: 'userInvitation',
  action() {
    BlazeLayout.render('setPassword');
  },
});

FlowRouter.route('/:client/:menuItem', {
  name: 'menuItem',
  action() {
    BlazeLayout.render('adminBody', {
      main: 'admin',
    });
  },
});
