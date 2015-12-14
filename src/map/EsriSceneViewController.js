(function(angular) {

    angular.module('esri.map')
        .controller('EsriSceneViewController', function EsriSceneViewController($element, esriSceneViewUtils) {
            var self = this;
            // get a ref to the map div in the template
            var viewDiv = $element.children()[0];

            // create the view, get a ref to the promise
            this.createViewPromise = esriSceneViewUtils.createSceneView({
                container: viewDiv,
                map: this.map
            }).then(function(result) {
                if (typeof self.onCreate() === 'function') {
                    self.onCreate()(result.view);
                }
                return result;
            });

            this.setMap = function(map) {
                return this.createViewPromise.then(function(result) {
                    result.view.set('map', map);
                });
            };
        });
})(angular);
