// import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
// import AWS from 'aws-sdk';

import('aws-sdk').then((AWS) => {
    var AWSs3 = new AWS.S3({
        apiVersion: '2006-03-01',
        accessKeyId: Meteor.settings.awsAccessKeyId,
        secretAccessKey: Meteor.settings.awsSecretKey
    });
    /*	let adminSetting = AdminSettings.findOne({userId: this.userId, awsBucket:Meteor.settings.awsBucket});
    	if(!adminSetting){*/
    // not exist
    //check in list buckets -- if not exists then create new and insert in adminSettings collection 
    var params = {};
    AWSs3.listBuckets(params, Meteor.bindEnvironment((err, data) => {
        if (err) console.log("err...", err);
        else {
            let Buckets = data.Buckets || [];
            let isExist = _.findWhere(Buckets, { Name: Meteor.settings.awsBucket });
            if (!isExist) {
                var params = {
                    Bucket: Meteor.settings.awsBucket
                };
                AWSs3.createBucket(params, Meteor.bindEnvironment((err, data) => {
                    if (err) {
                        console.log("err", err);
                    } else {
                        /*AdminSettings.update({ userId: this.userId }, { $set: { "awsBucket": Meteor.settings.awsBucket, updatedAt: new Date() } }
  											)*/
                    }
                }));
            }
        }
    }));
});



S3.config = {
    key: Meteor.settings.awsAccessKeyId,
    secret: Meteor.settings.awsSecretKey,
    bucket: Meteor.settings.awsBucket,
    region: Meteor.settings.awsRegion
};
