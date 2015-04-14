angular-esri-map
================

A collection of directives to help you use Esri maps and services in your Angular applications.

These directives can be used as-is if your mapping needs are simple, or as reference examples of the patterns that you can use to write your own directives that use the ArcGIS API for JavaScript. [Read more...](http://esri.github.io/angular-esri-map/#/about)

## Getting started
Here are [a few examples](http://esri.github.io/angular-esri-map/) showing how you can use this module to bring Esri maps into your own Angular applications.

### Quick Start

To use these directives in your own Angular application, first install the module as a dependency using bower:

```bash
bower install angular-esri-map
```

Or clone or download this repo and copy the desired module file (`angular-esri-map.js` or `angular-esri-map.min.js`) into your application.

Once you've added the module to your application, you can use the sample code below to use the map and feature layer directives. Just change the paths to point to the locations of the libraries in your environment and go.

![App](https://raw.github.com/Esri/angular-esri-map/master/angular-esri-map.png)

```html
<!DOCTYPE html>
<html ng-app="esri-map-example">
    <head>
        <meta name="viewport" content="initial-scale=1.0, user-scalable=no">
        <meta charset="utf-8">

        <link rel="stylesheet" type="text/css" href="http://js.arcgis.com/3.13/esri/css/esri.css">
    </head>
    <body ng-controller="MapController">
    <esri-map id="map" center="map.center" zoom="map.zoom" basemap="topo">
        <esri-feature-layer url="http://services.arcgis.com/rOo16HdIMeOBI4Mb/arcgis/rest/services/Portland_Parks/FeatureServer/0"></esri-feature-layer>
        <esri-feature-layer url="http://services.arcgis.com/rOo16HdIMeOBI4Mb/arcgis/rest/services/Heritage_Trees_Portland/FeatureServer/0"></esri-feature-layer>
    </esri-map>
    <p>Lat: {{ map.center.lat | number:3 }}, Lng: {{ map.center.lng | number:3 }}, Zoom: {{map.zoom}}</p>
        <script type="text/javascript" src="http://js.arcgis.com/3.13compact"></script>
        <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular.js"></script>
        <script src="path/to/angular-esri-map.js"></script>
        <script type="text/javascript">
            angular.module('esri-map-example', ['esri.map'])
                .controller('MapController', function ($scope) {
                    $scope.map = {
                        center: {
                            lng: -122.676207,
                            lat: 45.523452
                        },
                        zoom: 12
                    };
                });
        </script>
    </body>
</html>
```

See the documentation for [examples](http://esri.github.io/angular-esri-map/#examples) of how to use the other directives.

## Development Instructions

Make sure you have [Node](http://nodejs.org/) and  [Gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md#getting-started) installed.

1. [Fork and clone this repo](https://help.github.com/articles/fork-a-repo)
2. `cd` into the `angular-esri-map` folder
3. Install the dependencies with `npm install`
4. run `gulp` from the command line. This will run the linting and build commands and then start a local web server hosting the application under the `docs` folder
5. Modify the directive source files (under `src`) or documentation (under `docs`) and your browser will automatically reload as you save your changes
6. Make a [pull request](https://help.github.com/articles/creating-a-pull-request) to contribute your changes

## Dependencies

These directives were built using Angular v1.2 (specifically 1.2.16) and the ArcGIS API for JavaScript v3.11+. They will likely work with other verstions of those frameworks, but have not been tested outside of the above versions.

You will need [Node](http://nodejs.org/) and [Gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md#getting-started) to do local development.

## Resources

* [Angular JS](https://angularjs.org/)
* [ArcGIS API for JavaScript](//js.arcgis.com)
* [ArcGIS for Developers](http://developers.arcgis.com)
* [ArcGIS REST API](http://resources.arcgis.com/en/help/arcgis-rest-api/)
* [Importing Data Into Feature Services](https://developers.arcgis.com/tools/csv-to-feature-service/)
* [@Esri](http://twitter.com/esri)

## Issues

Find a bug or want to request a new feature?  Please let us know by submitting an issue.  Thank you!

## Contributing

Anyone and everyone is welcome to contribute. Please see our [guidelines for contributing](https://github.com/esri/contributing).

## Licensing
Copyright 2014 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [license.txt]( https://raw.github.com/Esri/angular-esri-map/master/license.txt) file.

[](Esri Tags: ArcGIS Web Mapping Angular Framework)
[](Esri Language: JavaScript)
