// Fill/ Clean the DB with example data on startup

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

// import { Categories } from '../../api/categories/categories.js';
// import { Clients } from '../../api/clients/clients.js';
// import { MenuItemDev } from '../../api/menu_item_dev/menu_item_dev.js';
// import { EventDev } from '../../api/event_dev/event_dev.js';
	
Meteor.startup(() => {
	
  if (Meteor.isServer) {
  	
  	/*Accounts.onCreateUser((options, user) => {
      console.log(options)
      console.log(user)
    user.roles = { "appUser" : ["appUser"] };
    user.profile = options.profile;
    return user;
	})*/

  }
  // console.log("MenuItemDev.find().count()", MenuItemDev.find().count());
  // console.log("Categories.find().count()", Categories.find().count());
  // console.log("Clients.find().count()", Clients.find().count());
});
	