angular.module('esri-map-docs')
    .controller('GeodesicBuffersCtrl', function(esriLoader, browserDetectionService) {
        var self = this;
        // load esri modules
        esriLoader.require([
            'esri/Map',
            'esri/layers/GraphicsLayer',
            'esri/Graphic',
            'esri/geometry/geometryEngine',
            'esri/geometry/Point',
            'esri/symbols/SimpleMarkerSymbol',
            'esri/symbols/SimpleFillSymbol'
        ], function(
            Map, GraphicsLayer, Graphic,
            geometryEngine, Point,
            SimpleMarkerSymbol, SimpleFillSymbol
        ) {
            // check that the device/browser can support WebGL
            //  by inspecting the userAgent and
            //  by handling the scene view directive's on-error
            self.showViewError = browserDetectionService.isMobile();
            self.onViewError = function() {
                self.showViewError = true;
            };

            self.map = new Map({
                basemap: 'satellite'
            });

            // add two graphics layers to map: one for points, another for buffers
            var polygonSymbol = new SimpleFillSymbol({
                color: [255, 255, 255, 0.5],
                outline: {
                    color: [0, 0, 0, 0.5],
                    width: 2
                }
            });

            var pointSymbol = new SimpleMarkerSymbol({
                color: [255, 0, 0],
                outline: {
                    color: [255, 255, 255],
                    width: 1
                },
                size: 7
            });

            var bufferLayer = new GraphicsLayer();

            var pointLayer = new GraphicsLayer({
                elevationInfo: {
                    mode: 'on-the-ground'
                }
            });

            self.map.addMany([bufferLayer, pointLayer]);

            // Generate points every 10 degrees along Prime Meridian. Add to layer.
            // Buffer each point by 560km using GeometryEngine. Add buffers to map.
            for (var lat = -80; lat <= 80; lat += 10) {
                var point = new Point({
                    longitude: 0,
                    latitude: lat
                });
                pointLayer.add(new Graphic({
                    geometry: point,
                    symbol: pointSymbol
                }));

                var buffer = geometryEngine.geodesicBuffer(point, 560, 'kilometers');
                bufferLayer.add(new Graphic({
                    geometry: buffer,
                    symbol: polygonSymbol
                }));
            }
        });
    });
