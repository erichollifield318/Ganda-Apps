// Tests for the behavior of the categories collection
//
// https://guide.meteor.com/testing.html

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { Categories } from './categories.js';

if (Meteor.isServer) {
  describe('categories collection', function () {
    it('insert correctly', function () {
      const categoryId = Categories.insert({
        title: 'meteor homepage',
        url: 'https://www.meteor.com',
      });
      const added = Categories.find({ _id: categoryId });
      const collectionName = added._getCollectionName();
      const count = added.count();

      assert.equal(collectionName, 'categories');
      assert.equal(count, 1);
    });
  });
}
