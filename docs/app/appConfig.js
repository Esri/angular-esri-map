(function() {
    'use strict';
    var urlPrefixes = {
        templateHref: '#/examples/',
        routePath: '/examples/',
        routeTemplateUrl: 'app/examples/'
    };

    var config = {
        examplePages: [{
            toc: {
                title: 'Simple Map',
                description: 'Create a map by loading center, zoom, and basemap from an options object.',
                url: urlPrefixes.templateHref + 'simple-map'
            },
            route: {
                path: urlPrefixes.routePath + 'simple-map',
                templateUrl: urlPrefixes.routeTemplateUrl + 'simple-map.html',
                controller: 'SimpleMapCtrl'
            }
        }, {
            toc: {
                title: 'Web Map',
                description: 'Load a web map from ArcGIS Online and show changes to center and zoom level via bound scope properties.',
                url: urlPrefixes.templateHref + 'web-map'
            },
            route: {
                path: urlPrefixes.routePath + 'web-map',
                templateUrl: urlPrefixes.routeTemplateUrl + 'web-map.html',
                controller: 'WebMapCtrl'
            }
        }, {
            toc: {
                title: 'Set Basemap',
                description: 'Shows how to use angular binding to link a select list to the basemap property of the map.',
                url: urlPrefixes.templateHref + 'set-basemap'
            },
            route: {
                path: urlPrefixes.routePath + 'set-basemap',
                templateUrl: urlPrefixes.routeTemplateUrl + 'set-basemap.html',
                controller: 'BasemapCtrl'
            }
        }, {
            toc: {
                title: 'Set Map Center and Zoom',
                description: 'Demonstrates two-way binding of the center and zoom properties.',
                url: urlPrefixes.templateHref + 'set-center-zoom'
            },
            route: {
                path: urlPrefixes.routePath + 'set-center-zoom',
                templateUrl: urlPrefixes.routeTemplateUrl + 'set-center-zoom.html',
                controller: 'CenterAndZoomCtrl'
            }
        }, {
            toc: {
                title: 'Feature Layers',
                description: 'Loads two feature layers into the map and shows how to bind layer visibility to a check box.',
                url: urlPrefixes.templateHref + 'feature-layers'
            },
            route: {
                path: urlPrefixes.routePath + 'feature-layers',
                templateUrl: urlPrefixes.routeTemplateUrl + 'feature-layers.html',
                controller: 'FeatureLayersCtrl'
            }
        }, {
            toc: {
                title: 'Dynamic Map Service Layer',
                description: 'Loads a dynamic map service layer into the map and shows how to bind layer properties such as visibility and opacity to external controls.',
                url: urlPrefixes.templateHref + 'dynamic-map-service-layer'
            },
            route: {
                path: urlPrefixes.routePath + 'dynamic-map-service-layer',
                templateUrl: urlPrefixes.routeTemplateUrl + 'dynamic-map-service-layer.html',
                controller: 'DynamicMapServiceLayerCtrl'
            }
        }, {
            toc: {
                title: 'Legend',
                description: 'Show a legend for the map.',
                url: urlPrefixes.templateHref + 'legend'
            },
            route: {
                path: urlPrefixes.routePath + 'legend',
                templateUrl: urlPrefixes.routeTemplateUrl + 'legend.html',
                controller: 'LegendCtrl'
            }
        }, {
            toc: {
                title: 'Map Events',
                description: 'Shows how to listen for events raised by the map directive and get a direct reference to the map object.',
                url: urlPrefixes.templateHref + 'map-events'
            },
            route: {
                path: urlPrefixes.routePath + 'map-events',
                templateUrl: urlPrefixes.routeTemplateUrl + 'map-events.html',
                controller: 'MapEventsCtrl'
            }
        }, {
            toc: {
                title: 'Registry Pattern',
                description: 'Shows how to get a reference to the map object by using the registry.',
                url: urlPrefixes.templateHref + 'registry-pattern'
            },
            route: {
                path: urlPrefixes.routePath + 'registry-pattern',
                templateUrl: urlPrefixes.routeTemplateUrl + 'registry-pattern.html',
                controller: 'RegistryPatternCtrl'
            }
        }, {
            toc: {
                title: 'Additional Map Options',
                description: 'Shows how to load a map with additional map options.',
                url: urlPrefixes.templateHref + 'additional-map-options'
            },
            route: {
                path: urlPrefixes.routePath + 'additional-map-options',
                templateUrl: urlPrefixes.routeTemplateUrl + 'additional-map-options.html',
                controller: 'AdditionalMapOptionsCtrl'
            }
        }, {
            toc: {
                title: 'No Basemap',
                description: 'Shows how to load a map without a basemap using more complex map options such as a custom Extent and Popup.',
                url: urlPrefixes.templateHref + 'no-basemap'
            },
            route: {
                path: urlPrefixes.routePath + 'no-basemap',
                templateUrl: urlPrefixes.routeTemplateUrl + 'no-basemap.html',
                controller: 'NoBasemapCtrl'
            }
        }]
    };

    angular.module('esri-map-docs')
        .constant('appConfig', config);

})(angular);
