'use strict';

angular.module('esri-map-docs')
    .service('pathService', function() {
        return {
            getPathParts: function(path) {
                if (!path) {
                    return [];
                }
                return path.slice(path.indexOf('/') + 1).split('/');
            },

            // parse snippet include file locations from route
            getSnippetPaths: function(path) {
                var pathParts = this.getPathParts(path),
                    tabs,
                    page;
                if (pathParts.length === 0) {
                    return;
                }
                page = pathParts[0];
                if (!page) {
                    return;
                }
                if (page === 'examples' && pathParts.length > 1) {
                    tabs = [];
                    tabs.push('app/examples/' + pathParts[1] + '.html');
                    tabs.push('app/examples/' + pathParts[1] + '.js');
                    return tabs;
                }
            }

        };
    });
