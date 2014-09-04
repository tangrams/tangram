
module.exports = function (config) {
    'use strict';
    config.set({
        basePath: '',
        frameworks: ['mocha', 'sinon-chai', 'browserify'],
        files: ['test/**/*.js'],
        exclude: ['test/**/*_flymake.js'],
        preprocessors: {
            'test/**/*.js': ['browserify']
        },
        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: false
    });
};
