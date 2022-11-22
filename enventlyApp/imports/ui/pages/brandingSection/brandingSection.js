import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain,getCookie } from '/imports/startup/both/global_function.js';
import './brandingSection.html';

Template.brandingSection.onCreated(function() {
    const { ReactiveVar }  =  require('meteor/reactive-var');
    Meteor.subscribe('admin_settings.all',getCookie("selectedSDForSA"));
    require('./brandingSection.css');
    this.mainImage = new ReactiveVar(null);
    this.image1 = new ReactiveVar(null);
    this.image2 = new ReactiveVar(null);
    this.image3 = new ReactiveVar(null);
    this.imageObj1 = new ReactiveVar({});
    this.imageObj2 = new ReactiveVar({});
    this.imageObj3 = new ReactiveVar({});
});

Template.brandingSection.onRendered(function() {

});

Template.brandingSection.helpers({
    branding(){
        let inst = Template.instance();
        let adminSetting = {};
        if(getSubdomain(getCookie("selectedSDForSA")))
        {
          adminSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ userId: Meteor.userId() });
        }
        else {
          adminSetting = AdminSettings.findOne({ userId: Meteor.userId() });
        }
        let branding = adminSetting && adminSetting.branding ? adminSetting.branding : {};
        let images = branding.images || [];
        let mainImage = branding.mainImage;
        if(mainImage){
            inst['mainImage'].set(mainImage);
        }
        images.map(function(image, index) {
            let sequence = index+1;
            if(image){
                inst['imageObj'+sequence].set(image);
            }
            if(image && image.path){
                 inst['image'+sequence].set(image.path);
            }
        });
        return branding;
    },

    imageObj1() {
        return Template.instance().imageObj1.get();
    },

    imageObj2() {
        return Template.instance().imageObj2.get();
    },

    imageObj3() {
        return Template.instance().imageObj3.get();
    },

    mainImage() {
        return Template.instance().mainImage.get();
    },

    image1() {
        return Template.instance().image1.get();
    },

    image2() {
        return Template.instance().image2.get();
    },

    image3() {
        return Template.instance().image3.get();
    },
    isActiveLink(link) {

        return link?"active":"";
    },

});


Template.brandingSection.events({
    'submit #brandingSection': (event, inst) => {
        Session.set('showLoading',true);
        event.preventDefault();
        let imageObj1 = {
            phone: $('#image1-phone').val(),
            link1: getAbsoluteUrl($('#image1-link1').val()),
            link2: getAbsoluteUrl($('#image1-link2').val()),
            link3: getAbsoluteUrl($('#image1-link3').val()),
            link4: getAbsoluteUrl($('#image1-link4').val())
        };
        let imageObj2 = {
            phone: $('#image2-phone').val(),
            link1: getAbsoluteUrl($('#image2-link1').val()),
            link2: getAbsoluteUrl($('#image2-link2').val()),
            link3: getAbsoluteUrl($('#image2-link3').val()),
            link4: getAbsoluteUrl($('#image2-link4').val())
        };
        let imageObj3 = {
            phone: $('#image3-phone').val(),
            link1: getAbsoluteUrl($('#image3-link1').val()),
            link2: getAbsoluteUrl($('#image3-link2').val()),
            link3: getAbsoluteUrl($('#image3-link3').val()),
            link4: getAbsoluteUrl($('#image3-link4').val())
        };
        const brandingObj = {
            header: $('#header').val(),
            body: $('#body').val(),
        };
        // alert(imageObj1)
        uploadFile('image1', 'image1', inst).then(function(imgPath){
            if(imgPath){
                imageObj1['path'] = imgPath;
            }
            return uploadFile('image2', 'image2', inst);
        }).then(function(imgPath){
            if(imgPath){
                imageObj2['path'] = imgPath;
            }
            return uploadFile('image3', 'image3', inst);
        }).then(function(imgPath){
            if(imgPath){
                imageObj3['path'] = imgPath;
            }
            brandingObj['images'] = [imageObj1, imageObj2, imageObj3];
            return uploadFile('mainImage', 'mainImage', inst);
        }).then(function(imgPath){
            if(imgPath){
                brandingObj['mainImage'] = imgPath;
            }
            let setFields = {};
            setFields['branding'] = brandingObj;
            Meteor.call('AdminSettings.update', setFields,getCookie("selectedSDForSA"), (error, result) => {
                if (error) {
                    Session.set('showLoading',false);
                    error = error.error ? error.error : error;
                    showAlert("danger", "Can not update branding section");
                }else{
                    Session.set('showLoading',false);
                    showAlert("success", "Branding section updated successfully");
                }
                $('#brandingSection').modal('close');
            });
        }).fail(function(error){
            Session.set('showLoading',false);
            console.log("error>>>>>>>", error);
        })
    },

    "change #mainImage": () => {
        showPreview('#mainImage', 'mainImage');
        console.log(":::::::::::::::;Img obj 1",imageObj1);
    },

    "change #image1": () => {
        showPreview('#image1', 'image1');
    },

    "change #image2": () => {
        showPreview('#image2', 'image2');
    },

    "change #image3": () => {
        showPreview('#image3', 'image3');
    }
});

function getAbsoluteUrl(url){
    if(!url){
        return
    }
    if(url.indexOf('www')==0){
        return 'http://'+url;
    }else{
        return url;
    }
}


function showAlert(type, message){
    Bert.alert({
        title: 'Hey there!',
        message: message,
        type: type,
        style: 'growl-top-right',
        icon: 'fa-check',
    });
}


function uploadFile(id, reactVar, inst){
    const q  = require('q');
    let d = q.defer();
    let instanceValue = inst[reactVar].get();
    if(instanceValue && instanceValue.indexOf('blob:http')>=0){
        let selector = "input#"+id
        var files = $(selector)[0].files;
        S3.upload({
                files:files,
                path:"subfolder"
            },function(e,r){
                if(e){
                    d.reject(e);
                }else{
                    d.resolve(r.secure_url);
                }
        });
    }else{
        d.resolve(instanceValue);
    }
    return d.promise;
}

function showPreview(id, reactVar){
    let inst = Template.instance();
    let tmpImgPath = URL.createObjectURL($(id)[0].files[0]);
    let fileName = $(id).val();
    let isValid = validateFile(fileName);
    if(!isValid){
        Bert.alert({
            title: 'Ups...',
            message: 'Only image files are allowed.',
            type: 'info',
            style: 'growl-top-right',
            icon: 'fa-info',
        });
    }else{
        inst[reactVar].set(tmpImgPath);
    }
  }

  function validateFile(fileName){
    let allowedExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'svg'];
    let fileExtension = fileName.split('.').pop().toLowerCase();
    let isValidFile = false;
    for(let index in allowedExtension) {
      if(fileExtension === allowedExtension[index]) {
        isValidFile = true;
        break;
      }
    }
    return isValidFile;
  }
