import './routeLocationDetail.html';

Template.routeLocationDetail.onCreated(function () {
  require('./routeLocationDetail.scss');
  
});

Template.routeLocationDetail.onRendered(function () {
    
});

Template.routeLocationDetail.helpers({
  routeLocationMarkerData(){
    let inst = Template.instance()
    return {
      "latitude":inst.data.latitude.get(),
      "longitude":inst.data.longitude.get(),
      "type":inst.data.type.get()
    }
  }
});

Template.routeLocationDetail.events({
	'submit #routeLocationMarkerId' (event, inst) {
      event.preventDefault();
      let name =  $('#name').val()
      let address =  $('#address').val()
      let phone = $('#phone').val()
      inst.data.name.set(name);
      inst.data.address.set(address);
      inst.data.phone.set(phone);
      $('#name').val('')
      $('#address').val('')
      $('#phone').val('')
      $('#routeLocationDetail').modal('close');
    }
});

function showAlert(type, message) {
    Bert.alert({
        title: 'Hey there!',
        message: message,
        type: type,
        style: 'growl-top-right',
        icon: 'fa-check',
    });
}