'use strict';
angular.module('esri-map-docs')
    .controller('CustomBasemapCtrl', function(esriMapUtils, esriRegistry) {
        // add "delorme" basemap
        // NOTE: it would be better to add the basemap route's resolve
        // that way we could just use the basemap name in either
        // the map directive's basemap or map-options attributes
        esriMapUtils.addCustomBasemap('delorme', {
            urls: ['//services.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer'],
            title: 'DeLorme',
            thumbnailUrl: '//servername.fqdn.suffix/images/thumbnail_2014-11-25_61051.png'
        }).then(function(esriBasemaps) {
            console.log(esriBasemaps);
            // because we are adding the basemap in the controller,
            // we need to use the regitstry to get a handle to the map
            // once it is loaded and then set the basemap
            esriRegistry.get('delormeMap').then(function(map) {
                map.setBasemap('delorme');
            });
        });
    });
