angular.module('esri-map-docs')
    .controller('WebSceneSlidesCtrl', function(esriLoader, browserDetectionService, $scope) {
        var self = this;
        self.slides = [];
        self.sceneView = null;

        // load esri modules
        esriLoader.require([
            'esri/portal/PortalItem',
            'esri/WebScene',
            'esri/webscene/Slide'
        ]).then(function(esriModules) {
            // check that the device/browser can support WebGL
            //  by inspecting the userAgent and
            //  by handling the scene view directive's on-error
            self.showViewError = browserDetectionService.isMobile();
            self.onViewError = function() {
                self.showViewError = true;
            };

            var PortalItem = esriModules[0];
            var WebScene = esriModules[1];
            var Slide = esriModules[2];

            // create a new WebScene
            var webScene = new WebScene({
                portalItem: new PortalItem({
                    id: '1c7a06421a314ac9b7d0fae22aa367fb'
                })
            });

            // establish the WebScene as the bound "map" property for the <esri-scene-view>
            self.map = webScene;

            // to be sure that the view is both created and loaded with all slides,
            //  perform additional logic in the view directive's load callback
            self.onViewLoaded = function(view) {
                self.sceneView = view;

                var createSlideDiv = document.getElementsByClassName('createSlideDiv')[0];
                var slidesDiv = document.getElementsByClassName('slidesDiv')[0];
                view.ui.add([createSlideDiv, slidesDiv], 'top-right');

                // presentation slides are in fact an "esri/core/Collection"
                // make a shallow copy as a new array object for angular scope
                self.slides = view.map.presentation.slides.toArray();
            };

            self.onSlideClick = function(slide) {
                // add and manage an extra property for ng-class css styling
                self.slides.forEach(function(slide) {
                    slide.isActiveSlide = false;
                });
                slide.isActiveSlide = true;

                // animate to the given slide's viewpoint and
                //  turn on its visible layers and basemap layers in the view
                slide.applyTo(self.sceneView);
            };

            // create a new slide using Slide.createFrom after clicking on the button
            self.onCreateClick = function() {
                Slide.createFrom(self.sceneView).then(function(slide) {
                    // set the slide title
                    slide.title.text = self.createSlideTitleInput;
                    // add the slide to the slides collection of the scene presentation
                    self.sceneView.map.presentation.slides.add(slide, 0);

                    // make a shallow copy as a new array object for angular scope
                    self.slides = self.sceneView.map.presentation.slides.toArray();
                    // apply angular scope since the Slide.createFrom callback is outside the digest cycle
                    $scope.$apply('WebSceneSlidesCtrl.slides');
                });
            };
        });
    });
