import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain,getCookie } from '/imports/startup/both/global_function.js';
import './brandingSection.html';

Template.brandingSection.onCreated(function() {
    const { ReactiveVar }  =  require('meteor/reactive-var');
    require('./brandingSection.css');
    this.mainImage = new ReactiveVar(null);
    this.landingImageTeblet = new ReactiveVar(null);
    this.landingImageMobile = new ReactiveVar(null);
    this.landingImageKiosk = new ReactiveVar(null);
    this.landingPageHeadingImage = new ReactiveVar(null);
    this.logo1 = new ReactiveVar(null);
    this.logo2 = new ReactiveVar(null);
    this.sidelogo = new ReactiveVar(null);
    this.image1 = new ReactiveVar(null);
    this.image2 = new ReactiveVar(null);
    this.image3 = new ReactiveVar(null);
    this.adminModalLogo = new ReactiveVar(null);
    this.imageObj1 = new ReactiveVar({});
    this.imageObj2 = new ReactiveVar({});
    this.imageObj3 = new ReactiveVar({});
    this.adminSetting = new ReactiveVar({});
});

Template.brandingSection.onRendered(function() {
    this.autorun(()=>{
        const brandingHandle = Meteor.subscribe('admin_settings.all',this.data.selectedDomain);
        if (brandingHandle.ready()) {
            let adminSetting = {};
            if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
                adminSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getSubdomain(getCookie("selectedSDForSA")) });
                this.adminSetting.set(adminSetting);
            } else {
              adminSetting = AdminSettings.findOne({ subDomain: 'doublebay' });
              this.adminSetting.set(adminSetting);
            }
        }
    });
});

Template.brandingSection.onDestroyed(function () {
    // console.log('onDestroyed')
})

Template.brandingSection.helpers({
    branding(){
        let inst = Template.instance();
        let adminSetting = {};
        if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
            adminSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getSubdomain(getCookie("selectedSDForSA")) });
        } else {
            adminSetting = AdminSettings.findOne({ subDomain: 'doublebay' });   
        }
        /*if(getSubdomain(getCookie("selectedSDForSA")))
        {
            console.log("getSubdomain(getCookie(\"selectedSDForSA\")) ",getSubdomain(getCookie("selectedSDForSA")))
            adminSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getSubdomain(getCookie("selectedSDForSA")) });
        }
        else {
          adminSetting = AdminSettings.findOne({ userId: Meteor.userId() });
          console.log("adminSetting ",adminSetting)
        }*/
        let branding = adminSetting && adminSetting.branding ? adminSetting.branding : {};
        let images = branding.images || [];
        let mainImage = branding.mainImage;
        let sidelogo = branding.sidelogo;
        let adminModalLogo = branding.adminModalLogo;
        let landingImageTeblet = '';
        let landingImageMobile = '';
        let landingImageKiosk = '';
        let landingPageHeadingImage = '';
        if (branding && branding.landingPageObject) {
            landingImageTeblet = branding.landingPageObject.landingImageTeblet || '';
            landingImageMobile = branding.landingPageObject.landingImageMobile || '';
            landingImageKiosk = branding.landingPageObject.landingImageKiosk || '';
            landingPageHeadingImage = branding.landingPageObject.landingPageHeadingImage || '';
        }
        let logo1 = '';
        let logo2 = '';
        if (branding && branding.footerLogos) {
            logo1 = branding.footerLogos.logo1 || '';
            logo2 = branding.footerLogos.logo2 || '';
        }
        if(mainImage){
            inst['mainImage'].set(mainImage);
        }
        if (sidelogo) {
            inst['sidelogo'].set(sidelogo);
        }
        if (landingPageHeadingImage) {
           inst['landingPageHeadingImage'].set(landingPageHeadingImage); 
        }
        if (landingImageTeblet) {
            inst['landingImageTeblet'].set(landingImageTeblet);
        }
        if (landingImageMobile) {
           inst['landingImageMobile'].set(landingImageMobile); 
        }
        if (landingPageHeadingImage) {
            inst['landingPageHeadingImage'].set(landingPageHeadingImage);
        }
        if (landingImageKiosk) {
           inst['landingImageKiosk'].set(landingImageKiosk); 
        }
        if (logo1) {
            inst['logo1'].set(logo1);
        }
        if (logo2) {
            inst['logo2'].set(logo2);
        }
        if (adminModalLogo) {
            inst['adminModalLogo'].set(adminModalLogo);
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
    checkActive (val) {
        if (val && val !== '')
            return 'active';
        return '';
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

    logo1() {
        return Template.instance().logo1.get();
    },

    logo2() {
        return Template.instance().logo2.get();
    },

    landingImageTeblet() {
        return Template.instance().landingImageTeblet.get();
    },

    landingImageKiosk() {
        return Template.instance().landingImageKiosk.get();
    },

    landingImageMobile() {
        return Template.instance().landingImageMobile.get();
    },

    landingPageHeadingImage() {
        return Template.instance().landingPageHeadingImage.get();
    },

    sideLogo() {
        return Template.instance().sidelogo.get();
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
    adminModalLogo () {
        return Template.instance().adminModalLogo.get();
    },
    isActiveLink(link) {

        return link?"active":"";
    },
    showCloseButton (url) {
        if (url.search('blob') == -1)
            return true;

        return false;
    },
    cssValues () {
        let adminSettings = {};
        if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
            adminSettings = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getSubdomain(getCookie("selectedSDForSA")) });
        } else {
            adminSetting = AdminSettings.findOne({ subDomain: 'doublebay' });   
        }

        if (adminSettings && adminSettings.branding && adminSettings.branding.cssField)
            return adminSettings.branding.cssField;

        return '';
    }

});


Template.brandingSection.events({
    'click #color' (event, inst) {
        if (!$('#color').val()) {
            $('#color').val('#FFFFFF'); //To Avoid throwing exceptions.
        }
        var colors1 = jsColorPicker('#color', {
            readOnly: true,
            fps: 60, // the framerate colorPicker refreshes the display if no 'requestAnimationFrame'
            delayOffset: 8, // pixels offset when shifting mouse up/down inside input fields before it starts acting as slider
            CSSPrefix: 'cp-', // the standard prefix for (almost) all class declarations (HTML, CSS)
            size: 3, // one of the 4 sizes: 0 = XXS, 1 = XS, 2 = S, 3 = L (large); resize to see what happens...
            allMixDetails: true, // see Colors...
            alphaBG: 'w', // initial 3rd layer bgColor (w = white, c = custom (customBG), b = black);
            cmyOnly: false, // display CMY instead of CMYK
            opacityPositionRelative: '%', // render opacity slider arrows in px or %
            customCSS: undefined, // if external stylesheet, internal will be ignored...
            noRangeBackground: false, // performance option: doesn't render backgrounds in input fields if set to false
            noHexButton: false, // button next to HEX input could be used for some trigger...
            noResize: true, // enable / disable resizing of colorPicker
            noRGBr: false, // active / passive button right to RGB-R display. Disables rendering of 'real' color possibilities...
            noRGBg: false, // same as above
            noRGBb: false, // same as above
            noAlpha: true, // disable alpha input (all sliders are gone and current alpha therefore locked)
            multipleInstances: true,
            appenTo: document.getElementById('outColorPickerAdminNewItemModal'),
            init: function(elm, colors)  {},
        });
    },

    

        /*'click #submitValue' (event, inst) {
            event.preventDefault();
            Session.set('showLoading',true);
        let pageContent = {
            heading: $('#heading').val(),
            subHeading: $('#subheading').val(),
            colorText: $('#color').val()
        }
        Meteor.call('AdminSettings.update', pageContent, getSubdomain(getCookie("selectedSDForSA")), (error, result) => {
            if (error) {
                Session.set('showLoading',false);
                error = error.error ? error.error : error;
                showAlert("danger", "Can not update branding section");
            } else{
                Session.set('showLoading',false);
                showAlert("success", "Branding section updated successfully");
            }
            $('#landingPageDiv').modal('close');
        });
        },*/
    
    /*"change #mainImage": () => {
        showPreview('#landi', 'mainImage');
    },
*/


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
            heading: $('#heading').val(),
            subHeading: $('#subheading').val(),
            colorValue: $('#color').val(),
            cssField:  $('#cssField').val()
        };
        let landingPageObject = {
            
        };

        let footerLogos = {

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
            return uploadFile('sidelogo', 'sidelogo', inst);
        }).then(function(imgPath){
            if(imgPath){
                brandingObj['sidelogo'] = imgPath;
            }       
            return uploadFile('landingImageTeblet', 'landingImageTeblet', inst);
        }).then(function(imgPath){
            if(imgPath){
                landingPageObject['landingImageTeblet'] = imgPath;
            }// dfdfdf
            return uploadFile('landingImageMobile', 'landingImageMobile', inst);
        }).then(function(imgPath){
            if(imgPath){
                landingPageObject['landingImageMobile'] = imgPath;
            }// dfdfdf
            return uploadFile('landingPageHeadingImage', 'landingPageHeadingImage', inst);
            }).then(function(imgPath){
            if(imgPath){
                landingPageObject['landingPageHeadingImage'] = imgPath;
            }
            return uploadFile('landingImageKiosk', 'landingImageKiosk', inst);
        }).then(function(imgPath){
            if(imgPath){
                landingPageObject['landingImageKiosk'] = imgPath;
            }// dfdfdf
            brandingObj['landingPageObject'] = landingPageObject;

            return uploadFile('logo1', 'logo1', inst);
        }).then(function(imgPath){
            if(imgPath){
                footerLogos['logo1'] = imgPath;
            } 
            return uploadFile('logo2', 'logo2', inst);
        }).then(function(imgPath){
            if(imgPath){
                footerLogos['logo2'] = imgPath;
            } 
            brandingObj['footerLogos']= footerLogos;
            return uploadFile('adminModalLogo', 'adminModalLogo', inst);
        }).then(function(imgPath){
            if(imgPath){
                brandingObj['adminModalLogo']= imgPath;
            } 
            



            let setFields = {};
            setFields['branding'] = brandingObj;
            Meteor.call('AdminSettings.update', setFields, getSubdomain(getCookie("selectedSDForSA")), (error, result) => {
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
            // console.log("error>>>>>>>", error);
        })
    },


    'click .dtImgDelete' (event, inst) {
        
 
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this imaginary file!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
        }, (willDelete) => {
            if (willDelete) {
                    
                Session.set('showLoading',true);
                let imageId = event.currentTarget.id;
                let adminSetting = inst.adminSetting.get();
                const bucket = "envent.ly"
                let current=null;
                let perfect=null;
                let fieldDeleteInDb = null;
                if (imageId === 'deleteMainImage') {
                    currentPhoto = adminSetting.branding.mainImage;
                    if (currentPhoto) {
                        perfect = currentPhoto.replace('https://s3-ap-southeast-2.amazonaws.com/'+bucket, '');
                        fieldDeleteInDb = 'branding.mainImage';
                        deleteImage(perfect, fieldDeleteInDb, inst, 'mainImage');
                    }
                } else if (imageId==='deleteSideLogoImage') {
                    currentPhoto = adminSetting.branding.sidelogo;
                    if (currentPhoto) {
                        perfect = currentPhoto.replace('https://s3-ap-southeast-2.amazonaws.com/'+bucket, '');
                        fieldDeleteInDb = 'branding.sidelogo';
                        deleteImage(perfect, fieldDeleteInDb, inst, 'sidelogo');
                    }
                } else if (imageId==='deleteImage1') {
                    currentPhoto = adminSetting.branding.images[0].path;
                    if (currentPhoto) {
                        perfect = currentPhoto.replace('https://s3-ap-southeast-2.amazonaws.com/'+bucket, '');
                        fieldDeleteInDb = 'branding.images.0.path';
                        deleteImage(perfect, fieldDeleteInDb, inst, 'image1');
                    }
                } else if (imageId==='deleteImage2') {
                    currentPhoto = adminSetting.branding.images[1].path;
                    if (currentPhoto) {
                        perfect = currentPhoto.replace('https://s3-ap-southeast-2.amazonaws.com/'+bucket, '');
                        fieldDeleteInDb = 'branding.images.1.path';
                        deleteImage(perfect, fieldDeleteInDb, inst, 'image2');
                    }
                } else if (imageId==='deleteImage3') {
                    currentPhoto = adminSetting.branding.images[2].path;
                    if (currentPhoto) {
                        // console.log('currentPhoto', currentPhoto)
                        perfect = currentPhoto.replace('https://s3-ap-southeast-2.amazonaws.com/'+bucket, '');
                        fieldDeleteInDb = 'branding.images.2.path';
                    }
                    deleteImage(perfect, fieldDeleteInDb, inst, 'image3');
                } else if (imageId==='deleteLandingPageHeadingImage') {
                    currentPhoto = adminSetting.branding.landingPageObject.landingPageHeadingImage;
                    if (currentPhoto) {
                        perfect = currentPhoto.replace('https://s3-ap-southeast-2.amazonaws.com/'+bucket, '');
                        fieldDeleteInDb = 'branding.landingPageObject.landingPageHeadingImage';
                        deleteImage(perfect, fieldDeleteInDb, inst, 'landingPageHeadingImage');
                    }
                } else if (imageId==='deleteLandingImageTeblet') {
                    currentPhoto = adminSetting.branding.landingPageObject.landingImageTeblet;
                    if (currentPhoto) {
                        perfect = currentPhoto.replace('https://s3-ap-southeast-2.amazonaws.com/'+bucket, '');
                        fieldDeleteInDb = 'branding.landingPageObject.landingImageTeblet';
                        deleteImage(perfect, fieldDeleteInDb, inst, 'landingImageTeblet');
                    }
                } else if (imageId==='deleteLandingImageMobile') {
                    currentPhoto = adminSetting.branding.landingPageObject.landingImageMobile;
                    if (currentPhoto) {
                        perfect = currentPhoto.replace('https://s3-ap-southeast-2.amazonaws.com/'+bucket, '');
                        fieldDeleteInDb = 'branding.landingPageObject.landingImageMobile';
                        deleteImage(perfect, fieldDeleteInDb, inst, 'landingImageMobile');
                    }
                } else if (imageId==='deleteLandingImageKiosk') {
                    currentPhoto = adminSetting.branding.landingPageObject.landingImageKiosk;
                    if (currentPhoto) {
                        perfect = currentPhoto.replace('https://s3-ap-southeast-2.amazonaws.com/'+bucket, '');
                        fieldDeleteInDb = 'branding.landingPageObject.landingImageKiosk';
                        deleteImage(perfect, fieldDeleteInDb, inst, 'landingImageKiosk');
                    }
                } else if (imageId==='logo1') {
                    currentPhoto = adminSetting.branding.footerLogos.logo1;
                    if (currentPhoto) {
                        perfect = currentPhoto.replace('https://s3-ap-southeast-2.amazonaws.com/'+bucket, '');
                        fieldDeleteInDb = 'branding.footerLogos.logo1';
                        deleteImage(perfect, fieldDeleteInDb, inst, 'logo1');
                    }
                } else if (imageId==='logo2') {
                    currentPhoto = adminSetting.branding.footerLogos.logo2;
                    if (currentPhoto) {
                        perfect = currentPhoto.replace('https://s3-ap-southeast-2.amazonaws.com/'+bucket, '');
                        fieldDeleteInDb = 'branding.footerLogos.logo2';
                        deleteImage(perfect, fieldDeleteInDb, inst, 'logo2');
                    }
                } else if (imageId==='deleteAdminModalLogo') {
                    currentPhoto = adminSetting.branding.adminModalLogo;
                    if (currentPhoto) {
                        perfect = currentPhoto.replace('https://s3-ap-southeast-2.amazonaws.com/'+bucket, '');
                        fieldDeleteInDb = 'branding.adminModalLogo';
                        deleteImage(perfect, fieldDeleteInDb, inst, 'adminModalLogo');
                    }
                }
            } /*else {
                   
                }*/
        });
    },

    "change #mainImage": () => {
        showPreview('#mainImage', 'mainImage');
    },

    "change #landingImageTeblet": () => {
        showPreview('#landingImageTeblet', 'landingImageTeblet');
    },

    "change #landingImageKiosk": () => {
        showPreview('#landingImageKiosk', 'landingImageKiosk');
    },

    "change #landingPageHeadingImage": () => {
        showPreview('#landingPageHeadingImage', 'landingPageHeadingImage');
    },

    "change #landingImageMobile": () => {
        showPreview('#landingImageMobile', 'landingImageMobile');
    },

    "change #logo1": () => {
        showPreview('#logo1', 'logo1');
    },

    "change #logo2": () => {
        showPreview('#logo2', 'logo2');
    },
    /*'change #landingImageMobile'*/

    "change #sidelogo": () => {
        showPreview('#sidelogo', 'sidelogo');
    },

    "change #image1": () => {
        showPreview('#image1', 'image1');
    },

    "change #image2": () => {
        showPreview('#image2', 'image2');
    },

    "change #image3": () => {
        showPreview('#image3', 'image3');
    },
    "change #adminModalLogo": () => {
        showPreview('#adminModalLogo', 'adminModalLogo');
    },
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
    //console.log('instanceValue.indexOf', instanceValue.indexOf('blob:http'))
    //console.log('instanceValue.indexOf Value', instanceValue)
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

function deleteImage(perfect, deletedFieldInDB, inst, instValue) {
    // console.log(deletedFieldInDB)
    S3.delete(perfect, function(err, result) {
        if (err) {
            showAlert("danger", "Can not update branding section")
            Session.set('showLoading',false);
        } else {
            Meteor.call('mainImageUrlDelete', deletedFieldInDB,getSubdomain(getCookie("selectedSDForSA")), (error, result)=>{
                if (error) {
                    console.log('error', error)
                } else {
                    Session.set('showLoading',false);
                    console.log("result")
                    inst[instValue].set(null);

                }
            });
            showAlert("success", "Branding section updated successfully");
        }
      });
  }