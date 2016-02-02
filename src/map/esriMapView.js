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
     * This is the directive which will create a map view using the Esri ArcGIS API for JavaScript.
     * There are plenty of examples showing how to use this directive and its bound parameters.
     *
     * ## Examples
     * - {@link ../#/examples/feature-layer Feature Layer}
     *
     * @param {Object} map Instance of a Map.
     * @param {Function=} on-create Callback for successful creation of the map view.
     * @param {Function=} on-load Callback for successful loading of the map view.
     * @param {Object | String=} view-options An object or inline object hash string defining additional map view constructor options.
     */
    angular.module('esri.map')
        .directive('esriMapView', function esriMapView() {
            return {
                // element only
                restrict: 'E',

                transclude: true,

                // isolate scope
                scope: {
                    // two-way binding
                    map: '=?',
                    // function binding for event handlers
                    onCreate: '&',
                    onLoad: '&',
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
