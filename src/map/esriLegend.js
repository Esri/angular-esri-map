(function(angular) {
    'use strict';

    /**
     * @ngdoc directive
     * @name esri.map.directive:esriLegend
     * @restrict EA
     * @element
     *
     * @description
     * Show a legend for the map in the specified element on the page.
     * The legend directive **must** be placed within an esri-map directive,
     * but the target element (that will contain the legend) can be anywhere
     * on the page.
     * 
     * ## Examples
     * - {@link ../#/examples/legend Legend}
     * - {@link ../#/examples/web-map Web Map}
     * - {@link ../#/examples/additional-map-options Additional Map Options}
     *
     * @param {string} target-id The id of the element where you want to place the legend
     */
    angular.module('esri.map')
        .directive('esriLegend', function($q, esriLoader) {
            return {
                //run last
                priority: -10,
                restrict: 'EA',
                // require the esriMap controller
                // you can access these controllers in the link function
                require: ['?esriLegend', '^esriMap'],
                replace: true,

                scope: {},
                controllerAs: 'legendCtrl',
                bindToController: true,

                controller: function() {},

                // now we can link our directive to the scope, but we can also add it to the map
                link: function(scope, element, attrs, controllers) {

                    // controllers is now an array of the controllers from the 'require' option
                    // var legendController = controllers[0];
                    var mapController = controllers[1];
                    var targetId = attrs.targetId || attrs.id;
                    var legendDeferred = $q.defer();

                    esriLoader.require(['esri/dijit/Legend'], function(Legend) {
                        mapController.getMap().then(function(map) {
                            var createLegend = function(map) {
                                var legend;

                                var options = {
                                    map: map
                                };

                                var layerInfos = mapController.getLayerInfos();
                                if (layerInfos) {
                                    options.layerInfos = layerInfos;
                                }

                                legend = new Legend(options, targetId);
                                legend.startup();

                                scope.$watchCollection(function() {
                                    return mapController.getLayerInfos();
                                }, function(newValue /*, oldValue, scope*/ ) {
                                    legend.refresh(newValue);
                                });

                                legendDeferred.resolve(legend);

                                scope.$on('$destroy', function() {
                                    legend.destroy();
                                });
                            };

                            if (!map.loaded) {
                                map.on('load', function() {
                                    createLegend(map);
                                });
                            } else {
                                createLegend(map);
                            }
                        });
                    });
                }
            };
        });

})(angular);
