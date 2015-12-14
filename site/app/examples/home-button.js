angular.module('esri-map-docs')
    .controller('HomeButtonCtrl', function(esriLoader) {
        var self = this;
        // load esri modules
        esriLoader.require([
            'esri/Map',
            'esri/widgets/Home/HomeViewModel'
        ],
        function(
            Map, HomeVM
        ) {

            self.map = new Map({
                basemap: 'streets'
            });

            self.onViewCreated = function(view) {
                self.homeVM = new HomeVM({
                    view: view
                });
            };

            self.goHome = function() {
                if (self.viewModel) {
                    self.viewModel.goHome();
                }
            };

        });
    }).directive('myHomeButton', function myHomeButton() {
        return {
            // element only
            restrict: 'E',

            // isolate scope
            scope: {
                viewModel: '=?'
            },

            template: [
                '<div class="esri-home" role="presentation">',
                '  <div role="button" tabindex="0" class="esri-container">',
                '    <span aria-hidden="true" class="esri-icon esri-icon-home"></span>',
                '    <span class="esri-icon-font-fallback-text">Home</span>',
                '  </div>',
                '</div>'
            ].join(''),

            controllerAs: 'homeButtonCtrl',

            bindToController: true,

            // directive api
            controller: function MyHomeButtonController() {
                this.goHome = function() {
                    if (!this.viewModel) {
                        return;
                    }

                    this.viewModel.goHome();
                };
            },

            link: function myHomeButtonLink(scope, element, attrs, controller) {
                element.on('click', function() {
                    controller.goHome();
                });
            }
        };
    });
