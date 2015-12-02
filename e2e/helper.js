module.exports = {

    waitUntilElementIsReady: function(element) {
        browser.wait(function() {
            return element.isPresent();
        }, 5000);
        browser.wait(function() {
            return element.isDisplayed();
        }, 5000);
    },

    // helper for waiting on async map attributes to change
    getAsyncAttributeValue: function(element, attribute) {
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
    }
};
