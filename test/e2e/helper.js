var waitUntilElementIsReady = function(element) {
    browser.wait(function() {
        return element.isPresent();
    }, 5000);
    browser.wait(function() {
        return element.isDisplayed();
    }, 5000);
};

// helper for waiting on async map attributes to change
var getAsyncAttributeValue = function(element, attribute) {
    return browser.wait(function() {
        var deferred = protractor.promise.defer();
        // setting an artificial timeout to wait and hope
        // that an async map attribute such as "data-zoom" is different
        setTimeout(function() {
            element.getAttribute(attribute).then(function(value) {
                // resolve the deferred for both the browser.wait()
                // and to get outside access to the attribute value
                deferred.fulfill(value);
            });
        }, 2000);
        return deferred.promise;
    }, 5000);
};

var _getEsriViewElement = function(elementArrayFinder, deferred) {
    browser.wait(function() {
        // try to wait until there are 1 or more elements available (either a "esri-display-object" OR esri-view-surface")
        return elementArrayFinder.count().then(function(countValue) {
            return countValue > 0;
        });
    }, 5000).then(function() {
        // return the first DOM node (either a "esri-display-object" OR esri-view-surface")
        var firstElement = elementArrayFinder.first();
        deferred.fulfill(firstElement);
    });
};

// wait for map's "esri-display-object" in DOM to be ready (for a JSAPI 4.x MapView)
var getMapViewElement = function() {
    var deferred = protractor.promise.defer();
    var mapViewParent = element(by.tagName('esri-map-view')).all(by.css('.esri-display-object'));

    _getEsriViewElement(mapViewParent, deferred);

    return deferred.promise;
};

// wait for canvas in DOM to be ready (for a JSAPI 4.x SceneView)
var getSceneViewElement = function() {
    var deferred = protractor.promise.defer();
    var sceneViewParent = element(by.tagName('esri-scene-view')).all(by.tagName('canvas'));

    _getEsriViewElement(sceneViewParent, deferred);

    return deferred.promise;
};

module.exports = {
    waitUntilElementIsReady: waitUntilElementIsReady,
    getAsyncAttributeValue: getAsyncAttributeValue,
    getMapViewElement: getMapViewElement,
    getSceneViewElement: getSceneViewElement
};
