'use strict';

angular.module('esri-map-docs')
    .controller('RegistryPatternCtrl', function($scope, esriRegistry) {
        $scope.map = {
            center: {
                lng: -122.45,
                lat: 37.75
            },
            zoom: 13,
            point: null,
        };
        // another way to get a reference to the map is to
        // set the register-as attribute on the directive
        // and then use the esriRegistry to get the map by name
        esriRegistry.get('myMap').then(function(map){
            map.on('click', function(e) {
                // NOTE: $scope.$apply() is needed b/c the map's click event
                // happens outside of Angular's digest cycle
                $scope.$apply(function() {
                    $scope.map.point = e.mapPoint;
                });
            });
        });
    });
