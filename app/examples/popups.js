angular.module('esri-map-docs')
    .controller('PopupsCtrl', function(esriLoader) {
        var self = this;
        // load esri modules
        esriLoader.require([
            'esri/Map',
            'esri/PopupTemplate',
            'esri/layers/FeatureLayer'
        ], function(Map, PopupTemplate, FeatureLayer) {
            // create the map
            self.map = new Map({
                basemap: 'gray'
            });

            var template = new PopupTemplate({
                title: 'Marriage in NY, Zip Code: {ZIP}',
                content: '<p>As of 2015, <b>{MARRIEDRATE}%</b> of the population in this zip code is married.</p>' +
                    '<ul><li>{MARRIED_CY} people are married</li>' +
                    '<li>{NEVMARR_CY} have never married</li>' +
                    '<li>{DIVORCD_CY} are divorced</li><ul>',
                fieldInfos: [{
                    fieldName: 'MARRIED_CY',
                    format: {
                        digitSeparator: true, //Uses a comma separator in large numbers
                        places: 0 //sets the number of decimal places to 0 and rounds up
                    }
                }, {
                    fieldName: 'NEVMARR_CY',
                    format: {
                        digitSeparator: true,
                        places: 0
                    }
                }, {
                    fieldName: 'DIVORCD_CY',
                    format: {
                        digitSeparator: true,
                        places: 0
                    }
                }]
            });

            var featureLayer = new FeatureLayer({
                url: '//services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/NYCDemographics1/FeatureServer/0',
                outFields: ['*'],
                popupTemplate: template
            });

            self.map.add(featureLayer);

            self.onViewCreated = function(view) {
                self.mapView = view;
                console.log(view);
            };
        });
    });
