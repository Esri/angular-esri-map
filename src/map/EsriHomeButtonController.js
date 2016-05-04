(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.map.controller:EsriHomeButtonController
     *
     * @description
     * Functions to help create HomeViewModel instances.
     *
     * @requires esri.core.factory:esriLoader
     */
    angular.module('esri.map')
        .controller('EsriHomeButtonController', function EsriHomeButtonController(esriLoader) {
            var self = this;

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
                });
            };

            /**
             * @ngdoc function
             * @name go
             * @methodOf esri.map.controller:EsriHomeButtonController
             *
             * @description
             * A wrapper around the Esri JSAPI `HomeViewModel.go()` method,
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
