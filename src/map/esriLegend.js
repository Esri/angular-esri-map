(function(angular) {
    'use strict';

    /**
     * @ngdoc directive
     * @name esriApp.directive:esriLegend
     * @description
     * # esriLegend
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
                        });
                    });
                }
            };
        });

})(angular);
