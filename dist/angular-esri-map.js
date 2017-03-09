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
     * Use `esriLoader` to lazy load the ArcGIS API for JavaScript or to require individual API modules.
     */
    angular.module('esri.core').factory('esriLoader', ['$q', function ($q) {

        /**
         * @ngdoc function
         * @name bootstrap
         * @methodOf esri.core.factory:esriLoader
         *
         * @description
         * Loads the ArcGIS API for JavaScript.
         *
         * @param {Object=} options Send a list of options of how to load the ArcGIS API for JavaScript.
         *  This defaults to `{url: '//js.arcgis.com/4.3'}`.
         *
         * @return {Promise} Returns a $q style promise which is resolved once the ArcGIS API for JavaScript has been loaded.
         */
        function bootstrap(options) {
            var deferred = $q.defer();

            // Default options object to empty hash
            var opts = options || {};

            // Don't reload API if it is already loaded
            if (isLoaded()) {
                deferred.reject('ArcGIS API for JavaScript is already loaded.');
                return deferred.promise;
            }

            // Create Script Object to be loaded
            var script    = document.createElement('script');
            script.type   = 'text/javascript';
            script.src    = opts.url || window.location.protocol + '//js.arcgis.com/4.3';

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
         * @return {Boolean} Returns a boolean if the ArcGIS API for JavaScript is already loaded.
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
         * Load an Esri module(s) using the Dojo AMD loader.
         *
         * @param {Array|String} modules  An array of module strings (or a string of a single module) to be loaded.
         * @param {Function=} callback An optional function used to support AMD style loading.
         * @return {Promise} Returns a $q style promise which is resolved once modules are loaded.
         */
        function requireModule(moduleName, callback){
            var deferred = $q.defer();

            // Throw Error if Esri is not loaded yet
            if (!isLoaded()) {
                deferred.reject('Trying to call esriLoader.require(), but the ArcGIS API for JavaScript has not been loaded yet. Run esriLoader.bootstrap() if you are lazy loading the ArcGIS API for JavaScript.');
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
    }]);

})(angular);

(function(angular) {
    'use strict';

    /**
     * @ngdoc service
     * @name esri.core.factory:esriRegistry
     *
     * @description
     * Use `esriRegistry` to store and retrieve MapView or SceneView instances for use in different controllers.
     *
     * ## Examples
     * - {@link ../#/examples/registry-pattern Registry Pattern}
     */
    angular.module('esri.core').service('esriRegistry', ['$q', function($q) {
        var registry = {};

        return {
            _register: function(name, promise) {
                // if there isn't a promise in the registry yet make one...
                // this is the case where a directive is nested higher then the controller
                // needing the instance
                if (!registry[name]) {
                    registry[name] = $q.defer();
                }

                var instance = registry[name];

                // when the promise from the directive is rejected/resolved
                // reject/resolve the promise in the registry with the appropriate value
                promise.then(function(arg) {
                    instance.resolve(arg);
                    return arg;
                }, function(arg) {
                    instance.reject(arg);
                    return arg;
                });

                // return a function to "deregister" the promise
                // by deleting it from the registry
                return function() {
                    delete registry[name];
                };
            },

            /**
             * @ngdoc function
             * @name get
             * @methodOf esri.core.factory:esriRegistry
             *
             * @description
             * Get the MapView or SceneView instance registered with the given name.
             * See {@link esri.map.directive:esriMapView esriMapView} or
             * {@link esri.map.directive:esriSceneView esriSceneView}
             * for info on how to register a map using the `register-as` attribute.
             *
             * @param {String} name The name that the view was registered with.
             *
             * @return {Promise} Returns a $q style promise which is resolved with the view once it has been loaded.
             */
            get: function(name) {
                // If something is already in the registry return its promise ASAP.
                // This is the case where you might want to get a registry item in an event handler.
                if (registry[name]) {
                    return registry[name].promise;
                }

                // If we dont already have a registry item create one. This covers the
                // case where the directive is nested inside the controller. The parent
                // controller will be executed and gets a promise that will be resolved
                // later when the item is registered
                var deferred = $q.defer();

                registry[name] = deferred;

                return deferred.promise;
            }
        };
    }]);

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
     * Functions to help create and manage
     * {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Home-HomeViewModel.html HomeViewModel}
     * instances.
     *
     * @requires esri.core.factory:esriLoader
     * @requires $element
     */
    angular.module('esri.map')
        .controller('EsriHomeButtonController', ['$element', 'esriLoader', function EsriHomeButtonController($element, esriLoader) {
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
        }]);
})(angular);

(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.map.controller:EsriMapViewController
     *
     * @description
     * Functions to help create
     * {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-views-MapView.html MapView}
     * instances. This contoller is used by the {@link esri.map.directive:esriMapView esriMapView} directive.
     *
     * @requires esri.core.factory:esriLoader
     * @requires esri.core.factory:esriRegistry
     * @requires $element
     * @requires $scope
     * @requires $q
     */
    angular.module('esri.map')
        .controller('EsriMapViewController', ['$element', '$scope', '$q', 'esriLoader', 'esriRegistry', function EsriMapViewController($element, $scope, $q, esriLoader, esriRegistry) {
            var self = this;

            // Put initialization logic inside `$onInit()`
            // to make sure bindings have been initialized.
            this.$onInit = function() {
                // read options passed in as either a JSON string expression
                // or as a function bound object
                self.options = this.viewOptions() || {};
                // assign required and available properties
                self.options.container = $element.children()[0];
            };

            // Prior to v1.5, we need to call `$onInit()` manually.
            // (Bindings will always be pre-assigned in these versions.)
            if (angular.version.major === 1 && angular.version.minor < 5) {
                this.$onInit();
            }

            /**
             * @ngdoc function
             * @name getMapView
             * @methodOf esri.map.controller:EsriMapViewController
             *
             * @description
             * Load and get a reference to a MapView module.
             *
             * @return {Promise} Returns a $q style promise which is
             * resolved with an object with a `view` property that refers to the MapView module.
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
             * Set a Map on the MapView.
             * A new MapView will be constructed if it does not already exist,
             * and also execute the optional `on-load` and `on-create` events.
             * If a new MapView is rejected, the optional `on-error` event will be executed.
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

                        // set up a deferred for dealing with the (optional) esriRegistry
                        var viewRegistryDeferred = $q.defer();
                        if (typeof self.registerAs === 'string') {
                            self.deregister = esriRegistry._register(self.registerAs, viewRegistryDeferred.promise);
                            $scope.$on('$destroy', function() {
                                if (self.deregister) {
                                    self.deregister();
                                }
                            });
                        }

                        if (typeof self.onCreate() === 'function') {
                            self.onCreate()(self.view);
                        }

                        self.view.then(function() {
                            if (typeof self.onLoad() === 'function') {
                                $scope.$apply(function() {
                                    self.onLoad()(self.view);
                                });
                            }
                            // handle the deferred that is intended for use with the esriRegistry
                            viewRegistryDeferred.resolve({
                                view: self.view
                            });
                        }, function(err) {
                            if (typeof self.onError() === 'function') {
                                self.onError()(err);
                            }
                            // handle the deferred that is intended for use with the esriRegistry
                            viewRegistryDeferred.reject(err);
                        });
                    });
                } else {
                    // MapView already constructed; only set the map property
                    self.view.map = map;
                }
            };
        }]);
})(angular);

(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.map.controller:EsriSceneViewController
     *
     * @description
     * Functions to help create
     * {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-views-SceneView.html SceneView}
     * instances.  This contoller is used by the {@link esri.map.directive:esriSceneView esriSceneView} directive.
     *
     * @requires esri.core.factory:esriLoader
     * @requires esri.core.factory:esriRegistry
     * @requires $element
     * @requires $scope
     * @requires $q
     */
    angular.module('esri.map')
        .controller('EsriSceneViewController', ['$element', '$scope', '$q', 'esriLoader', 'esriRegistry', function EsriSceneViewController($element, $scope, $q, esriLoader, esriRegistry) {
            var self = this;

            // Put initialization logic inside `$onInit()`
            // to make sure bindings have been initialized.
            this.$onInit = function() {
                // read options passed in as either a JSON string expression
                // or as a function bound object
                self.options = this.viewOptions() || {};
                // assign required and available properties
                self.options.container = $element.children()[0];
            };

            // Prior to v1.5, we need to call `$onInit()` manually.
            // (Bindings will always be pre-assigned in these versions.)
            if (angular.version.major === 1 && angular.version.minor < 5) {
                this.$onInit();
            }

            /**
             * @ngdoc function
             * @name getSceneView
             * @methodOf esri.map.controller:EsriSceneViewController
             *
             * @description
             * Load and get a reference to a SceneView module.
             *
             * @return {Promise} Returns a $q style promise which is
             * resolved with an object with a `view` property that refers to the SceneView module.
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
             * Set a Map or WebScene on the SceneView.
             * A new SceneView will be constructed if it does not already exist,
             * and also execute the optional `on-load` and `on-create` events.
             * If a new SceneView is rejected, the optional `on-error` event will be executed.
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

                        // set up a deferred for dealing with the (optional) esriRegistry
                        var viewRegistryDeferred = $q.defer();
                        if (typeof self.registerAs === 'string') {
                            self.deregister = esriRegistry._register(self.registerAs, viewRegistryDeferred.promise);
                            $scope.$on('$destroy', function() {
                                if (self.deregister) {
                                    self.deregister();
                                }
                            });
                        }

                        if (typeof self.onCreate() === 'function') {
                            self.onCreate()(self.view);
                        }

                        self.view.then(function() {
                            if (typeof self.onLoad() === 'function') {
                                $scope.$apply(function() {
                                    self.onLoad()(self.view);
                                });
                            }
                            // handle the deferred that is intended for use with the esriRegistry
                            viewRegistryDeferred.resolve({
                                view: self.view
                            });
                        }, function(err) {
                            if (typeof self.onError() === 'function') {
                                self.onError()(err);
                            }
                            // handle the deferred that is intended for use with the esriRegistry
                            viewRegistryDeferred.reject(err);
                        });
                    });
                } else {
                    // SceneView already constructed; only set the map property
                    self.view.map = map;
                }
            };
        }]);
})(angular);

(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.map.controller:EsriWebsceneSlidesController
     *
     * @description
     * Functions to help create and manage individual slide properties and behaviors.
     */
    angular.module('esri.map')
        .controller('EsriWebsceneSlidesController', function EsriWebsceneSlidesController() {
            var self = this;
            
            /**
             * @ngdoc function
             * @name setSlides
             * @methodOf esri.map.controller:EsriWebsceneSlidesController
             *
             * @description
             * Set a an array of slides for the directive. Each slide will have its own entry in the template.
             *
             * @param {Array} slides Array of {@link https://developers.arcgis.com/javascript/beta/api-reference/esri-webscene-Slide.html Slide} instances.             
             *
             */
            this.setSlides = function(slides) {
                // tack on an extra property for ng-class css styling
                slides.forEach(function(slide) {
                    slide.isActiveSlide = false;
                });
            };

            /**
             * @ngdoc function
             * @name onSlideClick
             * @methodOf esri.map.controller:EsriWebsceneSlidesController
             *
             * @description
             * This method is executed when an individual slide is clicked.
             * It passes the slide object to the **`on-slide-change`** bound callback function,
             * which can be useful for manipulating an associated Esri SceneView.
             * It also sets the clicked slide's active status to true, to assist with CSS styling.
             *
             * @param {Object} slide slide instance
             */
            this.onSlideClick = function(slide) {
                // set isActiveSlide state on each slide to assist with CSS styling
                self.slides.forEach(function(slide) {
                    slide.isActiveSlide = false;
                });
                slide.isActiveSlide = true;

                // handle click action without direct reference to the ArcGIS API for JavaScript
                //  by passing the viewpoint of the slide to the onSlideChange function binding
                if (typeof self.onSlideChange === 'function') {
                    self.onSlideChange()(slide);
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
     * This is the directive which will create a home button using the ArcGIS API for JavaScript.
     *
     * ## Examples
     * - {@link ../#/examples/home-button Home Button}
     *
     * @param {Object} view Instance of a MapView or SceneView.
     * @param {Object=} view-ui-position The MapView or SceneView UI position object which this directive
     * can be added to, as an alternative to element positioning with other DOM elements and CSS rules.
     * For details on valid object properties, see the
     * {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-views-ui-DefaultUI.html#add `DefaultUI.add()`}
     * **`position`** object argument.
     */
    angular.module('esri.map')
        .directive('esriHomeButton', function esriHomeButton() {
            return {
                // element only
                restrict: 'E',

                // isolate scope
                scope: {
                    view: '=',
                    viewUiPosition: '&'
                },

                template: [
                    '<div ng-click="homeButtonCtrl.go()" role="button" tabindex="0" class="esri-home esri-widget-button esri-widget esri-component">',
                    '    <span aria-hidden="true" class="esri-icon esri-icon-home" title="Default extent"></span>',
                    '    <span class="esri-icon-font-fallback-text">Home</span>',
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
     * This is the directive which will create a
     * {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-views-MapView.html MapView}
     * instance using the ArcGIS API for JavaScript.
     * There are plenty of examples showing how to use this directive and its bound parameters.
     *
     * ## Examples
     * - {@link ../#/examples/feature-layer Feature Layer}
     * - {@link ../#/examples/vector-tiles Vector Tiles}
     * - {@link ../#/examples/search Search}
     * - {@link ../#/examples and more...}
     *
     * @param {Object} map Instance of a {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-Map.html Map}
     *  or {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-WebMap.html WebMap}.
     * @param {Function=} on-create Callback for successful creation of the MapView.
     * @param {Function=} on-load Callback for successful loading of the MapView.
     * @param {Function=} on-error Callback for rejected/failed loading of the MapView.
     * @param {Object | String=} view-options An object or inline object hash string defining additional
     *  {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-views-MapView.html#properties MapView properties}.
     * @param {String=} register-as A name to use when registering the view so that it can be used by other controllers.
     *  See {@link esri.core.factory:esriRegistry esriRegistry}.
     */
    angular.module('esri.map')
        .directive('esriMapView', function esriMapView() {
            return {
                // element only
                restrict: 'E',

                transclude: true,

                // isolate scope
                scope: {
                    // one-way binding
                    registerAs: '@?',
                    // two-way binding
                    map: '=?',
                    // function binding for event handlers
                    onCreate: '&',
                    onLoad: '&',
                    onError: '&',
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
     * This is the directive which will create a
     * {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-views-SceneView.html SceneView}
     * instance using the ArcGIS API for JavaScript.
     * There are plenty of examples showing how to use this directive and its bound parameters.
     *
     * ## Examples
     * - {@link ../#/examples/scene-view SceneView}
     * - {@link ../#/examples/extrude-polygon Extrude Polygon}
     * - {@link ../#/examples/scene-toggle-elevation Toggle Basemap Elevation}
     * - {@link ../#/examples and more...}
     *
     * @param {Object} map Instance of a {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-Map.html Map}
     *  or {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-WebScene.html WebScene}.
     * @param {Function=} on-create Callback for successful creation of the SceneView.
     * @param {Function=} on-load Callback for successful loading of the SceneView.
     * @param {Function=} on-error Callback for rejected/failed loading of the SceneView, for example when WebGL is not supported.
     * @param {Object | String=} view-options An object or inline object hash string defining additional
     *  {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-views-SceneView.html#properties SceneView properties}.
     * @param {String=} register-as A name to use when registering the view so that it can be used by other controllers.
     *  See {@link esri.core.factory:esriRegistry esriRegistry}.
     */
    angular.module('esri.map')
        .directive('esriSceneView', function esriSceneView() {
            return {
                // element only
                restrict: 'E',

                transclude: true,

                // isolate scope
                scope: {
                    // one-way binding
                    registerAs: '@?',
                    // two-way binding
                    map: '=?',
                    // function binding for event handlers
                    onCreate: '&',
                    onLoad: '&',
                    onError: '&',
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

(function(angular) {
    'use strict';

    /**
     * @ngdoc directive
     * @name esri.map.directive:esriWebsceneSlides
     * @restrict E
     * @element
     * @scope
     *
     * @description
     * This is the directive which will create slide bookmarks for
     * {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-webscene-Slide.html WebScene Slides}
     * for the ArcGIS API for JavaScript.
     *
     * Each bookmark will include the title and screenshot of the slide, and clicking on a bookmark will
     * provide the slide object to a callback function (`on-slide-change`). For example, the slide provided
     * in the callback will have a viewpoint property that could be used to change the location of an associated Esri SceneView.
     *
     * **Note:** this directive does not rely on any out of the box Esri widgets or view models.
     * It demonstrates how a custom directive can be created and made to interact with other parts of the ArcGIS API for JavaScript.
     *
     * ## Styling and CSS
     * Use the following class names to supply styling to this directive:
     * - **`slides-container`**: outer-most container (`div`)
     * - **`slide`**: individual slide bookmark (`span`)
     * - **`active-slide`**: conditional class which is set by `ng-class` when an individual slide is clicked
     *
     * For example, to arrange slides horizontally and give a highlighted effect on the selected slide, the following styles could be used:
     * ```css
     * .slides-container {
     *     background-color: black;
     *     color: white;
     *     padding: 10px;
     * }
     * .slide {
     *     cursor: pointer;
     *     display: inline-block;
     *     margin: 0 10px;
     * }
     * .active-slide {
     *     box-shadow: 0 0 12px white;
     *     border-style: solid;
     *     border-width: thin;
     *     border-color: white;
     * }
     * ```
     *
     * ## Examples
     * - {@link ../#/examples/webscene-slides-as-directive WebScene Slides with Custom Directive}
     *
     * @param {Array} slides Array of {@link https://developers.arcgis.com/javascript/beta/api-reference/esri-webscene-Slide.html Slide} instances.
     * @param {Function=} on-slide-change Callback for handling a change in the active slide.
     *  It may be used, for example, to update the viewpoint location of an associated Esri SceneView.
     */
    angular.module('esri.map')
        .directive('esriWebsceneSlides', function esriWebsceneSlides() {
            return {
                // element only
                restrict: 'E',

                // isolate scope
                scope: {
                    slides: '=', // array of slides
                    onSlideChange: '&' // returns a slide property
                },

                template: [
                    '<div class="slides-container" ng-show="websceneSlidesCtrl.slides.length > 0">',
                    '   <span class="slide" ng-repeat="slide in websceneSlidesCtrl.slides" ng-click="websceneSlidesCtrl.onSlideClick(slide)">',
                    '       {{slide.title.text}}',
                    '       <br>',
                    '       <img src="{{slide.thumbnail.url}}" title="{{slide.title.text}}" ng-class="{\'active-slide\': slide.isActiveSlide}">',
                    '       <br>',
                    '   </span>',
                    '</div>'
                ].join(''),

                controllerAs: 'websceneSlidesCtrl',

                bindToController: true,

                // directive api
                controller: 'EsriWebsceneSlidesController',

                link: function websceneSlidesLink(scope, element, attrs, controller) {
                    scope.$watch('websceneSlidesCtrl.slides', function(newVal) {
                        // bound slides property can be updated at any time
                        //  and will most likely occur asynchronously after an Esri view is loaded
                        controller.setSlides(newVal);
                    });
                }
            };
        });
})(angular);
