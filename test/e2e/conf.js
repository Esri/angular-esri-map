exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',

    specs: ['simple-map.js', 'set-basemap.js'],

    browserName: 'chrome',

    beforeLaunch: function() {
        // TODO: investigate if shared funcs can be added once to all specs here
    },

    onPrepare: function() {
        // TODO: investigate if shared funcs can be added once to all specs here
    }
};