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
        }
    };

    var browserList = Object.keys(customLaunchers);
    browserList.push('Chrome');

    config.set({
        basePath: '',
        frameworks: ['browserify', 'mocha', 'sinon'],
        files: [
            'node_modules/lodash/lodash.js',
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.3/leaflet.js',
            {
                pattern : 'test/fixtures/*',
                watched : false,
                included : false,
                served : true
            },
            'dist/tangram.test.js',
            'test/**/*.js'
        ],

        exclude: [  ],
        preprocessors: {
            'test/**/*.js' : ['browserify']
        },
        browserify : {
            debug: true,
            transform: [['babelify', {optional : 'runtime'}], 'brfs']
        },

        plugins: [
            'karma-mocha',
            'karma-sinon',
            'karma-chrome-launcher',
            'karma-sauce-launcher',
            'karma-mocha-reporter',
            'karma-browserify'
        ],
        reporters: ['mocha'],

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
