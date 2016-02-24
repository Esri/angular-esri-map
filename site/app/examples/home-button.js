angular.module('esri-map-docs')
    .controller('HomeButtonCtrl', function(esriLoader, browserDetectionService) {
        var self = this;
        // load esri modules
        esriLoader.require('esri/Map', function(Map) {
            self.map = new Map({
                basemap: 'streets'
            });

            self.onViewCreated = function(view) {
                self.sceneView = view;
            };

            // check that the device/browser can support WebGL
            //  by inspecting the userAgent and
            //  by handling the scene view directive's on-error
            self.showViewError = browserDetectionService.isMobile();
            self.onViewError = function() {
                self.showViewError = true;
            };
        });
    });
