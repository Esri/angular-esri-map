angular.module('esri-map-docs')
    .controller('ExtrudePolygonCtrl', function(esriLoader, browserDetectionService) {
        var self = this;
        // load esri modules
        esriLoader.require([
            'esri/Map',
            'esri/Color',
            'esri/views/SceneView',
            'esri/layers/FeatureLayer',
            'esri/symbols/PolygonSymbol3D',
            'esri/symbols/ExtrudeSymbol3DLayer',
            'esri/renderers/SimpleRenderer'
        ], function(Map, Color, SceneView, FeatureLayer, PolygonSymbol3D, ExtrudeSymbol3DLayer, SimpleRenderer) {
            // check that the device/browser can support WebGL
            //  by inspecting the userAgent and
            //  by handling the scene view directive's on-error
            self.showViewError = browserDetectionService.isMobile();
            self.onViewError = function() {
                self.showViewError = true;
            };
            
            // create the map
            self.map = new Map({
                basemap: 'streets'
            });

            //Create featureLayer and add to the map
            var featureLayer = new FeatureLayer({
                url: '//sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/3'
            });
            self.map.add(featureLayer);

            //Create the Renderer for the featureLayer,
            var extrudePolygonRenderer = new SimpleRenderer({
                symbol: new PolygonSymbol3D({
                    symbolLayers: [new ExtrudeSymbol3DLayer()]
                }),
                visualVariables: [{
                    type: 'sizeInfo',
                    field: 'POP07_SQMI',
                    minSize: 40000,
                    maxSize: 1000000,
                    minDataValue: 1,
                    maxDataValue: 1000
                }, {
                    type: 'colorInfo',
                    field: 'SQMI',
                    minDataValue: 1,
                    maxDataValue: 600000,
                    colors: [
                        new Color('white'),
                        new Color('red')
                    ]
                }]
            });

            featureLayer.renderer = extrudePolygonRenderer;
        });
    });
