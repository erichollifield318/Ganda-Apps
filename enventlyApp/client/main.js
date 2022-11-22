// Client entry point, imports all client code
import '/imports/startup/client';
import '/imports/startup/both';

BlazeLayout.setRoot('body');

Meteor.setTimeout(() => {
    if (!Session.get("currentClient")) {
      // document.title = "Envent.ly"
      document.title = "ganda.app"
    } else {
        document.title = Session.get("currentClient");
    }
}, 10);

Meteor.startup(() => {
	const startTime = Date.now();
	const startupTime = startTime - window.performance.timing.responseStart;
    if (Meteor.userId()) {
        Meteor.call('AdminSettings.isUserExists')
        const endTime = Date.now() - startTime;
    }
});
