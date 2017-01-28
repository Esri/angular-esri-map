angular.module('esri-map-docs')
    .controller('ExtrudePolygonCtrl', function(esriLoader, browserDetectionService, $scope) {
        var self = this;
        // load esri modules
        esriLoader.require([
            'esri/Map',
            'esri/layers/FeatureLayer',
            'esri/renderers/SimpleRenderer',
            'esri/symbols/PolygonSymbol3D',
            'esri/symbols/ExtrudeSymbol3DLayer',
            'esri/widgets/Legend'
        ], function(Map, FeatureLayer, SimpleRenderer, PolygonSymbol3D, ExtrudeSymbol3DLayer, Legend) {
            // check that the device/browser can support WebGL
            //  by inspecting the userAgent and
            //  by handling the scene view directive's on-error
            self.showViewError = browserDetectionService.isMobile();
            self.onViewError = function() {
                self.showViewError = true;
            };

            // limit visualization to southeast U.S. counties
            var defExp = ['STATE = \'LA\'', 'STATE = \'AL\'', 'STATE = \'AR\'',
                'STATE = \'MS\'', 'STATE = \'TN\'', 'STATE = \'GA\'',
                'STATE = \'FL\'', 'STATE = \'SC\'', 'STATE = \'NC\'',
                'STATE = \'VA\'', 'STATE = \'KY\'', 'STATE = \'WV\''
            ];

            var renderer = new SimpleRenderer({
                symbol: new PolygonSymbol3D({
                    symbolLayers: [new ExtrudeSymbol3DLayer()]
                }),
                label: '% population in poverty by county',
                visualVariables: [{
                    type: 'size',
                    field: 'POP_POVERTY',
                    normalizationField: 'TOTPOP_CY',
                    stops: [{
                        value: 0.10,
                        size: 10000,
                        label: '<10%'
                    }, {
                        value: 0.50,
                        size: 500000,
                        label: '>50%'
                    }]
                }, {
                    type: 'color',
                    field: 'POP_POVERTY',
                    normalizationField: 'TOTPOP_CY',
                    stops: [{
                        value: 0.10,
                        color: '#FFFCD4',
                        label: '<15%'
                    }, {
                        value: 0.35,
                        color: [153, 83, 41],
                        label: '>35%'
                    }]
                }]
            });

            var povLyr = new FeatureLayer({
                url: '//services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/counties_politics_poverty/FeatureServer/0',
                renderer: renderer,
                outFields: ['*'],
                popupTemplate: {
                    title: '{COUNTY}, {STATE}',
                    content: '{POP_POVERTY} of {TOTPOP_CY} people live below the poverty line.',
                    fieldInfos: [{
                        fieldName: 'POP_POVERTY',
                        format: {
                            digitSeparator: true,
                            places: 0
                        }
                    }, {
                        fieldName: 'TOTPOP_CY',
                        format: {
                            digitSeparator: true,
                            places: 0
                        }
                    }]
                },
                definitionExpression: defExp.join(' OR ') // only display counties from states in defExp
            });

            // create the map
            self.map = new Map({
                basemap: 'gray',
                layers: [povLyr]
            });

            // create the legend widget after the view has been successfully created
            self.onViewCreated = function(view) {
                var legendWidget = new Legend({
                    view: view
                }, 'legendDiv');

                // destroy the legend widget when angular scope is also being destroyed
                $scope.$on('$destroy', function() {
                    legendWidget.destroy();
                });
            };
        });
    });
