(function (angular) {
    'use strict';

    angular.module('esri.map').directive('esriBasemap', function () {
        // this object will tell angular how our directive behaves
        return {
            // only allow esriBasemap to be used as an element (<esri-identify-task>)
            restrict: 'E',

            // require the esriBasemap to have an esriMap controller
            // you can access these controllers in the link function
            require: ['^esriMap'],

            // replace this element with our template.
            // since we aren't declaring a template this essentially destroys the element
            replace: true,

            // now we can link our directive to the scope, but we can also add it to the map..
            link: function (scope, element, attrs, controllers) {
                // controllers is now an array of the controllers from the 'require' option
                var mapController = controllers[0];

                var urlArray = attrs.urls.split(",");
                
                mapController.Basemaps.push({ "urls": urlArray, "thumbnailUrl": attrs.thumbnailUrl, "title": attrs.title, "name": attrs.name });
            }
        };
    });

})(angular);
