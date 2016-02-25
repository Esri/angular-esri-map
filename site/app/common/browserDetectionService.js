'use strict';

angular.module('esri-map-docs')
    .service('browserDetectionService', function() {
        return {
            isMobile: function() {
                return /Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile/i.test(navigator.userAgent);
            }
        };
    });
