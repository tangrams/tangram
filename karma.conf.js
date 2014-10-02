/*jshint node: true*/
'use strict';
module.exports = function (config) {

    config.set({
        basePath: '',
        // use karma's version of sinon, as the node version lacks the
        // http fakers
        frameworks: ['mocha', 'sinon'],
        files: [
            'lib/topojson.js',
            'demos/lib/leaflet-0.8-dev.js',
            'dist/tangram-worker.debug.js',
            'dist/testable.js'
        ],
        exclude: [  ],
        preprocessors: {  },
        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['Chrome'],
        proxies: {
            '/dist/': 'http://localhost:9876/base/dist/'
        },
        singleRun: false
    });

};
