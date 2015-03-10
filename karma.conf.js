/*jshint node: true*/
'use strict';
module.exports = function (config) {

    var customLaunchers = {
        'SL_Firefox': {
            base: 'SauceLabs',
            platform: 'Windows 2012',
            browserName: 'firefox',
            version: '34',
            firefox_profile: {
                'webgl.force-enabled': true,
                'webgl.disable': false,
                'webgl.msaa-force': true
            }
        },
    };

    var browserList = Object.keys(customLaunchers);
    browserList.push('Chrome');

    config.set({
        basePath: '',
        frameworks: ['mocha', 'sinon'],
        files: [
            'node_modules/topojson/topojson.js',
            'node_modules/lodash/lodash.js',
            'node_modules/babel/browser-polyfill.js',

            { pattern: 'test/fixtures/*',
              watched: false,
              included: false,
              served: true },

            './demos/lib/leaflet/leaflet.js',
            'dist/tangram.debug.js',
            'dist/tangram.test.js'
        ],

        exclude: [  ],
        preprocessors: {  },
        reporters: ['progress'],
        port: 9876,
        colors: true,


        sauceLabs: {
            testName: 'Tangram test Suite',
            recordScreenshots: true,
            connectOptions: {
                port: 5757,
                logfile: 'sauce_connect.log'
            }
        },


        logLevel: config.LOG_INFO,
        autoWatch: false,
        customLaunchers: customLaunchers,
        browsers: browserList,

        proxies: {
            '/': 'http://localhost:9876/base/dist/'
        },

        singleRun: false

    });


};
