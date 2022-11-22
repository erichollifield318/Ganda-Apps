// Methods related to links

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Links } from './links.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.methods({
  'links.insert'(title, url) {
    check(url, String);
    check(title, String);

    if(getSubdomain())
    {
    return dynamicCollections[getSubdomain()+'_links'].insert({
        url,
        title,
        createdAt: new Date(),
      });
    }
    else {
      return Links.insert({
        url,
        title,
        createdAt: new Date(),
      });
    }
  },
});
