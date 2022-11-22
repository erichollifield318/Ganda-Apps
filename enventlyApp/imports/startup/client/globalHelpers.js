import { Template } from 'meteor/templating'

Template.registerHelper('decodeString', (string) => {
  const encodedStr = string;
  const parser = new DOMParser;
  const dom = parser.parseFromString(
      '<!doctype html><body>' + encodedStr,
      'text/html');
  return dom.body.textContent;
});

Deps.autorun(function () {
  var userobj = Meteor.user();
  document.title = getTitleValue(userobj)
});

function getTitleValue(userobj){
	if(userobj && userobj.roles  && userobj.roles.length){
      return userobj.roles[0]
  }else{
  	var subdomain = document.location.hostname.split('.');
  	if(subdomain[0]=='admin')
      return 'envently admin';
    else return subdomain[0];
  }
}
