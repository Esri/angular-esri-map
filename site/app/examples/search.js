angular.module('esri-map-docs')
    .controller('SearchCtrl', function(esriLoader, $scope) {
        var self = this;

        esriLoader.require([
            'esri/Map',
            'esri/widgets/Search',
            'esri/widgets/Search/SearchViewModel'
        ], function(Map, Search, SearchVM) {
            self.map = new Map({
                basemap: 'hybrid'
            });

            self.onViewCreated = function(view) {
                var searchWidget = new Search({
                    viewModel: new SearchVM({
                        view: view
                    })
                }, 'searchDiv');
                searchWidget.startup();

                // destroy the search widget when angular scope is also being destroyed
                $scope.$on('$destroy', function() {
                    searchWidget.destroy();
                });
            };
        });
    });
