# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
- The esriMap directive's additonal map options now support advanced options such as Extent and Popup. https://github.com/Esri/angular-esri-map/pull/71

### Changed
- The esriMap directive now reads additonal map options by scope function binding, and these options are passed into the construction of a map from a webmapId. https://github.com/Esri/angular-esri-map/pull/71
- Changes to accommodate a thorough review of the map directive life cycle, and adjustments to make sure all properties are updated and events fired as expected. https://github.com/Esri/angular-esri-map/pull/76
- Several existing docs and test pages updated.

### Fixed
- Load event now properly fires when using a web map. https://github.com/Esri/angular-esri-map/pull/76

### New Demos
- [No Basemap and Advanced Map Options](http://esri.github.io/angular-esri-map/#/examples/no-basemap)

## [Beta 3] - 2015-08-18

### Added
- The esriLoader now takes a callback function to which it passes all loaded modules as arguments. https://github.com/Esri/angular-esri-map/pull/54
- Added support for a visible attribute on the esriFeatureLayer directive.
- Lazy loading of JSAPI and associated (minor) updates to esriLoader behavior. https://github.com/Esri/angular-esri-map/pull/60

### Changed
- Docs site uses JSAPI v.3.14 (#66) and Angular v1.4.4. https://github.com/Esri/angular-esri-map/pull/67

### Fixed
- Fixed script path (https://github.com/Esri/angular-esri-map/commit/6b4659c2d1d338ba752ddba8827f16fd12b4c330).

### New Demos
- [Deferred Map Example test page](http://esri.github.io/angular-esri-map/deferred-map.html)

Thank you to @willisd2, @ScottONeal, @thinking-aloud, and @jwasil for their contributions and continued patience.

## [Beta 2] - 2015-04-14

### Added
- The esriLoader factory can accept an array of module names and return an array of modules (thanks @trkbrkr2000). https://github.com/Esri/angular-esri-map/pull/45
- The esriMap directive can accept additional map options (thanks @eas604). https://github.com/Esri/angular-esri-map/pull/39
- Docs site includes formatted code snippets.

### Changed
- Docs site uses JSAPI v3.13.

### Fixed
- Dojo loader multipleDefine in docs (thanks @niblicroad). https://github.com/Esri/angular-esri-map/pull/38
- esrilegend.js was not found in gulp, renamed to esriLegend.js (thanks @eas604) https://github.com/Esri/angular-esri-map/pull/40

### New Demos
- [Registry Pattern](http://esri.github.io/angular-esri-map/#/examples/registry-pattern)
- [Additional Map Options](http://esri.github.io/angular-esri-map/#/examples/additional-attributes)
  - _NOTE: This demo page address has changed after Beta 3 to [Additional Map Options](http://esri.github.io/angular-esri-map/#/examples/additional-map-options)_

## [Beta 1] - 2014-11-10
### Added
- Initial public release.
- Includes directives for map, features layers, and legend and services to facilitate loading Esri modules and enabling controllers to reference the map object.

[Unreleased]: https://github.com/Esri/angular-esri-map/compare/v0.0.1-beta.3...HEAD
[Beta 3]: https://github.com/Esri/angular-esri-map/compare/v0.0.1-beta.2...v0.0.1-beta.3
[Beta 2]: https://github.com/Esri/angular-esri-map/compare/v0.0.1-beta.1...v0.0.1-beta.2
[Beta 1]: https://github.com/Esri/angular-esri-map/commits/v0.0.1-beta.1
