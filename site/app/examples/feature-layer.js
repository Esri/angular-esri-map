angular.module('esri-map-docs')
    .controller('FeatureLayerCtrl', function(esriLoader) {
        var self = this;
        // load esri modules
        esriLoader.require([
            'esri/Map',
            'esri/layers/FeatureLayer'
        ], function(Map, FeatureLayer) {
            // create the map
            self.map = new Map({
                basemap: 'hybrid'
            });

            // and add a feature layer
            var featureLayer = new FeatureLayer({
                url: '//services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Landscape_Trees/FeatureServer/0'
            });

            self.map.add(featureLayer);
        });
    });
