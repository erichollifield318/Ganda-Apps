// Tests for the links publications
//
// https://guide.meteor.com/testing.html

import { assert } from 'meteor/practicalmeteor:chai';
import { Categories } from '../categories.js';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import './publications.js';

describe('categories publications', function () {
  beforeEach(function () {
    Categories.remove({});
    Categories.insert({
      // title: 'meteor homepage',
      // url: 'https://www.meteor.com',
    });
  });

  describe('categories.all', function () {
    it('sends all categories', function (done) {
      const collector = new PublicationCollector();
      collector.collect('categories.all', (collections) => {
        assert.equal(collections.categories.length, 1);
        done();
      });
    });
  });
});
