import { Meteor } from 'meteor/meteor';
// import { check, Match } from 'meteor/check';
import { Enquiry } from './enquiry.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.methods({
    'Enquiry.insert'(fields) {
        fields['createdAt'] = new Date();
        let id;
        if (getSubdomain() && dynamicCollections[getSubdomain()+'_enquiry']) {
            id = dynamicCollections[getSubdomain()+'_enquiry'].insert(fields);
        } else {
           id = Enquiry.insert(fields);
        }
	      this.unblock();
	      Email.send({
	        to: fields.email,
	        from: Meteor.settings.public.adminEmail,
	        subject: "Ganda inquiry submission: " + fields.contactName,
	        html: "Contact name: " + fields.contactName + "<br/>Contact Number: " + fields.tel + "<br/>Message: " + fields.query
	      });
 	      return id;
    }
});
