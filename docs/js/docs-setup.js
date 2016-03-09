NG_DOCS={
  "sections": {
    "api": "API"
  },
  "pages": [
    {
      "section": "api",
      "id": "index",
      "shortName": "index",
      "type": "overview",
      "moduleName": "index",
      "shortDescription": "API Documentation",
      "keywords": "api button core custom directives directly documentation elements esri includes map module overview reusable scene services ui view"
    },
    {
      "section": "api",
      "id": "esri.core",
      "shortName": "esri.core",
      "type": "overview",
      "moduleName": "esri.core",
      "shortDescription": "esri.core Module",
      "keywords": "api arcgis controllers core custom directives directly esri esriloader esriregistry factory includes instances lazy load loading map mapview module modules overview reference retrieve sceneview services store"
    },
    {
      "section": "api",
      "id": "esri.core.factory:esriLoader",
      "shortName": "esriLoader",
      "type": "service",
      "moduleName": "esri.core",
      "shortDescription": "Use esriLoader to lazyload the Esri ArcGIS API or to require API modules.",
      "keywords": "$q amd api arcgis array boolean bootstrap callback condition core defaults dojo esri esriloader event factory function isloaded javascript lazyload list load loaded loader loading loads loop module modules optional options promise race require resolved returns send service string style support"
    },
    {
      "section": "api",
      "id": "esri.core.factory:esriRegistry",
      "shortName": "esriRegistry",
      "type": "service",
      "moduleName": "esri.core",
      "shortDescription": "Use esriRegistry to store and retrieve MapView or SceneView instances for use in different controllers.",
      "keywords": "$q api attribute controllers core directive esri esrimapview esriregistry esrisceneview examples factory function info instance instances loaded map mapview pattern promise register register-as registered registry resolved retrieve returns sceneview service store style view"
    },
    {
      "section": "api",
      "id": "esri.map",
      "shortName": "esri.map",
      "type": "overview",
      "moduleName": "esri.map",
      "shortDescription": "esri.map Module",
      "keywords": "allows api button directive directives elements esri esrimapview esrisceneview includes map maps module overview place reusable scene ui view working"
    },
    {
      "section": "api",
      "id": "esri.map.controller:EsriHomeButtonController",
      "shortName": "EsriHomeButtonController",
      "type": "controller",
      "moduleName": "esri.map",
      "shortDescription": "Functions to help create HomeViewModel instances.",
      "keywords": "$q api clicked controller core create createviewmodel esri esrihomebutton executed factory function functions gohome help homeviewmodel instance instances jsapi map method object options promise property refers resolved returns set sets setview style view viewmodel wrapper"
    },
    {
      "section": "api",
      "id": "esri.map.controller:EsriMapViewController",
      "shortName": "EsriMapViewController",
      "type": "controller",
      "moduleName": "esri.map",
      "shortDescription": "Functions to help create MapView instances.",
      "keywords": "$element $q $scope api constructed controller core create esri event events execute executed exist factory function functions getmapview help instance instances load map mapview module object on-create on-error on-load optional promise property reference refers rejected resolved returns set setmap style view"
    },
    {
      "section": "api",
      "id": "esri.map.controller:EsriSceneViewController",
      "shortName": "EsriSceneViewController",
      "type": "controller",
      "moduleName": "esri.map",
      "shortDescription": "Functions to help create SceneView instances.",
      "keywords": "$element $q $scope api constructed controller core create esri event events execute executed exist factory function functions getsceneview help instance instances load map module object on-create on-error on-load optional options promise property reference refers rejected resolved returns sceneview set setmap sets style view webscene"
    },
    {
      "section": "api",
      "id": "esri.map.controller:EsriWebsceneSlidesController",
      "shortName": "EsriWebsceneSlidesController",
      "type": "controller",
      "moduleName": "esri.map",
      "shortDescription": "Functions to help create and manage individual slide properties and behaviors.",
      "keywords": "active api arcgis array assist associated behaviors bound callback clicked controller create css directive entry esri executed function functions help html https individual instance instances manage manipulating map method object on-slide-change onslideclick passes properties scene set sets setslides slide slides status styling template true view"
    },
    {
      "section": "api",
      "id": "esri.map.directive:esriHomeButton",
      "shortName": "esriHomeButton",
      "type": "directive",
      "moduleName": "esri.map",
      "shortDescription": "This is the directive which will create a home button using the Esri ArcGIS API for JavaScript.",
      "keywords": "api arcgis button create directive esri examples instance javascript map mapview sceneview view"
    },
    {
      "section": "api",
      "id": "esri.map.directive:esriMapView",
      "shortName": "esriMapView",
      "type": "directive",
      "moduleName": "esri.map",
      "shortDescription": "This is the directive which will create a map view using the Esri ArcGIS API for JavaScript.",
      "keywords": "additional api arcgis bound callback controllers core create creation defining directive esri esriregistry examples factory feature hash inline instance javascript layer loading map object on-create on-error on-load options parameters plenty register-as registering rejected search showing string successful tiles vector view view-options"
    },
    {
      "section": "api",
      "id": "esri.map.directive:esriSceneView",
      "shortName": "esriSceneView",
      "type": "directive",
      "moduleName": "esri.map",
      "shortDescription": "This is the directive which will create a scene view using the Esri ArcGIS API for JavaScript.",
      "keywords": "additional api arcgis basemap bound callback controllers core create creation defining directive elevation esri esriregistry example examples extrude factory hash inline instance javascript loading map object on-create on-error on-load options parameters plenty polygon register-as registering rejected scene showing string successful supported toggle view view-options webgl webscene"
    },
    {
      "section": "api",
      "id": "esri.map.directive:esriWebsceneSlides",
      "shortName": "esriWebsceneSlides",
      "type": "directive",
      "moduleName": "esri.map",
      "shortDescription": "This is the directive which will create slide bookmarks for WebScene Slides for the Esri ArcGIS API for JavaScript.",
      "keywords": "active active-slide api arcgis arrange array associated background-color black bookmark bookmarks border-color border-style border-width box box-shadow callback change class clicked clicking color conditional container create css cursor custom directive display div esri example examples function handling highlighted horizontally html https include individual inline-block instances javascript location map margin models names ng-class object on-slide-change outer-most padding pointer property provide provided rely scene screenshot selected set slide slides slides-container solid span styles styling supply thin title update view viewpoint webscene white widgets"
    }
  ],
  "apis": {
    "api": true
  },
  "__file": "_FAKE_DEST_/js/docs-setup.js",
  "__options": {
    "startPage": "/api",
    "scripts": [
      "js/angular.min.js",
      "js/angular-animate.min.js",
      "js/marked.js"
    ],
    "styles": [
      "css/site/docs-resources/docs-main.css"
    ],
    "title": "angular-esri-map",
    "html5Mode": false,
    "editExample": true,
    "navTemplate": "site/docs-resources/docs-nav-template.html",
    "navContent": "<ul class=\"nav pull-right\">\n    <li><a href=\"../\">Home</a></li>\n    <li><a href=\"../#/examples\">Examples</a></li>\n    <li><a href=\"../#/patterns\">Patterns</a></li>\n    <li role=\"presentation\"><a href=\"https://arcgis.github.io/angular-esri-map-site-v1/docs/#/api\">Previous Version (v1)</a>\n    <li><a href=\"https://github.com/Esri/angular-esri-map\">Github</a></li>\n</ul>\n",
    "navTemplateData": {},
    "loadDefaults": {
      "angular": true,
      "angularAnimate": true,
      "marked": true
    }
  },
  "html5Mode": false,
  "editExample": true,
  "startPage": "/api",
  "scripts": [
    "js/angular.min.js",
    "js/angular-animate.min.js",
    "js/marked.js"
  ]
};