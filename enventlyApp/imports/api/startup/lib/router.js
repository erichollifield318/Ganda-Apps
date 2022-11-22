import {getRouterPath} from '../ui/templates/common_function.js';
import { deleteAllCookies } from '/imports/startup/both/global_function.js';
FlowRouter.wait();
	Meteor.startup(function(){
		Tracker.autorun(function(){
			users_sub=Meteor.subscribe("users");
			if(users_sub.ready()){
				 try{
					FlowRouter.initialize();
				} catch(err){
					// console.error(err)
				}
			}
		})
	})

export function checkLoggedIn (ctx, redirect) {
  if (!Meteor.userId()) {
    //redirect(getRouterPath('home'));
    FlowRouter.go(getRouterPath('home'));
  } else {
	  	let user_obj=Meteor.users.find({_id:Meteor.userId()}).fetch();
	 	 if(Roles.userIsInRole(user_obj[0], 'admin')){
		} else {
			deleteAllCookies();
			Meteor.logout();
			//redirect(getRouterPath('home'));
			FlowRouter.go(getRouterPath('home'));
		}
	}
}


export function redirectIfLoggedIn (ctx, redirect) {
  if (Meteor.userId()) {
  	let user_obj=Meteor.users.find({_id:Meteor.userId()}).fetch();

	if(Roles.userIsInRole(user_obj[0], 'admin')){
		redirect(getRouterPath('dashboard'));
	} else {
		deleteAllCookies();
		Meteor.logout();
		//redirect(getRouterPath('home'));
		FlowRouter.go(getRouterPath('home'));
	}
  } else {
  }
}

var adminDashboardRoutes = FlowRouter.group({
  prefix: '/admin',
  name: 'admin',
  triggersEnter: [redirectIfLoggedIn],
});

export var adminRoutes = FlowRouter.group({
  prefix: '/admin',
  name: 'admin',
  triggersEnter: [checkLoggedIn],
});

adminDashboardRoutes.route( '/', {
 action: function() {
    BlazeLayout.render( 'main_tmp', { layout: 'login' } );
  },
  name: 'home'
});
