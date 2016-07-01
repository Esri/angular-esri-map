(function(angular) {
    'use strict';

    /**
     * @ngdoc directive
     * @name esri.map.directive:esriWebsceneSlides
     * @restrict E
     * @element
     * @scope
     *
     * @description
     * This is the directive which will create slide bookmarks for
     * {@link https://developers.arcgis.com/javascript/latest/api-reference/esri-webscene-Slide.html WebScene Slides}
     * for the ArcGIS API for JavaScript.
     *
     * Each bookmark will include the title and screenshot of the slide, and clicking on a bookmark will
     * provide the slide object to a callback function (`on-slide-change`). For example, the slide provided
     * in the callback will have a viewpoint property that could be used to change the location of an associated Esri SceneView.
     *
     * **Note:** this directive does not rely on any out of the box Esri widgets or view models.
     * It demonstrates how a custom directive can be created and made to interact with other parts of the ArcGIS API for JavaScript.
     *
     * ## Styling and CSS
     * Use the following class names to supply styling to this directive:
     * - **`slides-container`**: outer-most container (`div`)
     * - **`slide`**: individual slide bookmark (`span`)
     * - **`active-slide`**: conditional class which is set by `ng-class` when an individual slide is clicked
     *
     * For example, to arrange slides horizontally and give a highlighted effect on the selected slide, the following styles could be used:
     * ```css
     * .slides-container {
     *     background-color: black;
     *     color: white;
     *     padding: 10px;
     * }
     * .slide {
     *     cursor: pointer;
     *     display: inline-block;
     *     margin: 0 10px;
     * }
     * .active-slide {
     *     box-shadow: 0 0 12px white;
     *     border-style: solid;
     *     border-width: thin;
     *     border-color: white;
     * }
     * ```
     *
     * ## Examples
     * - {@link ../#/examples/webscene-slides-as-directive WebScene Slides with Custom Directive}
     *
     * @param {Array} slides Array of {@link https://developers.arcgis.com/javascript/beta/api-reference/esri-webscene-Slide.html Slide} instances.
     * @param {Function=} on-slide-change Callback for handling a change in the active slide.
     *  It may be used, for example, to update the viewpoint location of an associated Esri SceneView.
     */
    angular.module('esri.map')
        .directive('esriWebsceneSlides', function esriWebsceneSlides() {
            return {
                // element only
                restrict: 'E',

                // isolate scope
                scope: {
                    slides: '=', // array of slides
                    onSlideChange: '&' // returns a slide property
                },

                template: [
                    '<div class="slides-container" ng-show="websceneSlidesCtrl.slides.length > 0">',
                    '   <span class="slide" ng-repeat="slide in websceneSlidesCtrl.slides" ng-click="websceneSlidesCtrl.onSlideClick(slide)">',
                    '       {{slide.title.text}}',
                    '       <br>',
                    '       <img src="{{slide.thumbnail.url}}" title="{{slide.title.text}}" ng-class="{\'active-slide\': slide.isActiveSlide}">',
                    '       <br>',
                    '   </span>',
                    '</div>'
                ].join(''),

                controllerAs: 'websceneSlidesCtrl',

                bindToController: true,

                // directive api
                controller: 'EsriWebsceneSlidesController',

                link: function websceneSlidesLink(scope, element, attrs, controller) {
                    scope.$watch('websceneSlidesCtrl.slides', function(newVal) {
                        // bound slides property can be updated at any time
                        //  and will most likely occur asynchronously after an Esri view is loaded
                        controller.setSlides(newVal);
                    });
                }
            };
        });
})(angular);
