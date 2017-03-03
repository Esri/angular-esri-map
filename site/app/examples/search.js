angular.module('esri-map-docs')
    .controller('SearchCtrl', function(esriLoader, $scope) {
        var self = this;

        esriLoader.require([
            'esri/Map',
            'esri/widgets/Search'
        ], function(Map, Search) {
            self.map = new Map({
                basemap: 'streets-relief-vector'
            });

            self.onViewCreated = function(view) {
                var searchWidget = new Search({
                    view: view
                });

                // add the search widget to the top left corner of the view
                view.ui.add(searchWidget, {
                    position: 'top-left',
                    index: 0
                });

                // destroy the search widget when angular scope is also being destroyed
                $scope.$on('$destroy', function() {
                    searchWidget.destroy();
                });
            };
        });
    });
