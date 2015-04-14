'use strict';

angular.module('esri-map-docs')
    .controller('AdditionalAttributesCtrl', function($scope) {
        $scope.map = {
            center: {
                lng: -96.53,
                lat: 38.374
            },
            zoom: 13,
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
        };
    });
