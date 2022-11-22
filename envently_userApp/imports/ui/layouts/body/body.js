import './body.html';
import '../../pages/sociallogin/sociallogin.js';



Template.appBody.onRendered(function () {
	// Disable right click button inside user app
	document.addEventListener('contextmenu', event => event.preventDefault());
	
});