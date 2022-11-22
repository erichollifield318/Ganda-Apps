import { Template } from 'meteor/templating';
import './adminBody.html';
Template.adminBody.helpers({
    authInProcess() {
        return Meteor.loggingIn();
    },
    canShow() {
        //we allowing profile with null as admin because they have been created earlier. This case will not generate after integrating the package.
        let user = Meteor.user();
        if(!user || (!Roles.userIsInRole(user._id, ['admin'], 'admin') && !Roles.userIsInRole(user._id,['super-admin'], Roles.GLOBAL_GROUP)))  {
            return false;
        } 
        return true;
    }
});