import './languages.html';
import _ from 'lodash';
import { Template } from 'meteor/templating';

// Meteor contributed packages imports
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';
import { T9n } from 'meteor/softwarerero:accounts-t9n';

Template.languageSelect.onCreated(() => {
	$('.dropdown-button').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrainWidth: false, // Does not change width of dropdown to that of the activator
      hover: true, // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: false, // Displays dropdown below the button
      alignment: 'left', // Displays dropdown with edge aligned to the left of button
      stopPropagation: false // Stops event propagation
    }
  );
});

Template.languageSelect.onRendered(function() {
  this.autorun(()=>{
    $('select').material_select();
  });
  
  require('./languages.css');
  // Get saved language
  const selectedLanguage = Session.get('lang');
  // If language was selected before
  if (selectedLanguage) {
    TAPi18n.setLanguage(selectedLanguage);
    //T9n.setLanguage(selectedLanguage);
  } else {
    // Set English by default valueSession.setDefault('test', undefined);
    Session.setDefaultPersistent('lang', 'en');
  }
});

Template.languageSelect.helpers({
  languagesList () {
    const languageOptions = [];
    // Get all site translation languages
    const languages = TAPi18n.getLanguages();
    // Create Array of Objects with language tag and name
    _.forEach(languages, (language, tag) => {
      // Get language object
      const languageOption = language;
      // Get language tag (short language name)
      languageOption.tag = tag;
      // Add language option to array
      languageOptions.push(languageOption);
    });
    return languageOptions;
  },
  activeLanguage () {
    // Get current language
    const activeLanguage = Session.get('lang');
    // Get language from the current data context
    const languageTag = this.tag;
    // Add class "selected" to highlight active language
    if (activeLanguage === languageTag) {
      return 'selected';
    }
    return '';
  },
});

Template.languageSelect.events({
   'change #language-select' (event) {
         // Get language from the current data context


         // console.log("language selected ===> " , event.target.value);
      const language = event.target.value;
      // Update selected language in Session
      Session.update('lang', language);
      TAPi18n.setLanguage(language);

     var subdomain = document.location.hostname.split('.');


      // console.log("loaded languages ====> " , TAPi18n.languages_names[language][0]);


      // Logger.log({
      //       action: `${Meteor.settings.public.userAppActions.languageSelected}`, language: `${TAPi18n.languages_names[language][0]}`
      //   });

     var usage_log = {
       action: `${Meteor.settings.public.userAppActions.languageSelected}`,
       subDomain: `${subdomain[0]}`,
       language: `${TAPi18n.languages_names[language][0]}`
     };
     Meteor.call('UsageLog.insert', usage_log, (error, result) => {
       if (error) {
         console.log('error usage_log', error);
         return;
       }
       console.log('success usage_log', result);
     });

      //T9n.setLanguage(language);
      Meteor.setTimeout(()=>{
        $(".select-dropdown").click(function (){
            $('#overlay-box, #mainMenuList').css('display', 'none');
            $('.fixed-action-btn').closeFAB();
        });
      var details = TAPi18n.__("mapBoxMarkers.detailsButton");
      var dir = TAPi18n.__('mapBoxMarkers.directionButton');
      var call = TAPi18n.__('mapBoxMarkers.callButton');
      var curr_loc_pop = TAPi18n.__("mapBoxMarkers.currentLocationPopup");
      $(".more-info").text(details);
      $(".directions").text(dir);
      $(".call").text(call);
      $("#currentLocationMarker strong").text(curr_loc_pop);
      },200);

    },

});
