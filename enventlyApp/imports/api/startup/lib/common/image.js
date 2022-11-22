import { Mongo } from 'meteor/mongo';
/*export const Images = new FS.Collection("images", {
  stores: [new FS.Store.FileSystem("images", {path: "~/uploads"})]
});*/


var imageStore = new FS.Store.GridFS("images")

export const Images = new FS.Collection("images", {
 stores: [imageStore]
});

Images.allow({
  insert: function() {
    return true;
  },
  update: function() {
    return true;
  },
  remove: function() {
    return true;
  },
  download: function() {
    return true;
  },
});