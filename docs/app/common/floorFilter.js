'use strict';

angular.module('esri-map-docs')
    .filter('floor', function() {
        return function(n) {
            return Math.floor(n);
        };
    });