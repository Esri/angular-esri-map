angular-esri-map
================

[![Build Status](https://travis-ci.org/Esri/angular-esri-map.svg?branch=master)](https://travis-ci.org/Esri/angular-esri-map)

A collection of directives to help you use Esri maps and services in your AngularJS v1.x applications.

These directives can be used as-is if your mapping needs are simple, or as reference examples of the patterns that you can use to write your own directives that use the ArcGIS API for JavaScript. [Read more...](http://esri.github.io/angular-esri-map/#/about)

## Table of Contents

- [Getting Started](#getting-started)
  - [Quick Start](#quick-start)
  - [Lazy Loading of the ArcGIS API for JavaScript](#lazy-loading-of-the-arcgis-api-for-javascript)
- [Dependencies](#dependencies)
- [Resources](#resources)
- [What about Angular 2?](#what-about-angular-2)
- [What about Ionic?](#what-about-ionic)
- [Issues](#issues)
- [Contributing](#contributing)
- [Development Instructions](#development-instructions)
- [Licensing](#licensing)

## Getting Started

Here are [examples and guides](http://esri.github.io/angular-esri-map/) showing how you can use this module to bring Esri maps into your own AngularJS v1.x applications.

### Quick Start

To use these directives in your own AngularJS v1.x application, first install the module as a dependency using any of the following methods.

```html
<!-- load angular-esri-map from CDN -->
<script src="https://unpkg.com/angular-esri-map@2"></script>
```

```bash
# OR install via bower
bower install angular-esri-map

# OR install via npm
npm install angular-esri-map
```

Alternatively, you can clone or [download](https://github.com/Esri/angular-esri-map/releases) this repo and copy the desired module file (`angular-esri-map.js` or `angular-esri-map.min.js`) into your application.

Once you've added the module to your application, you can refer the sample code below to use the `<esri-scene-view>` directive. If you have downloaded or installed locally, point to the location of the module file in your environment (instead of CDN) and load the page in a browser.

![App](https://raw.github.com/Esri/angular-esri-map/master/angular-esri-map.png)

```html
<!DOCTYPE html>
<html ng-app="esri-map-example">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">

        <title>AngularJS Esri Quick Start</title>

        <link rel="stylesheet" href="https://js.arcgis.com/4.3/esri/css/main.css">
        <style type="text/css">
            html, body, .esri-view {
                padding: 0;
                margin: 0;
                height: 100%;
                width: 100%;
            }
        </style>
    </head>
    <body ng-controller="MapController as vm">
        <esri-scene-view map="vm.map" view-options="{scale: 50000000, center: [-101.17, 21.78]}">
        </esri-scene-view>

        <!-- load Esri JSAPI -->
        <script src="https://js.arcgis.com/4.3/"></script>
        <!-- load AngularJS -->
        <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.2/angular.js"></script>
        <!-- load angular-esri-map -->
        <script src="https://unpkg.com/angular-esri-map@2"></script>

        <script>
            angular.module('esri-map-example', ['esri.map'])
                .controller('MapController', function(esriLoader) {
                    var self = this;
                    esriLoader.require(['esri/Map'], function(Map) {
                        self.map = new Map({
                            basemap: 'streets'
                        });
                    });
                });
        </script>
    </body>
</html>
```

See the documentation for [examples and guides](http://esri.github.io/angular-esri-map) of how to use the other directives and services.

### Lazy Loading of the ArcGIS API for JavaScript

If your application only shows a map under certain conditions you may want to lazy load the ArcGIS API for JavaScript. You can do this by calling the `esriLoader.bootstrap()` method. See the [Lazy Load Patterns page](http://esri.github.io/angular-esri-map/#/patterns/lazy-load) for an example of how to do this.

## Dependencies

At version 1.x, these directives and services require, at a minimum, AngularJS v1.3.0 and the ArcGIS API for JavaScript v3.12 (though most will work and are tested on v3.11).

For version 2.x, the ArcGIS API for JavaScript v4.0 is required.

See the compatibility table below for details.

angular-esri-map | AngularJS | ArcGIS API for JavaScript | Notes
--- | --- | --- | ---
v1.0.0 | v1.3 - v1.5 | [v3.12+](https://developers.arcgis.com/javascript/3/) | Test coverage included for AngularJS v1.3.
v1.1.0 | v1.3 - v1.5 | [v3.15+](https://developers.arcgis.com/javascript/3/) |
v1.1.8 | v1.3+ | [v3.15+](https://developers.arcgis.com/javascript/3/) | Due to a breaking change in controllers at AngularJS v1.6, e2e test coverage has been performed with v1.3, but will only continue with v1.6. See [CHANGELOG](https://github.com/Esri/angular-esri-map/blob/v1.x/CHANGELOG.md#v118).
v2.0.0 | v1.3 - v1.5 | [v4.0+](https://developers.arcgis.com/javascript/) | Test coverage included for AngularJS v1.3.
v2.0.2 | v1.3+ | [v4.0+](https://developers.arcgis.com/javascript/) | Due to a breaking change in controllers at AngularJS v1.6, e2e test coverage has been performed with v1.3, but will only continue with v1.6. See [CHANGELOG](https://github.com/Esri/angular-esri-map/blob/master/CHANGELOG.md#v202).

## Resources

**Websites**
* [AngularJS v1.x](https://angularjs.org/)
* [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/)
* [ArcGIS for Developers](http://developers.arcgis.com)
* [ArcGIS REST API](http://resources.arcgis.com/en/help/arcgis-rest-api/)
* [@Esri](http://twitter.com/esri)

**Presentations**
* [Declarative Mapping Applications with AngularJS and the ArcGIS API for JavaScript](http://proceedings.esri.com/library/userconf/devsummit16/papers/dev_int_193.pdf), Esri 2016 International Developer Summit
* [ArcGIS API for JavaScript and AngularJS: What's New, What's Next](http://jwasilgeo.github.io/esri-jsapi-and-angular-whats-next-dev-summit-2016), Esri 2016 International Developer Summit

## What about Angular 2?

While **angular-esri-map** focuses on providing well tested directives and patterns to help you use Esri maps with AngularJS v1.x, the ArcGIS API for JavaScript can also be used with [Angular 2](https://angular.io/). In addition to the [Angular 2 specific information](http://jwasilgeo.github.io/esri-jsapi-and-angular-whats-next-dev-summit-2016/#/34) discussed in the [2016 "What's New, What's Next" presentation](http://jwasilgeo.github.io/esri-jsapi-and-angular-whats-next-dev-summit-2016) provided above, there are several resources available to inspire you to try out Esri+Angular 2.

* [Esri/esri-system-js](https://github.com/Esri/esri-system-js): Load ArcGIS API for JavaScript modules using SystemJS
* [jwasilgeo/angular2-esri-playground](https://github.com/jwasilgeo/angular2-esri-playground): Example app using the ArcGIS API for JavaScript v4 with Angular 2 loaded via esri-system-js
* [tomwayson/angular2-esri-example](https://github.com/tomwayson/angular2-esri-example): Example app using the ArcGIS API for JavaScript v3 with Angular 2 loaded via [Webpack](https://webpack.github.io/) based on [@lobsteropteryx](https://github.com/lobsteropteryx)’s (non-Angular-specific) [esri-webpack configuration](https://github.com/lobsteropteryx/esri-webpack).

## What about Ionic?

Ionic is a mobile-ready implementation of Angular that is built on top of Cordova/PhoneGap. The coding patterns shown above can also be used with Ionic.

* [jwasilgeo/ionic-esri-map](https://github.com/jwasilgeo/ionic-esri-map): An Ionic1 app showing how to integrate a map using the angular-esri-map v1 pattern.
* [andygup/ionic2-esri-map](https://github.com/andygup/ionic2-esri-map): Example using ArcGIS API for JavaScript with Ionic2 using the angular2-esri-loader pattern with webpack.

## Issues

Find a bug or want to request a new feature? Please let us know by submitting an issue. Thank you!

## Contributing

Anyone and everyone is welcome to contribute. Please see our [guidelines for contributing](https://github.com/Esri/angular-esri-map/blob/master/CONTRIBUTING.md).

## Development Instructions

Make sure you have [Node](http://nodejs.org/) and [Gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md#getting-started) installed.

1. [Fork and clone this repo](https://help.github.com/articles/fork-a-repo)
2. `cd` into the `angular-esri-map` folder
3. Install the dependencies with `npm install`
4. run `gulp` from the command line. This will run the linting and build commands and then start a local web server hosting the application under the `docs` folder
5. Modify the source files (under `src`) and test pages (under `test`). Test pages are served along with the docs site when you run the `gulp` task and are accessible from the root (i.e. `http://localhost:9002/simple-map.html`).
6. Make a [pull request](https://help.github.com/articles/creating-a-pull-request) to contribute your changes

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

A copy of the license is available in the repository's [license.txt](https://raw.github.com/Esri/angular-esri-map/master/LICENSE) file.

[](Esri Tags: ArcGIS Web Mapping Angular Framework)
[](Esri Language: JavaScript)
