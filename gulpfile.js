'use strict';

// Install: you must install gulp both globally *and* locally.
// Make sure you `$ npm install -g gulp`

/**
 * Dependencies
 */

var $ = require('gulp-load-plugins')({ lazy: true });
// var _ = require('lodash');

var psi = require('psi');
var del = require('del');

var gulp = require('gulp');
// var data = require('gulp-data');
// var path = require('path');
var gulpJade = require('gulp-jade');
var jade = require('jade');

var browserSync = require('browser-sync');
// var sass          = require('gulp-sass');
// +var filter       = require('gulp-filter');
var reload = browserSync.reload;
var pngquant = require('imagemin-pngquant');
var terminus = require('terminus');
var runSequence = require('run-sequence');

var istanbul = require('gulp-istanbul');
var mocha   = require('gulp-mocha');
var coveralls = require('gulp-coveralls');

var complexity = require('gulp-escomplex');
// var reporterJSON = require('gulp-escomplex-reporter-json');
var reporterHTML = require('gulp-escomplex-reporter-html');

var jscomplexity = require('jscomplexity');

var debug             = require('debug')('freecycle:gulpfile.js');       // https://github.com/visionmedia/debug
var gutil             = require('gulp-util');


/**
 * Check command line options
 */

/*
var minimist = require('minimist');

var knownOptions = {
  string: 'env',
  default: { env: process.env.NODE_ENV || 'production' }
};

var options = minimist(process.argv.slice(2), knownOptions);
debug ('options.env = ' + options.env.toString());
*/

/**
 * Banner
 */

var pkg = require('./package.json');
var banner = [
  '/**',
  ' *  gulp [optional command] [options]',
  ' *    Options: --env [development || production]',
  ' * ',
  ' *  Example: gulp test --env development',
  ' * ',  
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.licenses[0].type %>',
  ' */',
  ''
].join('\n');

// debug(banner);

/**
 * Paths
 */

var paths = {
  clean: [
    'public/js/**/*.js',
    'public/js/**/*.map',
    'public/js/**/*.min.js',
    'public/css/**/*.css',
    'public/css/**/*.min.css',
    '!public/js/main.js'            // ! not
  ],
  jade: [
    'views/**/*.jade'
  ],
  js: [
    // ============= Bootstrap  ================
    // Enable/disable as needed but only turn on
    // .js that is needed on *every* page. No bloat!
    // =========================================
    'public/lib/bootstrap/js/transition.js',
    'public/lib/bootstrap/js/alert.js',
    // 'public/lib/bootstrap/js/button.js',
    // 'public/lib/bootstrap/js/carousel.js',
    'public/lib/bootstrap/js/collapse.js',
    'public/lib/bootstrap/js/dropdown.js',
    // 'public/lib/bootstrap/js/modal.js',
    // 'public/lib/bootstrap/js/tooltip.js',
    // 'public/lib/bootstrap/js/popover.js',
    // 'public/lib/bootstrap/js/scrollspy.js',
    // 'public/lib/bootstrap/js/tab.js',
    // 'public/lib/bootstrap/js/affix.js'
    // =========================================
    'public/lib/fastclick/lib/fastclick.js',
    'public/lib/scrollreveal/scrollReveal.js',
    'views/js/scripts.js',
    'public/js/main.js'
  ],
  lint: [
    'config/**/*.js',
    'test/**/*.js',
    'controllers/**/*.js',
    'models/**/*.js',
    'app.js',
    'app_cluster.js',
    'gulpfile.js'
  ],
  less: [
    // 'less/**/*.less',
    'less/main.less',
    'less/page-api.less',
    'less/page-colors.less',
    'less/page-dashboard.less',
    'less/page-privacy.less',
    'less/page-react.less',
    'less/jf-hover.less',
    'less/x.less'
  ]
};

/**
 * Clean
 */

// Return the stream so that gulp knows the task is asynchronous
// and waits for it to terminate before starting dependent tasks.

// gulp.task('clean', function () {
//   return gulp.src(paths.clean, { read: false })
//     .pipe($.rimraf());
// });

gulp.task('clean', function (cb) {
  del(paths.clean, cb);
});


/**
 * Process CSS
 */

gulp.task('styles', function () {
  return gulp.src(paths.less)               // Read in Less files
    .pipe($.less({ strictMath: true }))     // Compile Less files
    .pipe($.autoprefixer({                  // Autoprefix for target browsers
      browsers: ['last 2 versions'],
      cascade: true
    }))
    .pipe($.csscomb())                      // Coding style formatter for CSS
    .pipe($.csslint('.csslintrc'))          // Lint CSS
    .pipe($.csslint.reporter())             // Report issues
    .pipe($.rename({ suffix: '.min' }))     // Add .min suffix
    .pipe($.csso())                         // Minify CSS
    .pipe($.header(banner, { pkg: pkg }))   // Add banner
    .pipe($.size({ title: 'CSS:' }))        // What size are we at?
    .pipe(gulp.dest('./public/css'))        // Save minified CSS

    // Reload the browser after any style changes
    .pipe(reload({ stream: true }));
  // .pipe($.livereload());                  // Initiate a reload
});

/**
 * Process Scripts
 */

gulp.task('scripts', function () {
  return gulp.src(paths.js)                 // Read .js files
    .on('error', console.log)
    .pipe($.concat(pkg.name + '.js'))       // Concatenate .js files
    .pipe(gulp.dest('./public/js'))         // Save main.js here
    .pipe($.rename({ suffix: '.min' }))     // Add .min suffix
    .pipe($.uglify({ outSourceMap: true })) // Minify the .js
    .pipe($.header(banner, { pkg: pkg }))   // Add banner
    .pipe($.size({ title: 'JS:' }))         // What size are we at?
    .pipe(gulp.dest('./public/js'))         // Save minified .js

    // Reload the browser after any script changes
    .pipe(reload({ stream: true }));
  // .pipe($.livereload());                  // Initiate a reload
});

/**
 * Process Images
 */

gulp.task('images', function () {
  return gulp.src('images/**/*')            // Read images
    .pipe($.changed('./public/img'))        // Only process new/changed
    .on('error', console.log)
    .pipe($.imagemin({                      // Compress images
      progressive: true,
      optimizationLevel: 3,
      interlaced: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('./public/img'));       // Write processed images
});

/**
 * JSHint Files
 */

gulp.task('lint', function () {
  return gulp.src(paths.lint)               // Read .js files
    .on('error', console.log)
    .pipe($.jshint())                       // lint .js files
    .pipe($.jshint.reporter('jshint-stylish'));
});

/**
 * JSCS Files
 */

gulp.task('jscs', function () {
  return gulp.src(paths.lint)               // Read .js files
    .pipe($.jscs())                         // jscs .js files
    .on('error', function (e) {
     /* $.gutil.log(e.message); */
      debug('JSCS Error: ' + e.message);                  
      $.jscs().end();
    })
    .pipe(terminus.devnull({ objectMode: true }));
});       

/**
 * Build Task
 *   - Build all the things...
 */

gulp.task('build', function (cb) {
  runSequence(
    'clean',                                // first clean
    ['lint', 'jscs'],                       // then lint and jscs in parallel
    ['styles', 'scripts', 'images'],        // etc.
    cb);
});

/**
 * Nodemon Task
 */

gulp.task('nodemon', ['build'], function (cb) {
  $.livereload.listen();
  var called = false;
  $.nodemon({
    script: 'app.js',
    verbose: false,
    env: { 'NODE_ENV': 'development', 'DEBUG': 'freecycle*,-socket.io-parser,-socket.*' },
    // nodeArgs: ['--debug']
    ext: 'js',
    ignore: [
      'gulpfile.js',
      'public/',
      'views/',
      'less/',
      'node_modules/'
    ]
  })
    .on('error', console.log)
    .on('start', function () {
      debug('Nodemon Gulp Task Start event triggered: 3000ms Timeout set.');
      setTimeout(function () {
        if (!called) {
          called = true;
          cb();
        }
      }, 3000);  // wait for start
    })
    .on('restart', function () {
      debug('Nodemon Gulp Task Restart event triggered: 3000ms Timeout set.');
      setTimeout(function () {
        $.livereload.changed('/');
      }, 3000);  // wait for restart
    });
});

gulp.task('jscomplexity', function (cb) {
  
  jscomplexity(paths.lint, { reporter: 'all' }, function(err, result){
    if(err) {
      return console.log(err);
    }
    console.log(result);
  });
  
  // jscomplexity() returns a promise (using bluebird)
  // jscomplexity(paths.lint, { reporter: 'all' }).then(console.log);
});

/* Reload task */
gulp.task('bs-reload', function () {
  browserSync.reload();
});

// BrowserSync
// Runs a BrowserSync proxy, will automatically open a new window
// to turn off the auto open, set `open` to false.
gulp.task('browser-sync', function () {
  debug ('Gulp task browser-sync executing.');

  browserSync({
    files: ['views/**/*.jade", "less/**/*.less'],

    port: '5000',
    proxy: 'localhost:3000',

    notify: false,
    open: false,
    // logLevel: "silent",
    logLevel: 'info',
    logConnections: true,
    logSnippet: false,
    logFileChanges: true,

    // Will not attempt to determine your network status, assumes you're ONLINE.
    online: true,

    // Will not attempt to determine your network status, assumes you're OFFLINE
    // online: false,

    watchOptions: {
      debounceDelay: 1000
    },

    // Open the site in Chrome & Firefox
    browser: ['google chrome']

    /*    proxy: {
     target: 'http://localhost:3000',
     middleware: function (req, res, next) {
     debug(req.url);
     next();
     },
     reqHeaders: function (config) {
     debug(config);
     return config;
     */
    /*        return {
    "host":            config.urlObj.host,
    "accept-encoding": "identity",
    "agent":           false
    }
    */
    //      }
    //    },
  });
});

/**
 * Open the browser
 */
// gulp.task('open', ['nodemon', 'browser-sync'], function () {
gulp.task('open', ['nodemon', 'browser-sync'], function () {
  var options = {
    url: 'http://localhost:5000/x'
  };
  // Specify a file or gulp will skip the task
  gulp.src('./public/favicon.ico')
  .pipe($.open('', options));
});

//
// Compile Jade files into HTML
// Using templates with data from data folder
//
gulp.task('compile-jade', function () {
  return gulp.src('public/**/*.jade')
    .pipe(gulpJade({
      jade: jade,
      pretty: true
    }))
    .pipe(gulp.dest('public/'))
    .pipe(browserSync.reload({ stream: true }));
});

/**
 * Important!!
 * Separate task for the reaction to `.jade` files
 */
gulp.task('jade-watch', ['compile-jade'], reload);

/**
 * Default Task
 */
gulp.task('default', ['open'], function () {
  gulp.watch(paths.less, ['styles']);
  gulp.watch(paths.js, ['scripts']);
  gulp.watch(paths.lint, ['lint', 'jscs']);
  gulp.watch(paths.jade, ['jade-watch']);
  // gulp.watch('views/**/*.jade').on('change', $.livereload.changed);
});

/**
 * Run PageSpeed Insights
 */

// When using this module for a production-level build process,
// registering for an API key from the Google Developer Console
// is recommended.

var site = 'freecycle-app.jit.su';

gulp.task('mobile', function (cb) {
  // output a formatted report to the terminal
  psi.output(site, {
    strategy: 'mobile',
    locale: 'en_US',
    threshold: 70
  }, cb);
});

gulp.task('desktop', ['mobile'], function (cb) {
  // output a formatted report to the terminal
  psi.output(site, {
    strategy: 'desktop',
    locale: 'en_US',
    threshold: 80
  }, cb);
});

gulp.task('pagespeed', ['desktop']);

gulp.task('test', function (cb) {
  gulp.src(paths.lint)
    .pipe(istanbul()) // Covering files
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on('finish', function () {
      gulp.src(['test/*.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports()) // Creating the reports after tests run
        .once('end', function () {
          process.exit(0);
        });          
        //.on('end', cb);           
    });
    exit(0);
});

gulp.task('sendcoverage', function (cb) {
  gulp.src('test/coverage/**/lcov.info')
    .pipe(coveralls());
});

gulp.task('complexity', function () {
  return gulp.src(paths.lint)
  .pipe(complexity())
  .pipe(reporterHTML())
  /* .pipe(reporterJSON()) */
  .pipe(gulp.dest("reports/complexity"));
});

gulp.task('mocha', function() {
    return gulp.src(['test/*.js'], { read: false })
    .pipe(mocha({
      reporter: 'spec'
    }))
    .on('error', gutil.log);
});


gulp.task('watch-mocha', function() {
    gulp.watch([paths.lint, 'test/**'], ['mocha']);
});

// var statics = {
//   my: 'statics',
//   foo: 'bar'
// };

/*
gulp.task('json-test', function() {
  return gulp.src('./examples/test1.jade')
    .pipe(data(function(file) {
      var json = require('./examples/' + path.basename(file.path) + '.json');
      var data = _.assign({}, json, statics);
      return data;
    }))
    .pipe(jade())
    .pipe(gulp.dest('build'));
});
*/
