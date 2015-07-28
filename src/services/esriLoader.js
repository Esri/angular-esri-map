(function(angular) {
    'use strict';

    angular.module('esri.map', []);

    angular.module('esri.map').factory('esriLoader', function ($q) {
        return function (moduleName, callback) {
            var deferred = $q.defer();
            if (angular.isString(moduleName)) {
                require([moduleName], function (module) {
                    if (callback !== null && callback !== undefined) {
                        callback(module);
                    }

                    deferred.resolve(module);
                });
            }
            else if (angular.isArray(moduleName)) {
                require(moduleName, function () {
                    if (callback !== null && callback !== undefined) {
                        callback.apply(this, arguments);
                    }

                    deferred.resolve(arguments);
                });
            }
            else {
                deferred.reject('An Array<String> or String is required to load modules.');
            }
            return deferred.promise;
        };
    });

})(angular);
