(function(angular) {
    'use strict';

    angular.module('esri.map').directive('esriMap', function() {

        return {
            // element only
            restrict: 'E',

            // isolate scope
            scope: {
                // two-way binding for center/zoom
                // because map pan/zoom can change these
                center: '=?',
                zoom: '=?',
                itemInfo: '=?',
                // one-way binding for other properties
                basemap: '@',
                // function binding for event handlers
                load: '&',
                extentChange: '&',
                // function binding for reading object hash from attribute string
                // or from scope object property
                // see Example 7 here: https://gist.github.com/CMCDragonkai/6282750
                mapOptions: '&'
            },

            controllerAs: 'mapCtrl',

            bindToController: true,

            // replace tag with div with same id
            compile: function($element, $attrs) {

                // remove the id attribute from the main element
                $element.removeAttr('id');

                // append a new div inside this element, this is where we will create our map
                $element.append('<div id=' + $attrs.id + '></div>');

                // since we are using compile we need to return our linker function
                // the 'link' function handles how our directive responds to changes in $scope
                return function(scope, element, attrs, controller) {

                    // update scope in response to map events and
                    // update map in response to changes in scope properties
                    controller.bindMapEvents(scope, attrs);

                };
            },

            // directive api
            controller: 'esriMapController'
        };
    });

})(angular);
