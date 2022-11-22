import { AccountsTemplates } from 'meteor/useraccounts:core';
import { deleteAllCookies } from '/imports/startup/both/global_function.js';
// import { subdomain } '../client/domainconfig.js';

AccountsTemplates.configure({
    showForgotPasswordLink: true,
    defaultTemplate: 'loginTemplate',
    defaultLayout: 'adminBody',
    defaultContentRegion: 'main',
    defaultLayoutRegions: {},
    preSignUpHook: mylord,
    postSignUpHook: onCompleteSignUp,
    onSubmitHook: submitted
});

AccountsTemplates.configureRoute('signIn', {
    name: 'signin',
    path: '/signin',
});

// AccountsTemplates.configureRoute('signUp', {
//     name: 'join',
//     path: '/join',
// });

AccountsTemplates.configureRoute('forgotPwd');
AccountsTemplates.configureRoute('resetPwd', {
    name: 'resetPwd',
    path: '/reset-password',
});



var userGroup = "";
if (Meteor.isClient) {
    import subdomains from '../client/domainconfig.js';
    var subdomain = subdomains.name;
    userGroup = "";
    switch (subdomain) {
        case "admin":
            userGroup = "admin";
            break;
        case "doublebay":
            userGroup = "appUser";
            addusernamefield();
            break;
        case "paddington":
            userGroup = "appUser";
            addusernamefield();
            break;
        default:
            userGroup = "appUser";
            addusernamefield();
            break;
    }
}

function addusernamefield() {
    AccountsTemplates.addField({
        _id: 'username',
        type: 'text',
        displayName: "User Name",
        required: true
    });
}

function mylord(pass, info) { //Tell Server Which type of User is that internally.
    console.log('123 info ',info)
    info.userGroup = userGroup;
}

function onCompleteSignUp(userId, info) { //Fetch UserGroup and Pass on with empty permissions.
    console.log('123 onCompleteSignUp info ',info )
    Roles.addUsersToRoles(userId, [info.userGroup], info.userGroup);
}

function submitted(error, state) {
    console.log("=== onSubmitHook ====>", userGroup);
    if (!error && state === "signIn") {
        let userId = Meteor.userId();
        deleteAllCookies();
        if(!userId || (!Roles.userIsInRole(userId, [userGroup], userGroup) && !Roles.userIsInRole(userId,['super-admin'], Roles.GLOBAL_GROUP))) {
            Meteor.logout((err)=>{
              deleteAllCookies();
                console.log("==== Inside LogOut CallBack from Submit Method ===>");
            });
        }
    }
}
