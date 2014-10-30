/*jshint node: true*/
'use strict';
module.exports = function (config) {

    config.set({
        basePath: '',
        // use karma's version of sinon, as the node version lacks the
        // http fakers
        frameworks: ['mocha', 'sinon'],
        files: [
            'node_modules/topojson/topojson.js',
            'node_modules/lodash/lodash.js',
            {pattern: 'test/fixtures/*', watched: false, included: false, served: true},
            './demos/lib/leaflet/leaflet.js',
            'dist/tangram-worker.debug.js',
            'dist/tangram.test.js'
        ],
        exclude: [  ],
        preprocessors: {  },
        reporters: ['progress'],
        port: 9876,
        colors: false,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['Chrome'],
        proxies: {
            '/': 'http://localhost:9876/base/dist/'
        },
        singleRun: false
    });

};
