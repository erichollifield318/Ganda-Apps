import './enquiry.html';
Template.enquiryModal.onCreated(function enquiryOnCreated() {
	require('./enquiry.css');
    Meteor.subscribe('enquiry.all');
});


Template.enquiryModal.onRendered(function enquiryOnRendered() {
    
});


Template.enquiryModal.helpers({
	
});

Template.enquiryModal.events({
    'submit #newEnquiry'(event){
        event.preventDefault();
        let fields = {};
        
        if ($('#contactName').val()) {
            fields["contactName"] = $('#contactName').val()
        }
        if ($('#tel').val()) {
            fields["tel"] = $('#tel').val()
        }
        if ($('#email').val()) {
            fields["email"] = $('#email').val()
        }

        if ($('#query').val()) {
            fields["query"] = $('#query').val()
        }

        if(Object.keys(fields).length==0){
            return;
        }
        var subdomain = document.location.hostname.split('.');
        fields["subdomain"] = subdomain[0];
        Meteor.call('Enquiry.insert', fields, (error, result) => {
            if (error) {
                console.log('error', error);
                return;
            }
            Bert.alert({
                title: 'Hey there!',
                message: 'Thank you your enquiry has been sent',
                type: 'success',
                style: 'growl-top-right',
                icon: 'fa-check',
            });
            $('#enquiryModal').modal('close');
        });
    }
});