angular.module('esri-map-docs')
    .controller('WebSceneSlidesAsDirectiveCtrl', function(esriLoader, browserDetectionService) {
        var self = this;
        self.slides = [];
        self.sceneView = null;

        // load esri modules
        esriLoader.require([
            'esri/portal/PortalItem',
            'esri/WebScene'
        ], function(PortalItem, WebScene) {
            // check that the device/browser can support WebGL
            //  by inspecting the userAgent and
            //  by handling the scene view directive's on-error
            self.showViewError = browserDetectionService.isMobile();
            self.onViewError = function() {
                self.showViewError = true;
            };
            
            // create a new WebScene
            var webScene = new WebScene({
                portalItem: new PortalItem({
                    id: '08974d4b5fcd446b8c8b1663783c5549'
                })
            });

            // establish the WebScene as the bound "map" property for the <esri-scene-view>
            self.map = webScene;

            // to be sure that the view is both created and loaded with all slides,
            //  perform additional logic in the view directive's load callback
            self.onViewLoaded = function(view) {
                self.sceneView = view;

                // assign slides array to controller property, which will update and set
                //  the required binding in the <esri-webscene-slides> directive
                self.slides = view.map.presentation.slides.toArray();
            };

            self.onSlideChange = function(slide) {
                // handle the on-slide-change callback
                //  by setting the scene view location to the slide's viewpoint
                self.sceneView.goTo(slide.viewpoint);
            };
        });
    });
