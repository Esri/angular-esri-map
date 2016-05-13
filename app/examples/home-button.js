angular.module('esri-map-docs')
    .controller('HomeButtonCtrl', function(esriLoader, browserDetectionService) {
        var self = this;
        self.viewLoaded = false;
        // load esri modules
        esriLoader.require('esri/Map', function(Map) {
            // check that the device/browser can support WebGL
            //  by inspecting the userAgent and
            //  by handling the scene view directive's on-error
            self.showViewError = browserDetectionService.isMobile();
            self.onViewError = function() {
                self.showViewError = true;
            };

            self.map = new Map({
                basemap: 'streets',
                ground: 'world-elevation'
            });

            self.onViewCreated = function(view) {
                // provide the view instance to the bound scope
                // of the custom esri-home-button directive
                self.sceneView = view;
                // update the bound property for ng-show
                self.viewLoaded = true;
            };
        });
    });
