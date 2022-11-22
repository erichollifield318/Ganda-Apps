

import { screensaver } from '/imports/startup/client/globalHelpers.js';
import { getSubdomain, getCookie } from '/imports/startup/both/global_function.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';

import { Advertisement } from '/imports/api/advertisement/advertisement.js';


import './slider.html';

Template.slider.onCreated(function () {
	this.autorun(() => {
		this.subscribe = Meteor.subscribe('advertisement', getCookie("selectedSDForSA"));
	});
})
Template.slider.onRendered(function () {
	require('./slider.css')
	$('#overlay-box, #mainMenuList, div#mlkeyboard, div#slkeyboard').css('display', 'none');
	
	let siteSettings, sliderSpeed;
	if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {	  	
		siteSettings = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
  	} else{
	  	siteSettings = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
  	}
	if (siteSettings && siteSettings.advertisement && siteSettings.advertisement.slideChangeTime)
		sliderSpeed = siteSettings.advertisement.slideChangeTime;
	else
		sliderSpeed = 7000;

	// console.log("sliderSpeed",sliderSpeed)
	
	Meteor.setTimeout(function() {
		$('#carousel').slick({
		 	dots: true,
		  	slidesToScroll: 1,
		  	autoplay: true,
		  	speed: 2000,
		  	autoplaySpeed: sliderSpeed,
		});
	},500);

    Session.set('currentMenu', false);
    Session.set('markerLength', false);
    Session.set('markers', false);
    Session.set('numberOfResults', false);
    Session.set('pageNumber', false);
    Session.set('selectedMenuName', false);
    Session.set('selectedSubMenu', false);
    Session.set('showMap', false);
    Session.set('categsArray', false);


    $("div.modal-overlay").remove();
  
	/*this.autorun(() => {
				
		$('#touch-anywhere').click(function (event) {       
			
		});
	});*/
	/*jQuery('.tp-banner').revolution({
		 delay:9000,
		 startwidth:960,
		 startheight:1600,
		 autoHeight:"on",
		 fullScreenAlignForce:"off",
		 onHoverStop:"off",
		 navigationType:"bullet",
		 navigationArrows:"0",
		 navigationStyle:"preview1",
		 touchenabled:"on",
		 stopAtSlide:-1,
		 stopAfterLoops:-1,
		 hideCaptionAtLimit:0,
		 hideAllCaptionAtLilmit:0,
		 hideSliderAtLimit:0,
		 dottedOverlay:"none",
		 fullWidth:"off",
		 forceFullWidth:"off",
		 fullScreen:"off",
  	});*/
	
});

Template.slider.helpers({
	sliderImages () {
		let slides, today = new Date();
		if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_advertisement']) {
			slides = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_advertisement'].find( { publish: true } ).fetch();
	    } else{
	      	slides = Advertisement.find( { publish: true } ).fetch();
	    }
	    return slides;
	},
	
	isPublish (advertisment) {
		if ((new Date() >= new Date(advertisment.startDate)) && (new Date () <= new Date(advertisment.endDate))) {
			return true;
		}
		return false;
	},
});

Template.slider.events({
	'click #touch-anywhere' () {
		// console.log(" click 1 ");
		Session.set('showMap', true);
		screensaver();
	}
})



		// let siteSetting = {};
		// if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
	 //      	siteSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getCookie("selectedSDForSA") });
	 //    } else{
	 //      	siteSetting = AdminSettings.findOne({ subDomain: getCookie("selectedSDForSA") });
	 //    }
		// let advertismentData = [];
		// if (siteSetting && siteSetting.advertisment && siteSetting.advertisment.slides && siteSetting.advertisment.slides.length > 0) {
		// 	/*siteSetting.advertisment.map((data) => {
		// 		if ((new Date() >= new Date(data.startDate)) && (new Date () <= new Date(data.endDate)) && data.publish) {
		// 			console.log(":: ",new Date()," advertisment data => ",data);
		// 		}
		// 	});*/
		// 	console.log('sliderImagessss:::::::  :',siteSetting.advertisment)
		// 	return siteSetting.advertisment.slides;
		// }
		// return false;