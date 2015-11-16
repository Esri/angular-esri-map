(function(angular) {
    'use strict';

    /**
     * @ngdoc directive
     * @name esri.map.directive:esriMap
     * @restrict E
     * @element
     * @scope
     *
     * @description
     * This is the directive which will create a map using the Esri ArcGIS API for JavaScript.
     * There are plenty of examples showing how to use this directive and its bound parameters.
     * For additional information, we recommend the
     * {@link https://developers.arcgis.com/javascript/jsapi/map-amd.html Esri Map documentation}.
     *
     * ## Examples
     * - Choose from a {@link ../#/examples number of examples} making use of this directive
     *
     * @param {String} id The id of the element where to construct the map.
     * @param {Array | Object=} center The initial location of the map.
     * @param {Number=} zoom The initial zoom level of the map.
     * @param {Object=} item-info When loading a web map from an item id, this object will be populated with the item's info.
     * @param {String=} basemap The basemap of the map, which can be a valid string from the ArcGIS API for JavaScript, or a custom basemap.
     * @param {Function=} load Callback for map `load` event.
     * @param {Function=} extent-change Callback for map `extent-change` event.
     * @param {Object | String=} map-options An object or inline object hash string defining additional map constructor options.
     *  See {@link ../#/examples/additional-map-options Additional Map Options} example.
     * @param {String=} register-as A name to use when registering the map so that it can be used by parent controllers.
     *  See {@link esri.core.factory:esriRegistry esriRegistry}.
     */
    angular.module('esri.map').directive('esriMap', function() {

        return {
            // element only
            restrict: 'E',

            // isolate scope
            scope: {
                // two-way binding for center/zoom
                // because map pan/zoom can change these
                center: '=?',
                zoom: '=?',
                itemInfo: '=?',
                // one-way binding for other properties
                basemap: '@',
                // function binding for event handlers
                load: '&',
                extentChange: '&',
                // function binding for reading object hash from attribute string
                // or from scope object property
                // see Example 7 here: https://gist.github.com/CMCDragonkai/6282750
                mapOptions: '&'
            },

            controllerAs: 'mapCtrl',

            bindToController: true,

            // directive api
            controller: 'EsriMapController',

            // replace tag with div with same id
            compile: function($element, $attrs) {

                // remove the id attribute from the main element
                $element.removeAttr('id');

                // append a new div inside this element, this is where we will create our map
                $element.append('<div id=' + $attrs.id + '></div>');

                // since we are using compile we need to return our linker function
                // the 'link' function handles how our directive responds to changes in $scope
                return function(scope, element, attrs, controller) {

                    // update scope in response to map events and
                    // update map in response to changes in scope properties
                    controller.bindMapEvents(scope, attrs);

                };
            }
        };
    });

})(angular);
