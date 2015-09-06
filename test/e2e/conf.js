exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',

    // TODO: how do we want to organize specs?
    specs: ['spec.js'],

    // TODO: which browsers need to be tested?
    multiCapabilities: [{
        browserName: 'chrome'
    }/*, {
        browserName: 'firefox'
    }*/]
};