(function(angular) {
    'use strict';

    /**
     * @ngdoc directive
     * @name esri.map.directive:esriMapView
     * @restrict E
     * @element
     * @scope
     *
     * @description
     * This is the directive which will create a
     * {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-views-MapView.html MapView}
     * instance using the ArcGIS API for JavaScript.
     * There are plenty of examples showing how to use this directive and its bound parameters.
     *
     * ## Examples
     * - {@link ../#/examples/feature-layer Feature Layer}
     * - {@link ../#/examples/vector-tiles Vector Tiles}
     * - {@link ../#/examples/search Search}
     * - {@link ../#/examples and more...}
     *
     * @param {Object} map Instance of a {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-Map.html Map}
     *  or {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-WebMap.html WebMap}.
     * @param {Function=} on-create Callback for successful creation of the MapView.
     * @param {Function=} on-load Callback for successful loading of the MapView.
     * @param {Function=} on-error Callback for rejected/failed loading of the MapView.
     * @param {Object | String=} view-options An object or inline object hash string defining additional
     *  {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-views-MapView.html#properties MapView properties}.
     * @param {String=} register-as A name to use when registering the view so that it can be used by other controllers.
     *  See {@link esri.core.factory:esriRegistry esriRegistry}.
     */
    angular.module('esri.map')
        .directive('esriMapView', function esriMapView() {
            return {
                // element only
                restrict: 'E',

                transclude: true,

                // isolate scope
                scope: {
                    // one-way binding
                    registerAs: '@?',
                    // two-way binding
                    map: '=?',
                    // function binding for event handlers
                    onCreate: '&',
                    onLoad: '&',
                    onError: '&',
                    // function binding for reading object hash from attribute string
                    // or from scope object property
                    viewOptions: '&'
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
        });
})(angular);
