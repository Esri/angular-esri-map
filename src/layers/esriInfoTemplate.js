(function (angular) {
    'use strict';

    /**
     * @ngdoc directive
     * @name esri.map.directive:esriInfoTemplate
     * @restrict E
     * @element
     *
     * @description
     * This directive creates an
     * {@link https://developers.arcgis.com/javascript/jsapi/infotemplate-amd.html InfoTemplate}
     * and binds it to a layer to provide "popup" information functionality when clicking on the visible layer in the map.
     * This directive **must** be placed within an esri-feature-layer directive or esri-dynamic-map-service-layer directive.
     * 
     * ## Examples
     * - {@link ../#/examples/dynamic-map-service-layers Multiple Dynamic Map Service Layers}
     *
     * <pre>
     *   <!-- The title is provided as an attribute parameter
     *   but the content is the entire inner HTML -->
     *
     *   <esri-info-template title="Parks">
     *      <span>${PARK_NAME}</span>
     *      <span>This park had ${TOTAL_VISITS_2014} visitors in 2014</span>
     *   </esri-info-template>
     * </pre>
     *
     * @param {String=} layer-id The layer id to which the InfoTemplate should be connected to.
     *  **Note:** This is only applicable when the parent directive is an esri-dynamic-map-service-layer.
     * @param {String=} title The title of the template.
     * @param {String | Node[]=} content **Note:** The content of the template is provided as inner HTML to this directive.
     * 
     */
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
