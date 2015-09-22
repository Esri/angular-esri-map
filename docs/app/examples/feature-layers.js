'use strict';

angular.module('esri-map-docs')
    .controller('FeatureLayersCtrl', function($scope) {
        $scope.map = {
            center: {
                lng: -122.676207,
                lat: 45.523452
            },
            zoom: 12,
            parksOpacity: 0.8,
            showTrees: false,
            treesDefExpression: 'HEIGHT > 70',
            railLayerOptions: {
                autoGeneralize: true,
                definitionExpression: 'TYPE = \'SC\'',
                displayOnPan: true,
                id: 'PortlandLightRail',
                infoTemplate: {
                    title: 'Attributes',
                    content: '${*}'
                },
                maxAllowableOffset: 500,
                mode: 'MODE_SNAPSHOT',
                opacity: 1.0,
                outFields: ['*'],
                showAttribution: true,
                visible: true
            }
        };
        $scope.treesDefExpressionInputText = $scope.map.treesDefExpression;
        $scope.submitTreesDefExpression = function() {
            if ($scope.treesDefExpressionInputText) {
                $scope.map.treesDefExpression = $scope.treesDefExpressionInputText;
            }
        };
    });