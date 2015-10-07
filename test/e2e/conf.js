'use strict';

exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    framework: 'jasmine2',
    specs: ['specs/**.js'],
    capabilities: {
        browserName: 'chrome'
    }
};
