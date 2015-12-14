(function(angular) {

    angular.module('esri.map')
        .controller('EsriMapViewController', function EsriMapViewController($element, esriMapViewUtils) {
            var self = this;
            // get a ref to the map div in the template
            var viewDiv = $element.children()[0];
            this._extent = this.extent();

            // create the view, get a ref to the promise
            this.createViewPromise = esriMapViewUtils.createMapView({
                container: viewDiv,
                map: this.map,
                extent: this._extent
            }).then(function(result) {
                if (typeof self.onCreate() === 'function') {
                    self.onCreate()(result.view);
                }
                return result;
            });

            this.setMap = function(map) {
                // preserve extent
                if (map && !map.initialExtent) {
                    map.initialExtent = this._extent;
                }
                return this.createViewPromise.then(function(result) {
                    result.view.set('map', map);
                });
            };
        });
})(angular);
