(function(angular) {
    'use strict';

    angular.module('esri.core').service('esriRegistry', function($q) {
        var registry = {};

        return {
            _register: function(name, promise) {
                // if there isn't a promise in the registry yet make one...
                // this is the case where a directive is nested higher then the controller
                // needing the instance
                if (!registry[name]) {
                    registry[name] = $q.defer();
                }

                var instance = registry[name];

                // when the promise from the directive is rejected/resolved
                // reject/resolve the promise in the registry with the appropriate value
                promise.then(function(arg) {
                    instance.resolve(arg);
                    return arg;
                }, function(arg) {
                    instance.reject(arg);
                    return arg;
                });

                // return a function to "deregister" the promise
                // by deleting it from the registry
                return function() {
                    delete registry[name];
                };
            },

            get: function(name) {
                // is something is already in the registry return its promise ASAP
                // this is the case where you might want to get a registry item in an
                // event handler
                if (registry[name]) {
                    return registry[name].promise;
                }

                // if we dont already have a registry item create one. This covers the
                // case where the directive is nested inside the controler. The parent
                // controller will be executed and gets a promise that will be resolved
                // later when the item is registered
                var deferred = $q.defer();

                registry[name] = deferred;

                return deferred.promise;
            }
        };
    });

})(angular);
