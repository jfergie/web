'use strict';

// Install: you must install gulp both globally *and* locally.
// Make sure you `$ npm install -g gulp`

/**
 * Dependencies
 */

var gulp = require('gulp');
var $ = require('gulp-load-plugins')({ lazy: true });
var terminus = require('terminus');

/**
 * Paths
 */

var paths = {
  lint: [
    'index.js',
    'test/**/*.js',
    'gulpfile.js'
  ],
};

/**
 * JSHint Files
 */

gulp.task('lint', function () {
  return gulp.src(paths.lint)               // Read .js files
    .pipe($.jshint())                       // lint .js files
    .pipe($.jshint.reporter('jshint-stylish'));    // Use stylish reporter
});

/**
 * JSCS Files
 */

gulp.task('jscs', function () {
  return gulp.src(paths.lint)               // Read .js files
    .pipe($.jscs())                         // jscs .js files
    .on('error', function (e) {
      $.util.log(e.message);
      $.jscs().end();
    })
    .pipe(terminus.devnull({ objectMode: true }));
});

/**
 * Default Task
 */

gulp.task('default', ['lint', 'jscs'], function () {
  gulp.watch(paths.lint, ['lint', 'jscs']);
});
