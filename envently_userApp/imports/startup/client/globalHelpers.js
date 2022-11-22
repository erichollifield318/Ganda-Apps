import { Template } from 'meteor/templating'

//import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { idleScreenTimer, showScreenSaver } from '/imports/startup/client/reactiveVar.js';
import { getSubdomain, getCookie } from '/imports/startup/both/global_function.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';

Template.registerHelper('decodeString', (string) => {
  const encodedStr = string;
  const parser = new DOMParser;
  const dom = parser.parseFromString(
      '<!doctype html><body>' + encodedStr,
      'text/html');
  return dom.body.textContent;
});

Deps.autorun(function () {
  var userobj = Meteor.user();
  document.title = getTitleValue(userobj)
});

function getTitleValue(userobj){
	if(userobj && userobj.roles  && userobj.roles.length){
      return userobj.roles[0]
  }else{
  	var subdomain = document.location.hostname.split('.');
  	if(subdomain[0]=='admin')
      return 'Ganda Admin';
    else return subdomain[0];
  }
}


export function screensaver () {
  // console.log("click");
  let timer = 30000;
  let siteSettings = {}
  // console.log("cookie ===>" ,getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings');
  // console.log("data from dynamic dynamic_collections" , dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne());
  if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
   
    siteSettings = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
      // console.log("under if siteSettings ===> " , siteSettings);    
  } else{
    siteSettings = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
    // console.log("under else siteSettings ===> " , siteSettings);
  }
  
  // set timer from db
  if(siteSettings && siteSettings.kioskUser) 
    timer = siteSettings.kioskUser.screenSaverTimer || 30000;

  // check is timer available
  if (idleScreenTimer.get()) {
    

      // console.log("")
    // clear timer
    Meteor.clearInterval(idleScreenTimer.get());
    idleScreenTimer.set(false);
    showScreenSaver.set(false);
  }

  //set new timer id
  idleScreenTimer.set(

    // start new timer
    Meteor.setInterval(()=>{
      
      // check is user is login or not and has kiosk role on that user
      if (Roles.userIsInRole(Meteor.userId(),['kiosk'], 'kiosk') && Meteor.userId()){

        // show screen saver
        showScreenSaver.set(true);
      }
    }, timer)
  );
}

export function siteSettings () {
  let siteSettings = {}
  if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
    siteSettings = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
  } else{
    siteSettings = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
  }
  return siteSettings
}