(function(angular) {

    /**
     * @ngdoc directive
     * @name esri.directives.directive:esriSceneView
     * @restrict E
     * @element
     * @scope
     *
     * @description
     * This is the directive which will create a scene view using the Esri ArcGIS API for JavaScript.
     * There are plenty of examples showing how to use this directive and its bound parameters.
     *
     * ## Examples
     * - Choose from a {@link ../#/examples number of examples} making use of this directive
     *
     * @param {Object} map Instance of a map.
     * @param {Function=} on-create Callback for successful creation of the scene view.
     * @param {Object | String=} view-options An object or inline object hash string defining additional scene view constructor options.
     */
    angular.module('esri.directives')
        .directive('esriSceneView', function esriSceneView() {
            return {
                // element only
                restrict: 'E',

                transclude: true,

                // isolate scope
                scope: {
                    // to-way binding
                    map: '=?',
                    // function binding for event handlers
                    onCreate: '&',
                    // function binding for reading object hash from attribute string
                    // or from scope object property
                    viewOptions: '&'
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
