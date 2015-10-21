'use strict';
angular.module('esri-map-docs')
    .controller('CustomBasemapCtrl', function(esriMapUtils) {
        // add "delorme" basemap
        esriMapUtils.addCustomBasemap('delorme', {
            urls: ['http://services.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer'],
            title: 'DeLorme',
            thumbnailurl: 'http://servername.fqdn.suffix/images/thumbnail_2014-11-25_61051.png'
        });
    });
