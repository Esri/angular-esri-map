angular.module('esri-map-docs')
    .controller('PropertyBindingCtrl', function(esriLoader, $scope) {
        var self = this;

        esriLoader.require('esri/Map', function(Map) {
            // Create the map
            self.map = new Map({
                basemap: 'satellite'
            });
        });

        this.onViewCreated = function(view) {
            self.mapView = view;
            // Setup a JSAPI 4.x property watch outside of Angular
            //  and update bound Angular controller properties.
            self.mapView.watch('center,scale,zoom,rotation', function() {
                $scope.$applyAsync('vm.mapView');
            });
        };
    });
