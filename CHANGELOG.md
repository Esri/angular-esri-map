# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Upcoming changes][unreleased]

## [v2.0.3]

esriLoader defaults to loading JSAPI v4.3. Docs site uses JSAPI v4.3.

## [v2.0.2]

### Changed

esriLoader defaults to loading JSAPI v4.2. Docs site uses JSAPI v4.2. [#317](https://github.com/Esri/angular-esri-map/issues/317)

Added support for Angular v1.6.0 and greater due to Angular's breaking changes with pre-assigning bindings on controller instances. [#314](https://github.com/Esri/angular-esri-map/issues/314)

### Maintenance

Various npm package.json dev dependency versions were updated to support `gulp test`.

Updated e2e test pages to use Angular v1.6.1. Docs site uses Angular v1.6.1. [#314](https://github.com/Esri/angular-esri-map/issues/314) [#319](https://github.com/Esri/angular-esri-map/issues/319)

## [v2.0.1]

## Changed

esriLoader defaults to loading JSAPI v4.1. Docs site uses JSAPI v4.1. [#305](https://github.com/Esri/angular-esri-map/issues/305)

### Documentation

Added new patterns page, test page, and e2e functional test for developing custom Angular factories that can load and manage the state of Esri modules. [#287](https://github.com/Esri/angular-esri-map/issues/287)

Documentation site examples, patterns, and API pages were updated to have more links back to Esri docs and more consistency among module naming conventions. [#290](https://github.com/Esri/angular-esri-map/issues/290)

README and documentation site home page were updated with information about integrating Esri with Angular 2. [#285](https://github.com/Esri/angular-esri-map/issues/285)

Fixed PopupTemplate `<ul>` formatting in docs sample page since the official Esri JSAPI sample was also fixed at JSAPI v4.1. [#299](https://github.com/Esri/angular-esri-map/issues/299)

## [v2.0.0]

### Maintenance

Unminified dist files adhere to strict dependecy injection (DI). Note that minified dist files already had strict DI. [#269](https://github.com/Esri/angular-esri-map/issues/269)

Angular dependencies (^1.3.0) declared for package.json (`npm install`) and bower.json (`bower install`). [#275](https://github.com/Esri/angular-esri-map/issues/275)

Source code, test pages, unit tests, and e2e tests were updated for the Esri JSAPI 4.0 release. The `<esri-home-button>` directive was given a new bound property (`view-ui-position`) to be able to specify its position in a MapView or SceneView. [#282](https://github.com/Esri/angular-esri-map/pull/282)

### Documentation

Documentation site examples and patterns pages were updated for the Esri JSAPI 4.0 release. [#282](https://github.com/Esri/angular-esri-map/pull/282)

Updated documentation site and README quick start to use Angular v1.5.5. [#282](https://github.com/Esri/angular-esri-map/issues/282)

Added popups example page to documentation site. [#211](https://github.com/Esri/angular-esri-map/issues/211)

Removed ng-router autoscroll from examples since it is not needed as a temp workaround with Esri JSAPI 4.0 release. [#235](https://github.com/Esri/angular-esri-map/issues/235)

Added README links to Dev Summit 2016 presentation slides.

## [v2.0.0-beta.2]

### Added

Added `on-error` event for view directives, and site uses this to show warning in unsupported (mobile) browsers [#242](https://github.com/Esri/angular-esri-map/pull/242)

Property binding patterns page [#238](https://github.com/Esri/angular-esri-map/pull/238)

Added esri-webscene-slides directive and related test, example, and patterns pages [#254](https://github.com/Esri/angular-esri-map/pull/254)

Added esriRegistry service and related test, example, and patterns documentation. [#256](https://github.com/Esri/angular-esri-map/pull/256)

### Support

Docs site is more mobile friendly [#245](https://github.com/Esri/angular-esri-map/pull/245) and shows error message when mobile browsers don't have required support for WebGL [#250](https://github.com/Esri/angular-esri-map/pull/250).

Updated quick start in README to include instructions for CDN [#252](https://github.com/Esri/angular-esri-map/pull/252).

## [v2.0.0-beta.1]

### Changed

Refactored to support JSAPI v4.0+. [#198](https://github.com/Esri/angular-esri-map/pull/198) [#206](https://github.com/Esri/angular-esri-map/pull/206) [#220](https://github.com/Esri/angular-esri-map/pull/220) [#221](https://github.com/Esri/angular-esri-map/pull/221)

### Support

Added/updated example and test pages to show how to use this with JSAPI v4.0+. [#198](https://github.com/Esri/angular-esri-map/pull/198) [#207](https://github.com/Esri/angular-esri-map/pull/207) [#210](https://github.com/Esri/angular-esri-map/pull/210) [#230](https://github.com/Esri/angular-esri-map/pull/230)

Updated examples site and README example to use Angular v1.5.0. [#228](https://github.com/Esri/angular-esri-map/issues/228)

Docs show dismissable warning about version with link to previous. [#237](https://github.com/Esri/angular-esri-map/issues/237)

## [v1.1.0]

### Added

Added new esriVectorTileLayer directive along with associated documentation and example page. [#182](https://github.com/Esri/angular-esri-map/pull/182) [#173](https://github.com/Esri/angular-esri-map/pull/173) [@snodnipper](https://github.com/snodnipper)

### Documentation

Modified/updated example page for the esriVectorTileLayer directive. [#177](https://github.com/Esri/angular-esri-map/issues/177)

### Tests

Added unit and functional tests for new vector tile layer directive [#183](https://github.com/Esri/angular-esri-map/issues/183), [#184](https://github.com/Esri/angular-esri-map/issues/184)

## [v1.0.1]

### Changed

esriLoader defaults to loading JSAPI using the same protocol (HTTP or HTTPS) as the page. [#179](https://github.com/Esri/angular-esri-map/issues/179)

### Documentation

Use protocol agnostic links to resouces [#179](https://github.com/Esri/angular-esri-map/issues/179) [@JamesMilnerUK](https://github.com/JamesMilnerUK)

### Tests

Use protocol agnostic links to resouces in test pages [#179](https://github.com/Esri/angular-esri-map/issues/179)

## [v1.0.0]

### Changed
esriLoader defaults to loading JSAPI v3.15. Docs site uses JSAPI v3.15 and Angular v1.4.8. [#166](https://github.com/Esri/angular-esri-map/pull/166)

### Documentation

Use calcite for docs pages [#77](https://github.com/Esri/angular-esri-map/issues/77), [#170](https://github.com/Esri/angular-esri-map/issues/170)

Added a left nav to examples page [#98](https://github.com/Esri/angular-esri-map/issues/98)

Replaced About page with a Patterns section [#155](https://github.com/Esri/angular-esri-map/issues/155)

## [v1.0.0-rc.2]

### Changed

Replaced unnecessary references to Angular helper functions in services and controllers with vanilla JavaScript. [#164](https://github.com/Esri/angular-esri-map/pull/164)

esriLoader tests for existence of global `require()` function instead of global `esri` namespace to determine if the JSAPI has been loaded. [#163](https://github.com/Esri/angular-esri-map/pull/163)

Added .npmignore so that dist files would be added when publishing to NPM. [#154](https://github.com/Esri/angular-esri-map/issues/154)

### Tests

Added config and hooks for Travis CI so tests will be run for pull requests. [#157](https://github.com/Esri/angular-esri-map/pull/157)

### Documentation

Added a home page and index pages for each module to the API docs [#159](https://github.com/Esri/angular-esri-map/pull/159)

## [v1.0.0-rc.1]

### Added

Added support for defining and using a custom basemap. [#121](https://github.com/Esri/angular-esri-map/pull/121)

### Changed

Fixed a bug causing the legend to not show after re-loading a route. [#129](https://github.com/Esri/angular-esri-map/pull/129)

Map directive no longer creates an InfoWindow from map options infoWindow property. [#116](https://github.com/Esri/angular-esri-map/pull/116)

Update map and layer directives to use controllerAs and bindToController instead of injecting $socpe into controllers. [#123](https://github.com/Esri/angular-esri-map/pull/123)

Refactored shared code out of directives and into controllers and services. [#108](https://github.com/Esri/angular-esri-map/issues/108)

Moved services out of the esri.map module and into an esri.core module that can be used stand-alone. [#69](https://github.com/Esri/angular-esri-map/issues/69)

### Documentation

Added additional example pages for dynamic map services and custom basemap. [#124](https://github.com/Esri/angular-esri-map/issues/124)

Added an API section to the documentation pages generated by ngDocs. [#99](https://github.com/Esri/angular-esri-map/issues/99)

### Tests

Added additional e2e tests for dynamic map services and legend. [#115](https://github.com/Esri/angular-esri-map/issues/115) and [#139](https://github.com/Esri/angular-esri-map/issues/139)

Added unit tests for esri.core services using Karma [#30](https://github.com/Esri/angular-esri-map/issues/30) and [#146](https://github.com/Esri/angular-esri-map/issues/146)

Replaced jshint with eslint for automated linting and code style enforcement [#138](https://github.com/Esri/angular-esri-map/issues/138)

## [v1.0.0-beta.5]

### Added

Geographic center coordinates are normalized prior to updating esriMap scope values [#93](https://github.com/Esri/angular-esri-map/issues/93)

Add or remove layers from the map programatically [#51](https://github.com/Esri/angular-esri-map/pull/51) [@eas604](https://github.com/eas604)

The feature layer directive now includes optional attributes for opacity, definition expression, and constructor options. Opacity and definition expression act just like the visible attribute, and are watched for changes and can be adjusted at any time. [#51](https://github.com/Esri/angular-esri-map/pull/51) [@eas604](https://github.com/eas604) [#97](https://github.com/Esri/angular-esri-map/issues/97) and [#100](https://github.com/Esri/angular-esri-map/issues/100)

The feature layer directive also now includes optional attributes for the layer's load and update-end events. [#103](https://github.com/Esri/angular-esri-map/issues/103)

Added a directive for dynamic map service layers. Like the feature layer directive, it has optional attributes for visibility, opacity and constructor options. [#52](https://github.com/Esri/angular-esri-map/issues/52) [@Kollibri](https://github.com/Kollibri)

Added a directive to set the info template(s) for layers so that they show a popup when clicked. [#52](https://github.com/Esri/angular-esri-map/issues/52) [#118](https://github.com/Esri/angular-esri-map/issues/118) [@Kollibri](https://github.com/Kollibri)

### Changed

Map directive's `addLayer` accepts an optional index argument, and layers are now added to the esriMap and esriLegend in the order that they appear in the markup.
[#104](https://github.com/Esri/angular-esri-map/issues/104) and [#111](https://github.com/Esri/angular-esri-map/issues/111)

Legend directive now uses `$scope.$watchCollection` to watch `map.layerInfos` for changes and refresh the legend appropriately. [#52](https://github.com/Esri/angular-esri-map/issues/52) [@Kollibri](https://github.com/Kollibri)

### Documentation

Examples pages are now driven by configurable JSON and have more consistent titles [#94](https://github.com/Esri/angular-esri-map/pull/94)

Using `ng-options` for zoom level select Set Center and Zoom example page so that it has the correct value selected initially [c8659fce](https://github.com/Esri/angular-esri-map/commit/c8659fce94a94c5361a4cb047410b7cf0c4c87e4)

Feature-layers example now includes adjustable layer opacity, definition expression, and additional information on the esriFeatureLayer directive options [#97](https://github.com/Esri/angular-esri-map/issues/97) and [#100](https://github.com/Esri/angular-esri-map/issues/100).

Added an example page for the new dynamic map service layer. [c69329b9](https://github.com/Esri/angular-esri-map/commit/c69329b97ec0cd29d7aeb02a60f6691b2a525842)

Added an example page showing how to add/remove layers from a map. [061ed936](https://github.com/Esri/angular-esri-map/commit/061ed9368f9931bc3fc03b536366f0b53c294b5e)

Added an example page (feature-layer-events) showing how to interact with the esriFeatureLayer directive's attributes for layer load and update-end events. [#103](https://github.com/Esri/angular-esri-map/issues/103)

Added an example page (other-esri-modules) showing how to use other Esri modules that we have not included directives for (such as graphics, symbols, toolbars, etc.). [#106](https://github.com/Esri/angular-esri-map/issues/106)

### Tests

Added functional testing using [Protractor](https://angular.github.io/protractor/#/). [#82](https://github.com/Esri/angular-esri-map/pull/82), [#94](https://github.com/Esri/angular-esri-map/pull/94), [#112](https://github.com/Esri/angular-esri-map/pull/112)

### Maintenance

Published to NPM [#80](https://github.com/Esri/angular-esri-map/issues/80)

## [v1.0.0-beta.4]

### Added

* The esriMap directive's additional map options now support advanced options such as Extent and Popup. https://github.com/Esri/angular-esri-map/pull/71

### Changed

* The esriMap directive now reads additional map options by scope function binding, and these options are passed into the construction of a map from a webmapId. https://github.com/Esri/angular-esri-map/pull/71
* Changes to accommodate a thorough review of the map directive life cycle, and adjustments to make sure all properties are updated and events fired as expected. https://github.com/Esri/angular-esri-map/pull/76
* Several existing docs and test pages updated ([web map example](http://esri.github.io/angular-esri-map/#/examples/web-map) includes a legend).

### Fixed

* Additional Attributes Example Error: navigationMode must be 'css-transforms' or 'classic' [#65](https://github.com/Esri/angular-esri-map/issues/65)
* Load event now properly fires when using a web map. [#76](https://github.com/Esri/angular-esri-map/pull/76)

### New Demos

* [No Basemap](http://esri.github.io/angular-esri-map/#/examples/no-basemap) and [Additional Map Options](http://esri.github.io/angular-esri-map/#/examples/additional-map-options)

## [v0.0.1-beta.3]

### Added

* The esriLoader now takes a callback function to which it passes all loaded modules as arguments. https://github.com/Esri/angular-esri-map/pull/54
* Added support for a visible attribute on the esriFeatureLayer directive.
* Lazy loading of JSAPI and associated (minor) updates to esriLoader behavior. https://github.com/Esri/angular-esri-map/pull/60

### Changed

* Directives and services now support the following minimum dependency versions: JSAPI v3.11 and Angular v1.3.0. The test pages will be maintained at these versions.
* Docs site uses JSAPI v3.14 (#66) and Angular v1.4.4. https://github.com/Esri/angular-esri-map/pull/67

### Fixed

* Fixed script path (https://github.com/Esri/angular-esri-map/commit/6b4659c2d1d338ba752ddba8827f16fd12b4c330).

### New Demos

* [Deferred Map Example test page](http://esri.github.io/angular-esri-map/deferred-map.html)

Thank you to @willisd2, @ScottONeal, @thinking-aloud, and @jwasilgeo for their contributions and continued patience.

## [v0.0.1-beta.2]

### Added

* The esriLoader factory can accept an array of module names and return an array of modules (thanks @trkbrkr2000). https://github.com/Esri/angular-esri-map/pull/45
* The esriMap directive can accept additional map options (thanks @eas604). https://github.com/Esri/angular-esri-map/pull/39
* Docs site includes formatted code snippets.

### Changed

* Docs site uses JSAPI v3.13.

### Fixed

* Dojo loader multipleDefine in docs (thanks @niblicroad). https://github.com/Esri/angular-esri-map/pull/38
* esrilegend.js was not found in gulp, renamed to esriLegend.js (thanks @eas604) https://github.com/Esri/angular-esri-map/pull/40

### New Demos

* [Registry Pattern](http://esri.github.io/angular-esri-map/#/examples/registry-pattern)
* [Additional Map Options](http://esri.github.io/angular-esri-map/#/examples/additional-attributes)
  * _NOTE: This demo page address has changed after Beta 3 to [Additional Map Options](http://esri.github.io/angular-esri-map/#/examples/additional-map-options)_

## [v0.0.1-beta.1]

### Added

* Initial public release.
* Includes directives for map, features layers, and legend and services to facilitate loading Esri modules and enabling controllers to reference the map object.

[unreleased]: https://github.com/Esri/angular-esri-map/compare/v2.0.3...HEAD
[v2.0.3]: https://github.com/Esri/angular-esri-map/compare/v2.0.2...v2.0.3
[v2.0.2]: https://github.com/Esri/angular-esri-map/compare/v2.0.1...v2.0.2
[v2.0.1]: https://github.com/Esri/angular-esri-map/compare/v2.0.0...v2.0.1
[v2.0.0]: https://github.com/Esri/angular-esri-map/compare/v2.0.0-beta.2...v2.0.0
[v2.0.0-beta.2]: https://github.com/Esri/angular-esri-map/compare/v2.0.0-beta.1...v2.0.0-beta.2
[v2.0.0-beta.1]: https://github.com/Esri/angular-esri-map/compare/v1.1.0...v2.0.0-beta.1
[v1.1.0]: https://github.com/Esri/angular-esri-map/compare/v1.0.1...v1.1.0
[v1.0.1]: https://github.com/Esri/angular-esri-map/compare/v1.0.0...v1.0.1
[v1.0.0]: https://github.com/Esri/angular-esri-map/compare/v1.0.0-rc.2...v1.0.0
[v1.0.0-rc.2]: https://github.com/Esri/angular-esri-map/compare/v1.0.0-rc.1...v1.0.0-rc.2
[v1.0.0-rc.1]: https://github.com/Esri/angular-esri-map/compare/v1.0.0-beta.5...v1.0.0-rc.1
[v1.0.0-beta.5]: https://github.com/Esri/angular-esri-map/compare/v1.0.0-beta.4...v1.0.0-beta.5
[v1.0.0-beta.4]: https://github.com/Esri/angular-esri-map/compare/v0.0.1-beta.3...v1.0.0-beta.4
[v0.0.1-beta.3]: https://github.com/Esri/angular-esri-map/compare/v0.0.1-beta.2...v0.0.1-beta.3
[v0.0.1-beta.2]: https://github.com/Esri/angular-esri-map/compare/v0.0.1-beta.1...v0.0.1-beta.2
[v0.0.1-beta.1]: https://github.com/Esri/angular-esri-map/commits/v0.0.1-beta.1
