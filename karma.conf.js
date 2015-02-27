// Karma configuration
// Generated on Thu Feb 05 2015 11:23:41 GMT+0100 (CET)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'commonjs', 'sinon', 'es5-shim'],


    // list of files / patterns to load in the browser
    files: [
        { pattern: 'node_modules/osync/index.js', included: 'false' },
        { pattern: 'node_modules/osync/**/!(test)/!(*test).js', included: 'false' },
        { pattern: 'node_modules/bussi/**/**/!(*test).js', included: 'false' },
        { pattern: 'node_modules/es6-shim/*.js', included: 'true' },
        { pattern: 'node_modules/unexpected/unexpected.js', watched: 'false', served:  'true', included: 'false' },
         'src/**/*.js',
         'test/**/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'node_modules/es6-shim/*.js': ['commonjs'],
        'node_modules/bussi/**/*.js': ['commonjs'],
        'node_modules/osync/**/*.js': ['commonjs'],
        'src/**/*.js': ['commonjs'],
        'test/**/*.js': ['commonjs'],
        'node_modules/unexpected/unexpected.js': ['commonjs']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
