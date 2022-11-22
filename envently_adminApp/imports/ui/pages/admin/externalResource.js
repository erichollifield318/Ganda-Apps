import './externalResource.html';
import { AdminSettings } from '/imports/api/admin_settings/admin_settings.js';
import { dynamicCollections } from '/imports/startup/both/dynamic_collections.js';
import { getSubdomain,getCookie } from '/imports/startup/both/global_function.js';

import renderjson from 'renderjson';

Template.externalResource.onCreated(function() {
    Session.set('selectedIcon', false);
    require('./externalResource.css');
    this.isLoader = new ReactiveVar(false);
    this.atdwOption = new ReactiveVar(false);
});
Template.externalResource.helpers({
    externalResourceObject () {
        
        return Session.get('externalResources');
    },
    isLoader () {
        return Template.instance().isLoader.get() || false;
    },
    isAcive () {
        if (Session.get('externalResources'))
            return 'active';
        
        return '';
    },
    atdwUrl () {
        let adminSetting = {};
        if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
           adminSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getSubdomain(getCookie("selectedSDForSA")) });
        } else {
           adminSetting = AdminSettings.findOne({ subDomain: 'doublebay' });
        }
        if (!adminSetting || !adminSetting.atdw || !adminSetting.atdw.baseUrl || !adminSetting.atdw.key)
            return false;
        
        if (!Template.instance().atdwOption.get()) {
            if (Session.get('externalResources')) {
                return `${adminSetting.atdw.baseUrl}/${Session.get('externalResources')}&out=json&key=${adminSetting.atdw.key}`;
            }
            return false;
        }

        return `${adminSetting.atdw.baseUrl}/${Template.instance().atdwOption.get()}&out=json&key=${adminSetting.atdw.key}`;
    },
});
Template.externalResource.events({
    'change #external-resource-url' (event, inst) {
        inst.atdwOption.set($('#external-resource-url').val() || false);
    },
    'click #saveExternalResource' (event, inst) {
        // Build object to insert
        const  externalResourceUrl= $('#external-resource-url').val();
        $('#atdw-result').css('display','none');
        $('#tree').children().remove();
        Session.set('externalResourceUrl',externalResourceUrl || false);
       /* $('#external-resource-url').val('');*/
        $('#createExternalResource').modal('close');
        inst.atdwOption.set(false);
        $('#external-resource-url').val('');
    },
    'click #showResult' (event, inst) {
        $('#atdw-result').css('display','none');
        $('#tree').children().remove();

        let adminSetting = {};
        if (getSubdomain(getCookie("selectedSDForSA")) && dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings']) {
           adminSetting = dynamicCollections[getSubdomain(getCookie("selectedSDForSA"))+'_admin_settings'].findOne({ subDomain: getSubdomain(getCookie("selectedSDForSA")) });
        } else {
           adminSetting = AdminSettings.findOne({ subDomain: 'doublebay' });
        }
        if (!adminSetting || !adminSetting.atdw ) {
            Bert.alert({
                title: 'Error',
                message: "Please set ATDW Base Url and Key inside Settings",
                type: "danger",
                style: 'growl-top-right',
                icon: 'fa-check',
            });
        } else if (!adminSetting.atdw.baseUrl) {
             Bert.alert({
                title: 'Error',
                message: "Please set ATDW Base Url inside Settings",
                type: "danger",
                style: 'growl-top-right',
                icon: 'fa-check',
            });
        } else if (!adminSetting.atdw.key) {
            Bert.alert({
                title: 'Error',
                message: "Please set ATDW Key inside Settings",
                type: "danger",
                style: 'growl-top-right',
                icon: 'fa-check',
            });
            } else if ($('#external-resource-url').val() == '') { 
                Bert.alert({
                    title: 'Error',
                    message: "Please set ATDW Options",
                    type: "danger",
                    style: 'growl-top-right',
                    icon: 'fa-check',
                });
            }else {
            inst.isLoader.set(true);
            var settings = {
                "async": true,
                "crossDomain": true,
                "url": `${adminSetting.atdw.baseUrl}/${$('#external-resource-url').val()}&out=json&key=${adminSetting.atdw.key}`,
                // "url": "https://atlas.atdw-online.com.au/api/atlas/products?key=b48bc68600e648a397fe46a4da776f60&latlong=-28,153&dist=100&cats=RESTAURANT&out=json",
                "method": "GET",
                "headers": {
                    "Cache-Control": "no-cache",
                    "Postman-Token": "05ba385e-7786-5e04-a3cb-dbf3de05ae25"
                }
            }

            $.ajax(settings).done( (response) => {
                inst.isLoader.set(false);
                // renderjson.;
                $('#atdw-result').css('display','inline-table');
                $('#tree').css('display','inline-flex').append(renderjson.set_show_to_level(3)(response));
            }).fail( (error) => {
                    
                Bert.alert({
                    title: 'Error',
                    message: "ATDW Request Failed",
                    type: "danger",
                    style: 'growl-top-right',
                    icon: 'fa-check',
                });
                inst.isLoader.set(false);
                $('#atdw-result').css('display','none');
                $('#tree').children().remove();
            });
        }
        
    },
});
