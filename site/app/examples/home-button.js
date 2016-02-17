angular.module('esri-map-docs')
    .controller('HomeButtonCtrl', function(esriLoader) {
        var self = this;
        // load esri modules
        esriLoader.require('esri/Map', function(Map) {
            self.map = new Map({
                basemap: 'streets'
            });

            self.onViewCreated = function(view) {
                self.sceneView = view;
            };

            self.onViewError = function() {
                self.showViewError = true;
            };
        });
    });
