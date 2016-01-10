(function(angular) {
    'use strict';

    /**
     * @ngdoc directive
     * @name esri.directives.directive:esriHomeButton
     * @restrict E
     * @element
     * @scope
     *
     * @description
     * This is the directive which will create a home button using the Esri ArcGIS API for JavaScript.
     * There are plenty of examples showing how to use this directive and its bound parameters.
     *
     * ## Examples
     * - Choose from a {@link ../#/examples number of examples} making use of this directive
     *
     * @param {Object} view Instance of a MapView or SceneView.
     */
    angular.module('esri.directives')
        .directive('esriHomeButton', function esriHomeButton() {
            return {
                // element only
                restrict: 'E',

                // isolate scope
                scope: {
                    view: '='
                },

                template: [
                    '<div class="esri-home" role="presentation">',
                    '  <div role="button" tabindex="0" class="esri-container">',
                    '    <span aria-hidden="true" class="esri-icon esri-icon-home"></span>',
                    '    <span class="esri-icon-font-fallback-text">Home</span>',
                    '  </div>',
                    '</div>'
                ].join(''),

                controllerAs: 'homeButtonCtrl',

                bindToController: true,

                // directive api
                controller: 'EsriHomeButtonController',

                link: function esriHomeButtonLink(scope, element, attrs, controller) {
                    scope.$watch('homeButtonCtrl.view', function(newVal) {
                        controller.setView(newVal);
                    });

                    element.on('click', function() {
                        controller.goHome();
                    });
                }
            };
        });
})(angular);
