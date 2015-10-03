'use strict';

angular.module('esri-map-docs')
    .controller('AddRemoveLayersCtrl', function($scope) {
        // list of layers that can be added to the map
        $scope.layers = [
            {
                name: 'Heritage Trees',
                url: 'http://services.arcgis.com/rOo16HdIMeOBI4Mb/arcgis/rest/services/Heritage_Trees_Portland/FeatureServer/0'
            },
            {
                name: 'Parks',
                url: 'http://services.arcgis.com/rOo16HdIMeOBI4Mb/arcgis/rest/services/Portland_Parks/FeatureServer/0'
            }
        ];

        // list of layers currently added to the map
        $scope.selectedLayers = [];

        // add/remove a layer to/from the map by URL
        $scope.toggleLayer = function (url) {
            console.log('Toggling ' + url);
            var index = $scope.selectedLayers.indexOf(url);
            if (index >= 0) {
                $scope.selectedLayers.splice(index, 1);
            } else {
                $scope.selectedLayers.push(url);
            }
            console.log('Selected layers: ' + $scope.selectedLayers);
        };
    });
