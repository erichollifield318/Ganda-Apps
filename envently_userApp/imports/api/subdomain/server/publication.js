// All links-related publications

import { Meteor } from 'meteor/meteor';
import { Subdomain } from '../subdomain.js';

Meteor.publish('subdomain.all', () => Subdomain.find());