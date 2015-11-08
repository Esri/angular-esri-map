(function (angular) {
    'use strict';

    angular.module('esri.map').directive('esriInfoTemplate', function () {
        // this object will tell angular how our directive behaves
        return {
            // only allow esriInfoTemplate to be used as an element (<esri-feature-layer>)
            restrict: 'E',

            // require the esriInfoTemplate to have its own controller as well an esriMap controller
            // you can access these controllers in the link function
            require: ['?esriInfoTemplate', '?^esriDynamicMapServiceLayer', '?^esriFeatureLayer'],

            // replace this element with our template.
            // since we aren't declaring a template this essentially destroys the element
            replace: true,

            compile: function($element) {

                // get info template content from element inner HTML
                var content = $element.html();

                // clear element inner HTML
                $element.html('');

                // since we are using compile we need to return our linker function
                // the 'link' function handles how our directive responds to changes in $scope
                return function (scope, element, attrs, controllers) {
                    // controllers is now an array of the controllers from the 'require' option
                    // var templateController = controllers[0];
                    var dynamicMapServiceLayerController = controllers[1];
                    var featureLayerController = controllers[2];
                    
                    if (dynamicMapServiceLayerController) {
                        dynamicMapServiceLayerController.setInfoTemplate(attrs.layerId, {
                            title: attrs.title,
                            content: content
                        });
                    }
                    
                    if (featureLayerController) {
                        featureLayerController.setInfoTemplate({
                            title: attrs.title,
                            content: content
                        });
                    }
                };
            }
        };
    });

})(angular);
