angular.module('esri-map-docs')
    .controller('WebSceneSlidesCtrl', function(esriLoader, $scope) {
        var self = this;
        self.slides = [];
        self.sceneView = null;

        // load esri modules
        esriLoader.require([
            'esri/portal/PortalItem',
            'esri/WebScene'
        ], function(PortalItem, WebScene) {
            // create a new WebScene
            var webScene = new WebScene({
                portalItem: new PortalItem({
                    id: '51c67be4a5ea4da6948a40210ddfab1a'
                })
            });

            // establish the WebScene as the bound "map" property for the <esri-scene-view>
            $scope.$evalAsync(function() {
                self.map = webScene;
            });
        });

        self.onViewCreated = function(view) {
            // to be sure that the view is both created and loaded with all slides,
            //  perform additional logic in the promise callback
            view.then(function() {
                self.sceneView = view;

                self.slides = view.map.presentation.slides.getAll();
                // tack on an extra property for ng-class css styling
                self.slides.forEach(function(slide) {
                    slide.isActiveSlide = false;
                });

                // manually apply scope since we are outside of the Angular digest cycle
                $scope.$apply('exampleCtrl.slides');
            });
        };

        self.onSlideClick = function(slide) {
            self.slides.forEach(function(slide) {
                slide.isActiveSlide = false;
            });
            slide.isActiveSlide = true;
            slide.applyTo(self.sceneView);
        };
    });
