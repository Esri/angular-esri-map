(function(angular) {
    'use strict';

    angular.module('esri.map').directive('esriMap', function(esriMapUtils, esriRegistry) {

        return {
            // element only
            restrict: 'E',

            // isolate scope
            scope: {
                // two-way binding for center/zoom
                // because map pan/zoom can change these
                center: '=?',
                zoom: '=?',
                itemInfo: '=?',
                // one-way binding for other properties
                basemap: '@',
                // function binding for event handlers
                load: '&',
                extentChange: '&',
                // function binding for reading object hash from attribute string
                // or from scope object property
                // see Example 7 here: https://gist.github.com/CMCDragonkai/6282750
                mapOptions: '&'
            },

            controllerAs: 'mapCtrl',

            bindToController: true,

            // replace tag with div with same id
            compile: function($element, $attrs) {

                // remove the id attribute from the main element
                $element.removeAttr('id');

                // append a new div inside this element, this is where we will create our map
                $element.append('<div id=' + $attrs.id + '></div>');

                // since we are using compile we need to return our linker function
                // the 'link' function handles how our directive responds to changes in $scope
                return function(scope, element, attrs, controller) {

                    // get the map once it's loaded
                    controller.getMap().then(function(map) {

                        // update scope in response to map events and
                        // update map in response to changes in scope properties
                        esriMapUtils.bindMapEvents(scope, attrs, controller, map);

                    });

                };
            },

            // directive api
            controller: function($attrs) {

                var attrs = $attrs;

                // this deferred will be resolved with the map
                var mapPromise;

                // get map options from controller properties
                var mapOptions = esriMapUtils.getMapOptions(this);

                if (attrs.webmapId) {
                    // load map object from web map
                    mapPromise = esriMapUtils.createWebMap(attrs.webmapId, attrs.id, mapOptions, this);
                } else {
                    // create a new map object
                    mapPromise = esriMapUtils.createMap(attrs.id, mapOptions);
                }

                // add this map to the registry and get a
                // handle to deregister the map when it's destroyed
                if (attrs.registerAs) {
                    this.deregister = esriRegistry._register(attrs.registerAs, mapPromise);
                }

                // method returns the promise that will be resolved with the map
                this.getMap = function() {
                    return mapPromise;
                };

                // adds the layer, returns the promise that will be resolved with the result of map.addLayer
                this.addLayer = function(layer, index) {
                    // layer: valid JSAPI layer
                    // index: optional <Number>; likely only used internally by, for example, esriFeatureLayer
                    return this.getMap().then(function(map) {
                        return map.addLayer(layer, index);
                    });
                };

                // support removing layers, e.g. when esriFeatureLayer goes out of scope
                this.removeLayer = function (layer) {
                    return this.getMap().then(function (map) {
                        return map.removeLayer(layer);
                    });
                };

                // array to store layer info, needed for legend
                this.addLayerInfo = function(lyrInfo) {
                    if (!this.layerInfos) {
                        this.layerInfos = [lyrInfo];
                    } else {
                        this.layerInfos.unshift(lyrInfo);
                    }
                };
                this.getLayerInfos = function() {
                    return this.layerInfos;
                };
            }
        };
    });

})(angular);
