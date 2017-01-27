(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.map.controller:EsriHomeButtonController
     *
     * @description
     * Functions to help create and manage
     * {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Home-HomeViewModel.html HomeViewModel}
     * instances.
     *
     * @requires esri.core.factory:esriLoader
     * @requires $element
     */
    angular.module('esri.map')
        .controller('EsriHomeButtonController', function EsriHomeButtonController($element, esriLoader) {
            var self = this;
            var element;

            // Put initialization logic inside `$onInit()`
            // to make sure bindings have been initialized.
            this.$onInit = function() {
                element = $element.children()[0];
                self.uiPosition = self.viewUiPosition();
            };

            // Prior to v1.5, we need to call `$onInit()` manually.
            // (Bindings will always be pre-assigned in these versions.)
            if (angular.version.major === 1 && angular.version.minor < 5) {
                this.$onInit();
            }

            /**
             * @ngdoc function
             * @name getViewModel
             * @methodOf esri.map.controller:EsriHomeButtonController
             *
             * @description
             * Load and get a reference to a HomeViewModel module.
             *
             * @return {Promise} Returns a $q style promise which is
             * resolved with an object with a `viewModel` property that refers to the HomeViewModel module
             */
            this.getViewModel = function() {
                return esriLoader.require('esri/widgets/Home/HomeViewModel').then(function(HomeVM) {
                    return {
                        viewModel: HomeVM
                    };
                });
            };

            /**
             * @ngdoc function
             * @name setView
             * @methodOf esri.map.controller:EsriHomeButtonController
             *
             * @description
             * Set a view on the HomeViewModel.
             * A new HomeViewModel will be constructed.
             * To be fully functional, the HomeViewModel requires a valid view property.
             * This will also add the directive to a view's UI position if using the
             * optional {@link esri.map.directive:esriHomeButton `view-ui-position`} isolate scope property.
             *
             * @param {Object} view view instance
             */
            this.setView = function(view) {
                if (!view) {
                    return;
                }
                return this.getViewModel().then(function(result) {
                    self.viewModel = new result.viewModel({
                        view: view
                    });

                    if (self.uiPosition) {
                        view.ui.add(element, self.uiPosition);
                    }
                });
            };

            /**
             * @ngdoc function
             * @name go
             * @methodOf esri.map.controller:EsriHomeButtonController
             *
             * @description
             * A wrapper around the ArcGIS API for JavaScript `HomeViewModel.go()` method,
             * which is executed when the esriHomeButton is clicked.
             */
            this.go = function() {
                if (!this.viewModel) {
                    return;
                }
                this.viewModel.go();
            };
        });
})(angular);
