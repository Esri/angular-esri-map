'use strict';

angular.module('esri-map-docs')
    .controller('NoBasemapCtrl', function($scope, $filter) {
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
                infoWindow: { // will be constructed as an Esri/dijit/Popup
                    options: {
                        anchor: 'top-left'
                    },
                    srcNodeRef: angular.element('<div></div>')[0]
                },
                minScale: 40000000,
                maxScale: 4800000,
                sliderOrientation: 'horizontal',
                sliderPosition: 'top-right',
                displayGraphicsOnPan: true
            }
        };
        $scope.mapLoaded = function(map) {
            // see "Map Events" example for more info about this method
            // set up a map click handler to show the Popup
            map.on('click', function(e) {
                map.infoWindow.setTitle('<div>Click info</div>');
                // use angular number filter for formatting
                var xLocation = $filter('number')(e.mapPoint.x, 3);
                var yLocation = $filter('number')(e.mapPoint.y, 3);
                var content =
                    '<div><strong>X</strong>: ' + xLocation + '</div>' +
                    '<div><strong>Y</strong>: ' + yLocation + '</div>';
                // set the Popup content and display it at the click location
                map.infoWindow.setContent(content);
                map.infoWindow.show(e.mapPoint);
            });
        };
        $scope.extentChanged = function(e) {
            // see "Map Events" example for more info about this method
            $scope.map.extent = e.extent;
            // the extent-change event also gives us access to the target map,
            // thus we can find out the current map scale
            $scope.map.scale = e.target.getScale();
        };
    });
