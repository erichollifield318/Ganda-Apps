import { Meteor } from 'meteor/meteor';
import { UsageLog } from './usage_log.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.methods({
    'UsageLog.insert'(fields) {
        fields['createdAt'] = new Date();
        let id;
        if (getSubdomain() && dynamicCollections[getSubdomain()+'_usage_log']) {
            id = dynamicCollections[getSubdomain()+'_usage_log'].insert(fields);
        } else {
           id = UsageLog.insert(fields);
        }
	      this.unblock();
 	      return id;
    }
});
