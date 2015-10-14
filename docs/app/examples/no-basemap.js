'use strict';

angular.module('esri-map-docs')
    .controller('NoBasemapCtrl', function($scope) {
        $scope.map = {
            mapOptions: {
                extent: {
                    'xmin': -1556394,
                    'ymin': -2051901,
                    'xmax': 1224513,
                    'ymax': 2130408,
                    'spatialReference': {
                        'wkid': 102003
                    }
                },
                minScale: 40000000,
                maxScale: 4800000,
                sliderOrientation: 'horizontal',
                sliderPosition: 'top-right',
                displayGraphicsOnPan: true
            }
        };
        $scope.extentChanged = function(e) {
            // see "Map Events" example for more info about this method
            $scope.map.extent = e.extent;
            // the extent-change event also gives us access to the target map,
            // thus we can find out the current map scale
            $scope.map.scale = e.target.getScale();
        };
    });
