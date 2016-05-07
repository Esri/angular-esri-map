angular.module('esri-map-docs')
    .controller('SceneToggleElevationCtrl', function(esriLoader, browserDetectionService) {
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
                basemap: 'hybrid',
                ground: 'world-elevation'
            });

            self.onViewLoaded = function(view) {
                // add the analysis button's parent container to the view's UI,
                //  instead of relying on CSS positioning
                //  https://developers.arcgis.com/javascript/latest/api-reference/esri-views-ui-DefaultUI.html
                view.ui.add('elevationDiv', 'top-right');
                self.viewLoaded = true;
            };

            self.updateElevation = function(e) {
                self.map.ground.layers.forEach(function(layer) {
                    layer.visible = e.currentTarget.checked;
                });
            };
        });
    });
