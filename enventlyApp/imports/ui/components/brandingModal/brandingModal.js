import './brandingModal.html';
import '/imports/ui/components/enquiry/enquiry.js'

Template.brandingModal.onCreated(function() {
    require('./brandingModal.css');
    this.mainImage = new ReactiveVar(null);
    this.image1 = new ReactiveVar(null);
    this.image2 = new ReactiveVar(null);
    this.image3 = new ReactiveVar(null);
    this.imageObj1 = new ReactiveVar({});
    this.imageObj2 = new ReactiveVar({});
    this.imageObj3 = new ReactiveVar({});
});

Template.brandingModal.onRendered(function() {
    
});

Template.brandingModal.helpers({
    branding(){
        let inst = Template.instance();
        let siteSettings = Session.get('siteSettings');
        let branding = siteSettings && siteSettings.branding ? siteSettings.branding : {};
        let images = branding.images || [];
        let mainImage = branding.mainImage;
        if(mainImage){
            inst['mainImage'].set(mainImage);
        }
        images.map(function(image, index) {
            let sequence = index+1;
            if(image){
                inst['imageObj'+sequence].set(image);
            }
            if(image && image.path){
                 inst['image'+sequence].set(image.path);
            }
        });
        return branding;
    },

    imageObj1() {
        return Template.instance().imageObj1.get();
    },

    imageObj2() {
        return Template.instance().imageObj2.get();
    },

    imageObj3() {
        return Template.instance().imageObj3.get();
    },

    mainImage() {
        return Template.instance().mainImage.get();
    },

    image1() {
        return Template.instance().image1.get();
    },

    image2() {
        return Template.instance().image2.get();
    },

    image3() {
        return Template.instance().image3.get();
    },
});

Template.brandingModal.events({
    'click .branding-link'(event){
        const link = event.target.name;
        Logger.log({action: `${Meteor.settings.public.userAppActions.externalLinkPressed} ${link}`});
    },

    'click #enquiry'(event){
        event.preventDefault();
        // $('.bottom-sheet').modal();
        $('#enquiryModal').modal('open');
    }
});

