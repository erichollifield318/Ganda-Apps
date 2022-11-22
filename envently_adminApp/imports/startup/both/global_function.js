
export function getSubdomain(sd){
  if(Meteor.userId() && Roles.userIsInRole(Meteor.userId(), ['admin'], 'admin'))  {
    if (sd && sd != 'none') {
      return sd;
    } else {
      return Meteor.user().profile.subdomainName;
    }
  }
  else if(Meteor.userId() && Roles.userIsInRole(Meteor.userId(),['super-admin'], Roles.GLOBAL_GROUP))
  {
    if(sd && sd != 'none')
    {
      return sd;
    }
    else {
      return false;
    }
  }
  else {
    if(Meteor.isClient){
      let subdomain = document.location.hostname.split('.')[0];
      if (Meteor.settings.public.isLocal) {
          subdomain = Meteor.absoluteUrl().split('.')[0].replace('http://','').replace('https://','');
      }
      return subdomain;
    }else{
      let hostname = Meteor.absoluteUrl();
      let subdomainName = hostname.split('.')[0].replace('http://','').replace('https://','');
      if(subdomainName === 'admin' || subdomainName === 'www')
      {
        if (sd)
          return sd;
        else
          return false;
      }
      else {
        return subdomainName;
      }
    }
  }
}

export function getSubdomainUserApp() {
  let domain = window.location.href;
  console.log('window.location.href::::::', window.location.href)
  console.log("domain variable ", domain)
  let subdomainNameUser = domain.split("/")[2].split(".")[0];
  console.log("subdomainNNNNNNNNN", subdomainNameUser)
  return subdomainNameUser;
}

export function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export function deleteAllCookies() {
  var c = document.cookie.split("; ");
  for (i in c){
    if(/^[^=]+/.exec(c[i])){
      document.cookie =/^[^=]+/.exec(c[i])[0]+"=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }
}
