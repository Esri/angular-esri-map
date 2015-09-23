(function (angular) {
    'use strict';

    angular.module('esri.map').directive('esriInfoTemplate', function () {
        // this object will tell angular how our directive behaves
        return {
            // only allow esriFeatureLayer to be used as an element (<esri-feature-layer>)
            restrict: 'E',

            // require the esriFeatureLayer to have its own controller as well an esriMap controller
            // you can access these controllers in the link function
            require: ['esriInfoTemplate', '^esriDynamicMapServiceLayer'],

            // replace this element with our template.
            // since we aren't declaring a template this essentially destroys the element
            replace: true,

            // define an interface for working with this directive
            controller: function (/*$scope, $element, $attrs*/) {
            },

            // now we can link our directive to the scope, but we can also add it to the map..
            link: function (scope, element, attrs, controllers) {
                // hide element
                element.addClass('hidden');
                // controllers is now an array of the controllers from the 'require' option
                // var templateController = controllers[0];
                var layerController = controllers[1];

                layerController.InfoTemplates.push({ layerIDs: attrs.layerIds, title: attrs.title, content: element.html() });

            }
        };
    });

})(angular);
