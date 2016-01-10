(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.directives.controller:EsriHomeButtonController
     *
     * @description
     * Functions to help create HomeViewModel instances.
     *
     * @requires esri.core.factory:esriLoader
     */
    angular.module('esri.directives')
        .controller('EsriHomeButtonController', function EsriHomeButtonController(esriLoader) {
            var self = this;

            // assign required options for the HomeViewModel
            var options = {
                view: self.view
            };

            /**
             * @ngdoc function
             * @name createViewModel
             * @methodOf esri.directives.controller:EsriHomeButtonController
             *
             * @description
             * Create a HomeViewModel instance
             *
             * @param {Object} options HomeViewModel options
             *
             * @return {Promise} Returns a $q style promise which is
             * resolved with an object with a `viewModel` property that refers to the HomeViewModel
             */
            this.createViewModel = function(options) {
                return esriLoader.require('esri/widgets/Home/HomeViewModel').then(function(HomeVM) {
                    return {
                        viewModel: new HomeVM(options)
                    };
                });
            };

            // create the viewModel, get a ref to the promise
            this.createViewModelPromise = this.createViewModel(options).then(function(result) {
                self.viewModel = result.viewModel;
                return result;
            });

            /**
             * @ngdoc function
             * @name setView
             * @methodOf esri.directives.controller:EsriHomeButtonController
             *
             * @description
             * Set a view on the HomeViewModel
             *
             * @param {Object} view view instance
             *
             * @return {Promise} Returns a $q style promise and sets the view property on the HomeViewModel.
             */
            this.setView = function(view) {
                if (!view) {
                    return;
                }
                // to be fully functional, the HomeViewModel requires a valid view property
                return this.createViewModelPromise.then(function(result) {
                    result.viewModel.view = view;
                });
            };

            /**
             * @ngdoc function
             * @name goHome
             * @methodOf esri.directives.controller:EsriHomeButtonController
             *
             * @description
             * A wrapper around the Esri JSAPI HomeViewModel.goHome() method,
             * which is executed when the esriHomeButton is clicked.
             */
            this.goHome = function() {
                if (!this.viewModel) {
                    return;
                }
                this.viewModel.goHome();
            };
        });
})(angular);
