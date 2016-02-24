angular.module('esri-map-docs')
    .controller('SceneToggleElevationCtrl', function(esriLoader, browserDetectionService) {
        var self = this;
        // load esri modules
        esriLoader.require('esri/Map', function(Map) {
            self.map = new Map({
                basemap: 'hybrid'
            });

            self.onViewCreated = function(view) {
                // to be sure that the view is both created and loaded with all elevation layer info,
                //  perform additional logic in the promise callback
                view.then(function() {
                    // store the default elevation layers
                    self.elevationLayers = view.map.basemap.elevationLayers.getAll();
                });
            };

            // check that the device/browser can support WebGL
            //  by inspecting the userAgent and
            //  by handling the scene view directive's on-error
            self.showViewError = browserDetectionService.isMobile();
            self.onViewError = function() {
                self.showViewError = true;
            };

            self.updateElevation = function(e) {
                if (!e.currentTarget.checked) {
                    // clear all elevation layers
                    self.map.basemap.elevationLayers.clear();
                } else {
                    // restore elevation layers to the original ones
                    self.map.basemap.elevationLayers = self.elevationLayers;
                }
            };
        });
    });
