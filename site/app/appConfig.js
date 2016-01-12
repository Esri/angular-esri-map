(function() {
    'use strict';
    var urlPrefixes = {
        templateHref: '#/examples/',
        routePath: '/examples/',
        routeTemplateUrl: 'app/examples/'
    };

    var config = {
        examplePageCategories: {
            '2D': [{
                toc: {
                    title: 'Feature Layer',
                    description: 'Load a feature layer onto a map',
                    url: urlPrefixes.templateHref + 'feature-layer'
                },
                route: {
                    path: urlPrefixes.routePath + 'feature-layer',
                    templateUrl: urlPrefixes.routeTemplateUrl + 'feature-layer.html',
                    controller: 'FeatureLayerCtrl',
                    controllerAs: 'vm'
                }
            }],
            '3D': [{
                toc: {
                    title: 'Scene View',
                    description: 'Use the scene view directive to load a tiled basemap onto a 3D globe.',
                    url: urlPrefixes.templateHref + 'scene-view'
                },
                route: {
                    path: urlPrefixes.routePath + 'scene-view',
                    templateUrl: urlPrefixes.routeTemplateUrl + 'scene-view.html',
                    controller: 'SceneViewCtrl',
                    controllerAs: 'vm'
                }
            }],
            Controls: [{
                toc: {
                    title: 'Home Button',
                    description: 'A home button directive to return the map/scene view to it\'s starting point',
                    url: urlPrefixes.templateHref + 'home-button'
                },
                route: {
                    path: urlPrefixes.routePath + 'home-button',
                    templateUrl: urlPrefixes.routeTemplateUrl + 'home-button.html',
                    controller: 'HomeButtonCtrl',
                    controllerAs: 'vm'
                }
            }]
        },
        patternsPages: [
            {
                path: '/patterns/references-to-map-and-layers',
                templateUrl: 'app/patterns/references-to-map-and-layers.html',
                title: 'Getting a Reference to the Map and Layers',
                shortTitle: 'Map and Layer References'
            },
            {
                path: '/patterns/other-esri-classes',
                templateUrl: 'app/patterns/other-esri-modules.html',
                title: 'Loading and Using Other Esri Classes',
                shortTitle: 'Other Esri Classes'
            },
            {
                path: '/patterns/create-your-own-directives',
                templateUrl: 'app/patterns/create-your-own-directives.html',
                title: 'Create Your Own Directives',
                shortTitle: 'Custom Directives'
            },
            {
                path: '/patterns/lazy-load',
                templateUrl: 'app/patterns/lazy-load.html',
                title: 'Lazy Load the ArcGIS API for JavaScript',
                shortTitle: 'Lazy Load'
            }
        ]
    };

    angular.module('esri-map-docs')
        .constant('appConfig', config);

})(angular);
