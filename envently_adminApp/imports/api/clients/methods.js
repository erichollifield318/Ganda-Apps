// Methods related to categories

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Clients } from './clients.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain } from '/imports/startup/both/global_function.js';

Meteor.methods({
  'clients.insert'(clientObject) {
    const client = clientObject.client;
    const name = clientObject.name;
    const sensisId = clientObject.sensisId;

    check(client, String);
    check(name, String);
    check(sensisId, String);


    if (getSubdomain() && dynamicCollections[getSubdomain()+'_clients']) {
      return  dynamicCollections[getSubdomain()+'_clients'].insert({
        client,
        name,
        sensisId,
        createdAt: new Date(),
      });
    }
    return Clients.insert({
      client,
      name,
      sensisId,
      createdAt: new Date(),
    });
  },

  'clients.remove'(clientObject) {
    console.log(clientObject);
    // console.log('Clients.find()', Clients.find({ 'sensisId': clientObject }).fetch());
    if (getSubdomain() && dynamicCollections[getSubdomain()+'_clients']) {
      dynamicCollections[getSubdomain()+'_clients'].remove({ 'sensisId': clientObject })
    } else {
      Clients.remove({ 'sensisId': clientObject })
    }
    // return Clients.delete({
    //
    // });
  },
});
