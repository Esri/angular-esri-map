angular.module('esri-map-docs')
    .controller('VectorTileLayerCtrl', function(esriLoader) {
        var self = this;
        // load esri modules
        esriLoader.require([
            'esri/Map',
            'esri/layers/VectorTileLayer'
        ],
        function(
            Map, VectorTileLayer
        ) {
            self.map = new Map();

            // add a tile layer to the map
            var tileLyr = new VectorTileLayer({
                url: '//www.arcgis.com/sharing/rest/content/items/f96366254a564adda1dc468b447ed956/resources/styles/root.json'
            });
            self.map.add(tileLyr);
        });
    });
