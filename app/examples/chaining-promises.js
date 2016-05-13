angular.module('esri-map-docs')
    .controller('ChainingPromisesCtrl', function(esriLoader, $scope, browserDetectionService) {
        var self = this;
        // load esri modules
        esriLoader.require([
            'esri/geometry/geometryEngineAsync',
            'esri/geometry/Point',
            'esri/Graphic',
            'esri/layers/GraphicsLayer',
            'esri/Map',

            'esri/symbols/SimpleFillSymbol',
            'esri/symbols/SimpleLineSymbol',
            'esri/symbols/SimpleMarkerSymbol'
        ], function(
            geometryEngineAsync, Point, Graphic, GraphicsLayer, Map,
            SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol
        ) {
            // check that the device/browser can support WebGL
            //  by inspecting the userAgent and
            //  by handling the scene view directive's on-error
            self.showViewError = browserDetectionService.isMobile();
            self.onViewError = function() {
                self.showViewError = true;
            };

            // define semi-transparent red point symbol
            var pointSym = new SimpleMarkerSymbol({
                style: 'circle',
                color: [255, 0, 0, 0.5],
                size: 6,
                outline: new SimpleLineSymbol({
                    style: 'solid',
                    color: [255, 255, 255, 0.5]
                })
            });

            // define semi-transparent white symbol for buffers
            var polySym = new SimpleFillSymbol({
                style: 'solid',
                color: [255, 255, 255, 0.5],
                outline: new SimpleLineSymbol({
                    style: 'solid',
                    color: [0, 0, 0],
                    width: 2
                })
            });

            // create the map for the esri-scene-view
            self.map = new Map({
                basemap: 'hybrid',
                ground: 'world-elevation'
            });

            // create layer to store graphics and add to map
            var layer = new GraphicsLayer();
            self.map.add(layer);

            // location of meteor crater centroid in Arizona desert
            var meteorPoint = new Point({
                longitude: -111.022887,
                latitude: 35.027410
            });

            self.onViewCreated = function(view) {
                self.view = view;
                // add the analysis button's parent container to the view's UI,
                //  instead of relying on CSS positioning
                //  https://developers.arcgis.com/javascript/latest/api-reference/esri-views-ui-DefaultUI.html
                self.view.ui.add('resultsDiv', 'top-right');
                self.viewLoaded = true;
            };

            self.onStartButtonClick = function() {
                // buffer crater point and chain promise to additional functions
                geometryEngineAsync.geodesicBuffer(meteorPoint, 700, 'yards')
                    .then(addGraphics)      // when promise resolves, send buffer to addGraphics()
                    .then(zoomTo)           // when promise resolves, send buffer to zoomTo()
                    .then(calculateArea)    // when promise resolves, send buffer to calculateArea()
                    .then(printArea);       // when promise resolves, send buffer to printArea()
            };

            // adds the point and buffer graphics to the layer
            function addGraphics(buffer) {
                layer.add(new Graphic({
                    geometry: meteorPoint,
                    symbol: pointSym
                }));
                layer.add(new Graphic({
                    geometry: buffer,
                    symbol: polySym
                }));

                return buffer;
            }

            // zooms to the buffer location
            function zoomTo(geom) {
                // when the view is ready
                return self.view.then(function() {
                    // zoom to the buffer geometry
                    return self.view.goTo({
                        target: geom,
                        scale: 24000,
                        tilt: 0,
                        heading: 0
                    }).then(function() {
                        // resolve the promises with the input geometry
                        return geom;
                    });
                });
            }

            // calculates the area of the buffer in acres
            function calculateArea(polyGeom) {
                return geometryEngineAsync.geodesicArea(polyGeom, 'acres');
            }

            // prints the area to the DOM
            function printArea(area) {
                self.area = area;
                $scope.$apply('ChainingPromisesCtrl.area');
            }
        });
    });
