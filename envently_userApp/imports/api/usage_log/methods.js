import {Meteor} from 'meteor/meteor';
import {UsageLog} from './usage_log.js';
import {dynamicCollections} from '/imports/startup/both/dynamic_collections.js';
import {getSubdomain} from '/imports/startup/both/global_function.js';

Meteor.methods({
  'UsageLog.insert'(fields) {
    fields['createdAt'] = new Date();
    let id;
    console.log('getdomain()', getSubdomain(fields['subDomain']));
    if (getSubdomain(fields['subDomain']) && dynamicCollections[getSubdomain(fields['subDomain']) + '_usage_log']) {
      console.log('subdomain success');
      id = dynamicCollections[getSubdomain(fields['subDomain']) + '_usage_log'].insert(fields);
    } else {
      console.log('direct usagelog success');
      id = UsageLog.insert(fields);
    }
    this.unblock();
    return id;
  }
});
