import './iconModal.html';

Template.IconModal.onCreated(function() {});

Template.IconModal.onRendered(function() {});

Template.IconModal.helpers({});

Template.IconModal.events({
    'click .iconPreview' (event, inst) {
    		console.log(":: event.currentTarget = ",event.currentTarget.title);
        // let icon = $(event.currentTarget.children[0]).text();
        // icon = icon.split(".");
        $('.icon-modal').modal('close');
        Session.set('selectedIcon', event.currentTarget.title);
    },
});