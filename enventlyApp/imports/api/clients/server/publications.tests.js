// Tests for the links publications
//
// https://guide.meteor.com/testing.html

import { assert } from 'meteor/practicalmeteor:chai';
import { Clients } from '../clients.js';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import './publications.js';

describe('clients publications', function () {
  beforeEach(function () {
    Clients.remove({});
    Clients.insert({

    });
  });

  describe('clients.all', function () {
    it('sends all categories', function (done) {
      const collector = new PublicationCollector();
      collector.collect('categories.all', (collections) => {
        assert.equal(collections.categories.length, 1);
        done();
      });
    });
  });
});
