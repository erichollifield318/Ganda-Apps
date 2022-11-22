// All links-related publications

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

Meteor.publish('user.bySubdomainId', (subdomainId) => {
	check(subdomainId, String);
	return Meteor.users.find({ 'profile.subdomainId':subdomainId });
});

Meteor.publish('user.token', (token) => {
	check(token, String);
	return Meteor.users.find({ 'profile.token':token });
});
