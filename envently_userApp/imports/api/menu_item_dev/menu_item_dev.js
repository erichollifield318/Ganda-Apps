// Definition of the MenuItemDev collection

import { Mongo } from 'meteor/mongo';

export const MenuItemDev = new Mongo.Collection('menu_item_dev');

MenuItemDev.allow({
  insert(userId, doc, fields, modifier) {
    return true;
  },
  update(userId, doc, fields, modifier) {
    return true;
  },
  remove(userId, doc, fields, modifier) {
    return true;
  },
});
