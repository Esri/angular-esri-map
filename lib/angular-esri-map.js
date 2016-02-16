(function(angular) {
    'use strict';

    angular.module('esri.core', []);

})(angular);

/*global require: false*/
(function(angular) {
    'use strict';

    /**
     * @ngdoc service
     * @name esri.core.factory:esriLoader
     *
     * @requires $q
     *
     * @description
     * Use `esriLoader` to lazyload the Esri ArcGIS API or to require API modules.
     */
    angular.module('esri.core').factory('esriLoader', function ($q) {

        /**
         * @ngdoc function
         * @name bootstrap
         * @methodOf esri.core.factory:esriLoader
         *
         * @description
         * Loads the Esri ArcGIS API for JavaScript.
         *
         * @param {Object=} options Send a list of options of how to load the Esri ArcGIS API for JavaScript.
         *  Defaults to `{url: '//js.arcgis.com/4.0beta3'}`
         *
         * @return {Promise} Returns a $q style promise which is resolved once the ArcGIS API for JavaScript has been loaded.
         */
        function bootstrap(options) {
            var deferred = $q.defer();

            // Default options object to empty hash
            var opts = options || {};

            // Don't reload API if it is already loaded
            if (isLoaded()) {
                deferred.reject('ESRI API is already loaded.');
                return deferred.promise;
            }

            // Create Script Object to be loaded
            var script    = document.createElement('script');
            script.type   = 'text/javascript';
            script.src    = opts.url || window.location.protocol + '//js.arcgis.com/4.0beta3';

            // Set onload callback to resolve promise
            script.onload = function() { deferred.resolve( window.require ); };

            document.body.appendChild(script);

            return deferred.promise;
        }

        /**
         * @ngdoc function
         * @name isLoaded
         * @methodOf esri.core.factory:esriLoader
         *
         * @return {Boolean} Returns a boolean if the Esri ArcGIS API for JavaScript is already loaded.
         */
        function isLoaded() {
            return typeof window.require !== 'undefined';
        }

        /**
         * @ngdoc function
         * @name require
         * @methodOf esri.core.factory:esriLoader
         *
         * @description
         * Load an Esri module using the Dojo AMD loader.
         *
         * @param {String|Array} modules A string of a module or an array of modules to be loaded.
         * @param {Function=} callback An optional function used to support AMD style loading, promise and callback are both added to the event loop, possible race condition.
         * @return {Promise} Returns a $q style promise which is resolved once modules are loaded
         */
        function requireModule(moduleName, callback){
            var deferred = $q.defer();

            // Throw Error if Esri is not loaded yet
            if (!isLoaded()) {
                deferred.reject('Trying to call esriLoader.require(), but Esri ArcGIS API has not been loaded yet. Run esriLoader.bootstrap() if you are lazy loading Esri ArcGIS API.');
                return deferred.promise;
            }
            
            if (typeof moduleName === 'string') {
                require([moduleName], function (module) {
                    // grab the single module passed back from require callback and send to promise
                    deferred.resolve(module);
                });

                // return a chained promise that calls the callback function
                //  to ensure it occurs within the digest cycle
                return deferred.promise.then(function(module) {
                    if (callback && typeof callback === 'function') {
                        callback(module);
                    }
                    return module;
                });
            } else if (moduleName instanceof Array) {
                require(moduleName, function () {
                    var modules = Array.prototype.slice.call(arguments);
                    // grab all of the modules passed back from require callback and send as array to promise
                    deferred.resolve(modules);
                });

                // return a chained promise that calls the callback function
                //  to ensure it occurs within the digest cycle
                return deferred.promise.then(function(modules) {
                    if (callback && typeof callback === 'function') {
                        callback.apply(this, modules);
                    }
                    return modules;
                });
            } else {
                deferred.reject('An Array<String> or String is required to load modules.');
                return deferred.promise;
            }
        }

        // Return list of aformentioned functions
        return {
            bootstrap: bootstrap,
            isLoaded:  isLoaded,
            require:   requireModule
        };
    });

})(angular);

(function(angular) {
    'use strict';

    angular.module('esri.map', ['esri.core']);

})(angular);

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

            // assign required options for the HomeViewModel
            var options = {
                view: self.view
            };

            /**
             * @ngdoc function
             * @name createViewModel
             * @methodOf esri.map.controller:EsriHomeButtonController
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
             * @methodOf esri.map.controller:EsriHomeButtonController
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
             * @methodOf esri.map.controller:EsriHomeButtonController
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

(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.map.controller:EsriMapViewController
     *
     * @description
     * Functions to help create MapView instances.
     *
     * @requires esri.core.factory:esriLoader
     * @requires $element
     * @requires $scope
     */
    angular.module('esri.map')
        .controller('EsriMapViewController', function EsriMapViewController($element, $scope, esriLoader) {
            var self = this;

            // read options passed in as either a JSON string expression
            // or as a function bound object
            self.options = this.viewOptions() || {};
            // assign required and available properties
            self.options.container = $element.children()[0];

            /**
             * @ngdoc function
             * @name getMapView
             * @methodOf esri.map.controller:EsriMapViewController
             *
             * @description
             * Load and get a reference to a MapView module
             *
             * @return {Promise} Returns a $q style promise which is
             * resolved with an object with a `view` property that refers to the MapView
             */
            this.getMapView = function() {
                return esriLoader.require('esri/views/MapView').then(function(MapView) {
                    return {
                        view: MapView
                    };
                });
            };

            /**
             * @ngdoc function
             * @name setMap
             * @methodOf esri.map.controller:EsriMapViewController
             *
             * @description
             * Set a Map on the MapView. A new MapView will be constructed
             * if it does not already exist, and also execute optional `on-load` and `on-create` events.
             *
             * @param {Object} map Map instance
             */
            this.setMap = function(map) {
                if (!map) {
                    return;
                }

                if (!self.view) {
                    // construct a new MapView with the supplied map and options
                    self.options.map = map;
                    return this.getMapView().then(function(result) {
                        self.view = new result.view(self.options);

                        if (typeof self.onCreate() === 'function') {
                            self.onCreate()(self.view);
                        }

                        self.view.then(function() {
                            if (typeof self.onLoad() === 'function') {
                                $scope.$apply(function() {
                                    self.onLoad()(self.view);
                                });
                            }
                        });
                    });
                } else {
                    // MapView already constructed; only set the map property
                    self.view.map = map;
                }
            };
        });
})(angular);

(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.map.controller:EsriSceneViewController
     *
     * @description
     * Functions to help create SceneView instances.
     *
     * @requires esri.core.factory:esriLoader
     * @requires $element
     * @requires $scope
     */
    angular.module('esri.map')
        .controller('EsriSceneViewController', function EsriSceneViewController($element, $scope, esriLoader) {
            var self = this;

            // read options passed in as either a JSON string expression
            // or as a function bound object
            self.options = this.viewOptions() || {};
            // assign required and available properties
            self.options.container = $element.children()[0];

            /**
             * @ngdoc function
             * @name getSceneView
             * @methodOf esri.map.controller:EsriSceneViewController
             *
             * @description
             * Load and get a reference to a SceneView module
             *
             * @return {Promise} Returns a $q style promise which is
             * resolved with an object with a `view` property that refers to the SceneView
             */
            this.getSceneView = function() {
                return esriLoader.require('esri/views/SceneView').then(function(SceneView) {
                    return {
                        view: SceneView
                    };
                });
            };

            /**
             * @ngdoc function
             * @name setMap
             * @methodOf esri.map.controller:EsriSceneViewController
             *
             * @description
             * Set a Map or WebScene on the SceneView. A new SceneView will be constructed
             * if it does not already exist, and also execute optional `on-load` and `on-create` events.
             *
             * @param {Object} map Map instance or WebScene instance
             *
             * @return {Promise} Returns a $q style promise and then
             * sets the map property and other options on the SceneView.
             */
            this.setMap = function(map) {
                if (!map) {
                    return;
                }

                if (!self.view) {
                    // construct a new SceneView with the supplied map and options
                    self.options.map = map;
                    return this.getSceneView().then(function(result) {
                        self.view = new result.view(self.options);

                        if (typeof self.onCreate() === 'function') {
                            self.onCreate()(self.view);
                        }

                        self.view.then(function() {
                            if (typeof self.onLoad() === 'function') {
                                $scope.$apply(function() {
                                    self.onLoad()(self.view);
                                });
                            }
                        });
                    });
                } else {
                    // SceneView already constructed; only set the map property
                    self.view.map = map;
                }
            };
        });
})(angular);

(function(angular) {
    'use strict';

    /**
     * @ngdoc directive
     * @name esri.map.directive:esriHomeButton
     * @restrict E
     * @element
     * @scope
     *
     * @description
     * This is the directive which will create a home button using the Esri ArcGIS API for JavaScript.
     * There are plenty of examples showing how to use this directive and its bound parameters.
     *
     * ## Examples
     * - {@link ../#/examples/home-button Home Button}
     *
     * @param {Object} view Instance of a MapView or SceneView.
     */
    angular.module('esri.map')
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

(function(angular) {
    'use strict';

    /**
     * @ngdoc directive
     * @name esri.map.directive:esriSceneView
     * @restrict E
     * @element
     * @scope
     *
     * @description
     * This is the directive which will create a scene view using the Esri ArcGIS API for JavaScript.
     * There are plenty of examples showing how to use this directive and its bound parameters.
     *
     * ## Examples
     * - {@link ../#/examples/scene-view Scene View}
     *
     * @param {Object} map Instance of a Map or WebScene.
     * @param {Function=} on-create Callback for successful creation of the scene view.
     * @param {Function=} on-load Callback for successful loading of the scene view.
     * @param {Object | String=} view-options An object or inline object hash string defining additional scene view constructor options.
     */
    angular.module('esri.map')
        .directive('esriSceneView', function esriSceneView() {
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
