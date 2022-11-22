
export function getSubdomain(sd){
  if(Meteor.userId() && ( Roles.userIsInRole(Meteor.userId(), ['appUser'], 'appUser') || Roles.userIsInRole(Meteor.userId(), ['admin'], 'admin')))  {
      return Meteor.user().profile.subdomainName;
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
        if (sd) {
          return sd;
        } else {
          return false;
        }
      }
      else {
        return subdomainName;
      }
    }
  }
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
 
export function getSubMenuList(baseUrl, urlKey, srcUrl, pageNumber, numberOfRecordsPerPage) {
  // console.log('baseUrl', baseUrl, 'utlKey', urlKey, 'srcUrl', srcUrl)
  //let responceObject = `${baseUrl}/${srcUrl}&pge=1&size=${limit}&out=json&key=${urlKey}`;
  let settings = {
    "async": true,
    "crossDomain": true,
    "url": `${baseUrl}/${srcUrl}&pge=${pageNumber}&size=${numberOfRecordsPerPage}&out=json&key=${urlKey}`,
    "method": "GET",
    "headers": {
      "Cache-Control": "no-cache",
      "Postman-Token": "f826355c-01c7-e8a4-9770-eef82adb0486"
    }
  }
  // console.log('full url', `${baseUrl}/${srcUrl}&pge=${pageNumber}&size=${numberOfRecordsPerPage}&out=json&key=${urlKey}`)
  return settings;   
}


