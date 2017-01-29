(function() {
    'use strict';
    var urlPrefixes = {
        templateHref: '#/examples/',
        routePath: '/examples/',
        routeTemplateUrl: 'app/examples/'
    };

    var config = {
        examplePageCategories: {
            '2D MapView': [{
                toc: {
                    title: 'Feature Layer',
                    description: 'Use the <esri-map-view> directive to load a FeatureLayer onto a 2D map.',
                    url: urlPrefixes.templateHref + 'feature-layer'
                },
                route: {
                    path: urlPrefixes.routePath + 'feature-layer',
                    templateUrl: urlPrefixes.routeTemplateUrl + 'feature-layer.html',
                    controller: 'FeatureLayerCtrl',
                    controllerAs: 'vm'
                }
            }, {
                toc: {
                    title: 'Vector Tiles',
                    description: 'Load a VectorTileLayer onto a map.',
                    url: urlPrefixes.templateHref + 'vector-tiles'
                },
                route: {
                    path: urlPrefixes.routePath + 'vector-tiles',
                    templateUrl: urlPrefixes.routeTemplateUrl + 'vector-tiles.html',
                    controller: 'VectorTileLayerCtrl',
                    controllerAs: 'vm'
                }
            }],
            '3D SceneView': [{
                toc: {
                    title: 'SceneView',
                    description: 'Use the <esri-scene-view> directive to load a tiled basemap onto a 3D globe.',
                    url: urlPrefixes.templateHref + 'scene-view'
                },
                route: {
                    path: urlPrefixes.routePath + 'scene-view',
                    templateUrl: urlPrefixes.routeTemplateUrl + 'scene-view.html',
                    controller: 'SceneViewCtrl',
                    controllerAs: 'vm'
                }
            }, {
                toc: {
                    title: 'WebScene Slides',
                    description: 'Load a WebScene from an ArcGIS for Portal item and work with its WebScene, using inline templating and functionality.',
                    url: urlPrefixes.templateHref + 'webscene-slides'
                },
                route: {
                    path: urlPrefixes.routePath + 'webscene-slides',
                    templateUrl: urlPrefixes.routeTemplateUrl + 'webscene-slides.html',
                    controller: 'WebSceneSlidesCtrl',
                    controllerAs: 'vm'
                }
            }, {
                toc: {
                    title: 'Data-Driven Extrusion',
                    description: 'Extrude polygon features based on a field value using ExtrudeSymbol3DLayer in a SceneView.',
                    url: urlPrefixes.templateHref + 'extrude-polygon'
                },
                route: {
                    path: urlPrefixes.routePath + 'extrude-polygon',
                    templateUrl: urlPrefixes.routeTemplateUrl + 'extrude-polygon.html',
                    controller: 'ExtrudePolygonCtrl',
                    controllerAs: 'vm'
                }
            }, {
                toc: {
                    title: 'Toggle Ground Elevation',
                    description: 'Turn on or off the ground elevation layer in a SceneView.',
                    url: urlPrefixes.templateHref + 'scene-toggle-elevation'
                },
                route: {
                    path: urlPrefixes.routePath + 'scene-toggle-elevation',
                    templateUrl: urlPrefixes.routeTemplateUrl + 'scene-toggle-elevation.html',
                    controller: 'SceneToggleElevationCtrl',
                    controllerAs: 'vm'
                }
            }],
            Controls: [{
                toc: {
                    title: 'Home Button',
                    description: 'A custom home button directive to return the MapView or SceneView to its starting point.',
                    url: urlPrefixes.templateHref + 'home-button'
                },
                route: {
                    path: urlPrefixes.routePath + 'home-button',
                    templateUrl: urlPrefixes.routeTemplateUrl + 'home-button.html',
                    controller: 'HomeButtonCtrl',
                    controllerAs: 'vm'
                }
            }, {
                toc: {
                    title: 'Get Started with PopupTemplate',
                    description: 'Define a PopupTemplate for a FeatureLayer.',
                    url: urlPrefixes.templateHref + 'popups'
                },
                route: {
                    path: urlPrefixes.routePath + 'popups',
                    templateUrl: urlPrefixes.routeTemplateUrl + 'popups.html',
                    controller: 'PopupsCtrl',
                    controllerAs: 'vm'
                }
            }, {
                toc: {
                    title: 'Search',
                    description: 'Add a search tool to find locations on the map.',
                    url: urlPrefixes.templateHref + 'search'
                },
                route: {
                    path: urlPrefixes.routePath + 'search',
                    templateUrl: urlPrefixes.routeTemplateUrl + 'search.html',
                    controller: 'SearchCtrl',
                    controllerAs: 'vm'
                }
            }, {
                toc: {
                    title: 'WebScene Slides with Custom Directive',
                    description: 'Load a WebScene from an ArcGIS for Portal item and work with its WebScene slides using the <esri-webscene-slides> directive.',
                    url: urlPrefixes.templateHref + 'webscene-slides-as-directive'
                },
                route: {
                    path: urlPrefixes.routePath + 'webscene-slides-as-directive',
                    templateUrl: urlPrefixes.routeTemplateUrl + 'webscene-slides-as-directive.html',
                    controller: 'WebSceneSlidesAsDirectiveCtrl',
                    controllerAs: 'vm'
                }
            }],
            Other: [{
                toc: {
                    title: 'Chaining Promises',
                    description: 'Chain together asynchronous operations with promises for more complex interactions and calculations.',
                    url: urlPrefixes.templateHref + 'chaining-promises'
                },
                route: {
                    path: urlPrefixes.routePath + 'chaining-promises',
                    templateUrl: urlPrefixes.routeTemplateUrl + 'chaining-promises.html',
                    controller: 'ChainingPromisesCtrl',
                    controllerAs: 'vm'
                }
            }, {
                toc: {
                    title: 'Geodesic Buffers',
                    description: 'Create geodesic buffers using the GeometryEngine in 2D and 3D views referencing the same map.',
                    url: urlPrefixes.templateHref + 'geodesic-buffers'
                },
                route: {
                    path: urlPrefixes.routePath + 'geodesic-buffers',
                    templateUrl: urlPrefixes.routeTemplateUrl + 'geodesic-buffers.html',
                    controller: 'GeodesicBuffersCtrl',
                    controllerAs: 'vm'
                }
            }, {
                toc: {
                    title: 'Property Binding',
                    description: 'Bind properties together between AngularJS and Esri JSAPI.',
                    url: urlPrefixes.templateHref + 'property-binding'
                },
                route: {
                    path: urlPrefixes.routePath + 'property-binding',
                    templateUrl: urlPrefixes.routeTemplateUrl + 'property-binding.html',
                    controller: 'PropertyBindingCtrl',
                    controllerAs: 'vm'
                }
            }, {
                toc: {
                    title: 'Registry Pattern',
                    description: 'Shows how to get a reference to a MapView or SceneView object by using the registry.',
                    url: urlPrefixes.templateHref + 'registry-pattern'
                },
                route: {
                    path: urlPrefixes.routePath + 'registry-pattern',
                    templateUrl: urlPrefixes.routeTemplateUrl + 'registry-pattern.html',
                    controller: 'RegistryPatternCtrl',
                    controllerAs: 'vm'
                }
            }]
        },
        patternsPages: [{
            path: '/patterns/other-esri-classes',
            templateUrl: 'app/patterns/other-esri-modules.html',
            title: 'Loading and Using Other Esri Classes',
            shortTitle: 'Loading Esri Classes'
        }, {
            path: '/patterns/references-to-views',
            templateUrl: 'app/patterns/references-to-views.html',
            title: 'Getting a Reference to MapViews and SceneViews',
            shortTitle: 'MapView and SceneView References'
        }, {
            path: '/patterns/using-creating-widgets',
            templateUrl: 'app/patterns/using-creating-widgets.html',
            title: 'Using and Creating Esri Widgets',
            shortTitle: 'Creating Widgets'
        }, {
            path: '/patterns/property-binding',
            templateUrl: 'app/patterns/property-binding.html',
            title: 'Binding Properties Between AngularJS and Esri',
            shortTitle: 'Property Binding'
        }/*, {
            // TODO: custom directive's page
            path: '/patterns/create-your-own-directives',
            templateUrl: 'app/patterns/create-your-own-directives.html',
            title: 'Create Your Own Directives',
            shortTitle: 'Custom Directives'
        }*/, {
            path: '/patterns/create-your-own-factories',
            templateUrl: 'app/patterns/create-your-own-factories.html',
            title: 'Create Your Own Factories',
            shortTitle: 'Custom Factories'
        }, {
            path: '/patterns/lazy-load',
            templateUrl: 'app/patterns/lazy-load.html',
            title: 'Lazy Load the ArcGIS API for JavaScript',
            shortTitle: 'Lazy Load'
        }]
    };

    angular.module('esri-map-docs')
        .constant('appConfig', config);

})(angular);
