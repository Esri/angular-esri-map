(function(angular) {

    angular.module('esri.map', ['esri.core'])
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
        })
        .directive('esriMapView', function esriMapView() {
            return {
                // element only
                restrict: 'E',

                transclude: true,

                // isolate scope
                scope: {
                    map: '=?',
                    basemap: '@',
                    extent: '&',
                    onCreate: '&'
                },

                template: '<div ng-transclude></div>',

                controllerAs: 'mapViewCtrl',

                bindToController: true,

                // directive api
                controller: 'EsriMapViewController',
                link: function esriMapViewLink(scope, element, attrs, controller) {
                    scope.$watch('mapViewCtrl.map', function(newVal) {
                        controller.setMap(newVal);
                    });
                }
            };
        })
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
        })
        .directive('esriSceneView', function esriSceneView() {
            return {
                // element only
                restrict: 'E',

                transclude: true,

                // isolate scope
                scope: {
                    map: '=?',
                    basemap: '@',
                    onCreate: '&'
                },

                template: '<div ng-transclude></div>',

                controllerAs: 'sceneViewCtrl',

                bindToController: true,

                // directive api
                controller: 'EsriSceneViewController',
                link: function esriSceneViewLink(scope, element, attrs, controller) {
                    scope.$watch('sceneViewCtrl.map', function(newVal) {
                        controller.setMap(newVal);
                    });
                }
            };
        });
})(angular);
