// Client entry point, imports all client code
import '/imports/startup/client';
import '/imports/startup/both';

BlazeLayout.setRoot('body');

Meteor.setTimeout(() => {
    if (!Session.get("currentClient")) {
        document.title = "Ganda"
    } else {
        document.title = Session.get("currentClient");
    }
    Session.set("isOnline", navigator.onLine);
}, 10);

Meteor.setInterval(() => {
    Session.set("isOnline", navigator.onLine);
},30000);


/*Meteor.startup(() => {
    Reloader.configure({
    check: 'everyStart', // Check for new code every time the app starts
    checkTimer: 3000,  // Wait 3 seconds to see if new code is available
    refresh: 'startAndResume', // Refresh to already downloaded code on both start and resume
    idleCutoff: 1000 * 60 * 10  // Wait 10 minutes before treating a resume as a start
  });
})*/

/*Meteor.startup(() => {
	const startTime = Date.now();
	const startupTime = startTime - window.performance.timing.responseStart;
    if (Meteor.userId()) {
        Meteor.call('AdminSettings.isUserExists')
        const endTime = Date.now() - startTime;
    }
});*/
