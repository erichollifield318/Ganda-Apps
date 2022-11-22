import './landingPage.html';
import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain,getCookie } from '/imports/startup/both/global_function.js';

Template.landingPage.onCreated(function() {
	const { ReactiveVar }  =  require('meteor/reactive-var');
	this.mainImage = new ReactiveVar(null);
});

Template.landingPage.onRendered(function() {
	// console.log("rendred")
});


Template.landingPage.helpers ({
	mainImage() {
		// console.log(Template.instance().mainImage.get(), "get")
        return Template.instance().mainImage.get();
    },
});

Template.landingPage.events({
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

		'click #submitValue' (event, inst) {
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
		},
    
    "change #mainImage": () => {
        showPreview('#mainImage', 'mainImage');
    },

    'click #myCheck' (event, inst) {
    	// console.log("click")
    	var checkBox = $("#myCheck");
    	checkBox.checked = true;
    }
});

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

  function uploadFile(id, reactVar, inst){
    const q  = require('q');
    let d = q.defer();
    // console.log(reactVar, "reactiveVar", inst)
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

function showAlert(type, message){
    Bert.alert({
        title: 'Hey there!',
        message: message,
        type: type,
        style: 'growl-top-right',
        icon: 'fa-check',
    });
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
