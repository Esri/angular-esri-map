angular.module('esri-map-docs')
    .controller('GeodesicBuffersCtrl', function(esriLoader) {
        var self = this;
        // load esri modules
        esriLoader.require([
            'esri/Map',
            'esri/layers/GraphicsLayer',
            'esri/Graphic',

            'esri/geometry/SpatialReference',
            'esri/geometry/geometryEngine',
            'esri/geometry/Point',

            'esri/symbols/SimpleMarkerSymbol',
            'esri/symbols/SimpleLineSymbol',
            'esri/symbols/SimpleFillSymbol'
        ],
        function(
            Map, GraphicsLayer, Graphic,
            SpatialReference, geometryEngine, Point,
            SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol
        ) {
            self.map = new Map({
                basemap: 'satellite'
            });

            self.onViewError = function() {
                self.showViewError = true;
            };

            /********************************************************************
             * Add two graphics layers to map: one for points, another for buffers
             ********************************************************************/
            var bufferLayer = new GraphicsLayer();
            var pointLayer = new GraphicsLayer();

            self.map.add([bufferLayer, pointLayer]);

            var sr = new SpatialReference(4326);

            var pointSym = new SimpleMarkerSymbol({
                color: [255, 0, 0],
                outline: new SimpleLineSymbol({
                    color: [255, 255, 255],
                    width: 1
                }),
                size: 7
            });

            var polySym = new SimpleFillSymbol({
                color: [255, 255, 255, 0.5],
                outline: new SimpleLineSymbol({
                    color: [0, 0, 0, 0.5],
                    width: 2
                })
            });

            /********************************************************************
             * Generate points every 10 degrees along Prime Meridian. Add to layer.
             * Buffer each point by 560km using GeometryEngine. Add buffers to map.
             ********************************************************************/
            self.map.then(addPoints);

            function addPoints() {
                var point, buffer, lat;

                for (lat = -80; lat <= 80; lat += 10) {
                    point = new Point({
                        x: 0,
                        y: lat,
                        spatialReference: sr
                    });
                    pointLayer.add(new Graphic({
                        geometry: point,
                        symbol: pointSym
                    }));

                    buffer = geometryEngine.geodesicBuffer(point, 560, 'kilometers');
                    bufferLayer.add(new Graphic({
                        geometry: buffer,
                        symbol: polySym
                    }));
                }
            }
        });
    });
