(function(angular) {
    'use strict';

    angular.module('esri.map').factory('esriLoader', function ($q) {
        return function(moduleName){
            var deferred = $q.defer();

            require([moduleName], function(module){
                if(module){
                    deferred.resolve(module);
                } else {
                    deferred.reject('Couldn\'t load ' + moduleName);
                }
            });

            return deferred.promise;
        };
    });

})(angular);