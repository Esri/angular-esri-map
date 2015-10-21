'use strict';

angular.module('esri-map-docs')
    .controller('DynamicMapServiceLayersCtrl', function($scope, esriLoader) {
        var _censusInfoContent = '<div class="demographicInfoContent">' +
            '<div class="demographicNumericPadding">${AGE_5_17:formatNumber}</div><div class="demographicInnerSpacing"></div>people ages 5 - 17<br>' +
            '<div class="demographicNumericPadding">${AGE_40_49:formatNumber}</div><div class="demographicInnerSpacing"></div>people ages 40 - 49<br>' +
            '<div class="demographicNumericPadding">${AGE_65_UP:formatNumber}</div><div class="demographicInnerSpacing"></div>people ages 65 and older' +
            '</div>';

        // functions used in popup templates must have a global scope
        window.formatNumber = function(value /*, key, data*/ ) {
            var searchText = '' + value;
            var formattedString = searchText.replace(/(\d)(?=(\d\d\d)+(?!\d))/gm, '$1,');
            return formattedString;
        };

        esriLoader.require([
            'esri/Color',
            'esri/dijit/Popup',
            'esri/symbols/SimpleFillSymbol',
            'esri/symbols/SimpleLineSymbol'
        ]).then(function(modules) {
            var Color = modules[0];
            var Popup = modules[1];
            var SimpleFillSymbol = modules[2];
            var SimpleLineSymbol = modules[3];

            var sfs = new SimpleFillSymbol(
                'solid',
                new SimpleLineSymbol('solid', new Color('#444444'), 3),
                new Color([68, 68, 68, 0.25]));

            var popup = new Popup({
                fillSymbol: sfs
            }, angular.element('<div></div>')[0]);

            $scope.map = {
                options: {
                    basemap: 'topo',
                    center: [-94.75290067627297, 39.034671990514816], // long, lat
                    zoom: 12,
                    sliderStyle: 'small',
                    infoWindow: popup
                }
            };
        });

        $scope.demographicsLayer = {
            url: 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer',
            options: {
                id: 'demographicsLayer',
                opacity: 0.8,
                showAttribution: false,
                infoTemplates: {
                    1: {
                        infoTemplate: {
                            title: '<b>Census Information</b>',
                            content: 'Demographics for:<br>Tract: ${TRACT:formatNumber} Blockgroup: ${BLKGRP}<br>' + _censusInfoContent
                        }
                    },
                    2: {
                        infoTemplate: {
                            title: '<b>Census Information</b>',
                            content: 'Demographics for:<br>${NAME}, ${STATE_NAME}<br>' + _censusInfoContent
                        }
                    }
                }
            }
        };
    });
