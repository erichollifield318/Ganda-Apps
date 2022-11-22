// All links-related publications

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

Meteor.publish('user.all', () =>  Meteor.users.find());

Meteor.publish('user.bySubdomainId', (subdomainId) => {
	check(subdomainId, String);
	return Meteor.users.find({ 'profile.subdomainId':subdomainId });
});

Meteor.publish('user.token', (token) => {
	check(token, String);
	console.log("==> ",Meteor.users.find({ 'profile.token':token }).fetch())
	return Meteor.users.find({ 'profile.token':token });
});
