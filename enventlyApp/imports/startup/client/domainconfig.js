// var subdomainArr = document.location.hostname.split('.');
// if (Meteor.settings.public.isLocal) {
//     subdomainArr = ['admin', 'doublebay', 'paddington'];
// }
// module.exports.name = Meteor.absoluteUrl().split('.')[0].replace('http://','').replace('https://','');


var subdomainArr = document.location.hostname.split('.')[0];
if (Meteor.settings.public.isLocal) {
    subdomainArr = Meteor.absoluteUrl().split('.')[0].replace('http://','').replace('https://','');
}
module.exports.name = subdomainArr;
