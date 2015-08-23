'use strict';

angular.module('esri-map-docs')
    .controller('AdditionalMapOptionsCtrl', function($scope, esriLoader) {
        $scope.map = {
            center: {
                lng: -96.53,
                lat: 38.374
            },
            zoom: 13,
            mapOptions: {
                minZoom: 10,
                maxZoom: 15,
                resizeDelay: 500,
                navigationMode: 'classic',
                sliderOrientation: 'horizontal',
                sliderPosition: 'top-right',
                displayGraphicsOnPan: true,
                fadeOnZoom: false,
                logo: false,
                wrapAround180: false
            }
        };

        /*esriLoader.require(['esri/geometry/Extent', 'esri/SpatialReference'], function(Extent, SpatialReference) {
            var extent = new Extent(-122.68, 45.53, -122.45, 45.60, new SpatialReference({
                wkid: 4326
            }));
            var extent = new Extent({
                "xmin": -10741237.098633986,
                "ymin": 4628229.211137429,
                "xmax": -10729771.544391226,
                "ymax": 4635872.913965937,
                "spatialReference": {
                    "wkid": 102100,
                    "latestWkid": 3857
                }
            });
            $scope.map.mapOptions.extent = extent;
            console.log(arguments);
        }).then(function(a,b,c) {
            console.log(arguments);
        });*/
    });