// Import server startup through a single index entry point

import '../both/routes.js';
import './register-api.js';
import './social-login-conf.js';


console.log("Inside server/index file");

Meteor.startup(function () {
  const startTime = Date.now();
  process.env.MAIL_URL = 'smtp://' + encodeURIComponent(Meteor.settings.private.smtp.username) + ':' + encodeURIComponent(Meteor.settings.private.smtp.password) + '@' + encodeURIComponent(Meteor.settings.private.smtp.server) + ':' + Meteor.settings.private.smtp.port;


  let subDomain = Meteor.absoluteUrl().split("/")[2].split(".")[0];
  // Logger.log({action: `${Meteor.settings.public.userAppActions.appStart}`, subDomain: `${subDomain}`});

  var usage_log = {
    action: `${Meteor.settings.public.userAppActions.appStart}`,
    subDomain: `${subDomain}`
  };
  Meteor.call('UsageLog.insert', usage_log, (error, result) => {
    if (error) {
      console.log('error usage_log', error);
      return;
    }
    console.log('success usage_log', result);
  });

  // console.log(`action: ${Meteor.settings.public.userAppActions.appStart}, subDomain: ${subDomain}`);


  const endTime = Date.now() - startTime;
  // console.log("app start server index.js startup took", endTime, "ms");

})
