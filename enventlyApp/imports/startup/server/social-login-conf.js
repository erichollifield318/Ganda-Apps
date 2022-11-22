ServiceConfiguration.configurations.remove({
    service: "facebook"
});
ServiceConfiguration.configurations.insert({
    service: "facebook",
    appId: Meteor.settings.FbAppId,
    secret: Meteor.settings.FbSecret
});
ServiceConfiguration.configurations.remove({
    service: "google"
});
ServiceConfiguration.configurations.insert({
    service: "google",
    clientId: Meteor.settings.GoogleClientId,
    secret: Meteor.settings.GoogleSecret
});
ServiceConfiguration.configurations.remove({
    service: "twitter"
});
ServiceConfiguration.configurations.insert({
    service: "twitter",
    consumerKey: Meteor.settings.TwitterConsumerKey,
    secret: Meteor.settings.TwitterSecret
});