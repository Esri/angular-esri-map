(function(angular) {
    'use strict';

    /**
     * @ngdoc controller
     * @name esri.map.controller:EsriWebsceneSlidesController
     *
     * @description
     * Functions to help create and manage individual slide properties and behaviors.
     */
    angular.module('esri.map')
        .controller('EsriWebsceneSlidesController', function EsriWebsceneSlidesController() {
            var self = this;
            
            /**
             * @ngdoc function
             * @name setSlides
             * @methodOf esri.map.controller:EsriWebsceneSlidesController
             *
             * @description
             * Set a an array of slides for the directive. Each slide will have its own entry in the template.
             *
             * @param {Array} slides Array of {@link https://developers.arcgis.com/javascript/beta/api-reference/esri-webscene-Slide.html Slide} instances.             
             *
             */
            this.setSlides = function(slides) {
                // tack on an extra property for ng-class css styling
                slides.forEach(function(slide) {
                    slide.isActiveSlide = false;
                });
            };

            /**
             * @ngdoc function
             * @name onSlideClick
             * @methodOf esri.map.controller:EsriWebsceneSlidesController
             *
             * @description
             * This method is executed when an individual slide is clicked.
             * It passes the slide object to the **`on-slide-change`** bound callback function,
             * which can be useful for manipulating an associated Esri SceneView.
             * It also sets the clicked slide's active status to true, to assist with CSS styling.
             *
             * @param {Object} slide slide instance
             */
            this.onSlideClick = function(slide) {
                // set isActiveSlide state on each slide to assist with CSS styling
                self.slides.forEach(function(slide) {
                    slide.isActiveSlide = false;
                });
                slide.isActiveSlide = true;

                // handle click action without direct reference to the ArcGIS API for JavaScript
                //  by passing the viewpoint of the slide to the onSlideChange function binding
                if (typeof self.onSlideChange === 'function') {
                    self.onSlideChange()(slide);
                }
            };
        });
})(angular);
