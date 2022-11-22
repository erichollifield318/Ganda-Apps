import { Links } from '/imports/api/links/links.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';
import { Meteor } from 'meteor/meteor';
import './info.html';

Template.info.onCreated(function () {
  Meteor.subscribe('links.all');
});

Template.info.helpers({
  links() {
    if(getSubdomain())
    {
    return dynamicCollections[getSubdomain()+'_links'].find({})
    }
    else {
      return Links.find({});
    }
  },
});

Template.info.events({
  'submit .info-link-add'(event) {
    event.preventDefault();

    const target = event.target;
    const title = target.title;
    const url = target.url;

    Meteor.call('links.insert', title.value, url.value, (error) => {
      if (error) {
        alert(error.error);
      } else {
        title.value = '';
        url.value = '';
      }
    });
  },
});
