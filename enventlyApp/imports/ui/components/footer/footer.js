// import moment from 'moment';
import '../brandingModal/brandingModal.js';
import './footer.html';

Template.dynamicFooter.onCreated(function() {
    require('./footer.css');
    this.image2 = new ReactiveVar(null);
    /*if (Session.get('categsArray').length === 0) {
      alert("not");
    }*/
});

Template.dynamicFooter.onRendered(function() {
  console.log('',Session.get('siteSettings'))
  this.autorun(()=> {
    let siteSettings = Session.get('siteSettings');
    let branding = siteSettings && siteSettings.branding ? siteSettings.branding : {};
    let images = branding.images || [];
    images.map((image, index) => {
        if(image && image.path && index === 1){
             this['image2'].set(image.path);
        }
    });
  });
})

Template.dynamicFooter.helpers({
  /*currentYear() {
    return moment().format('YYYY');
  },*/

  currentClient() {
    return Session.get('currentClient');
  },
  getFooterImage(){
    let siteSettings = Session.get('siteSettings');
    let branding = siteSettings && siteSettings.branding ? siteSettings.branding : {};
    if(branding.mainImage){
      return branding.mainImage;
    }
    return undefined;
  },
  getFooterImage2(){
    console.log(':: image2 ',Template.instance().image2.get())
    return Template.instance().image2.get();
  },

 /* isVisibleText() {
    var arr = Session.get('categsArray');
    if (arr){
      if (arr.length > 0 ) {
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }*/
});

Template.dynamicFooter.events({
    'click #branding'(event){
      let siteSettings = Session.get('siteSettings');
        let branding = siteSettings && siteSettings.branding ? siteSettings.branding : {};
        if(branding.body && branding.header){
          $('#brandingModal').modal();
          $("#brandingModal").modal('open');
        }
    }/*,
    'click .heading-list' (event, inst) { 
        $('#bottomSheetModalId').modal('open');
        Session.set("currentMenu", null);
    }*/
})