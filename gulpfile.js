/*eslint-env node*/
/*eslint indent:0*/
'use strict';
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var stripDebug = require('gulp-strip-debug');
var runSequence = require('run-sequence');
var gutil = require('gulp-util');
var browserSync = require('browser-sync');
var deploy = require('gulp-gh-pages');
var angularProtractor = require('gulp-angular-protractor');
var KarmaServer = require('karma').Server;

// source directives and services
var srcJsFiles = 'src/**/*.js';
var siteJsFiles = 'site/app/**/*.js';
var unitTestSpecFiles = 'test/unit/**/*.spec.js';

// lint source javascript files
gulp.task('lint', function() {
  return gulp.src([srcJsFiles, siteJsFiles])
    // eslint() attaches the lint output to the eslint property
    // of the file object so it can be used by other modules.
    .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failOnError last.
    .pipe(eslint.failOnError());
});

// clean built copies of javascript files
// from dist folder and site
gulp.task('clean', function() {
  return gulp.src(['dist', 'site/lib'])
    .pipe(clean({force: true}));
});

// concatenate and minify core javascript files
// and copy into dist folder and site
gulp.task('build-core-js', function() {
  return gulp.src([
    'src/core/esri.core.module.js',
    'src/core/esriLoader.js',
    'src/core/esriRegistry.js'])
    .pipe(ngAnnotate({single_quotes: true}))
    .pipe(concat('angular-esri-core.js'))
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest('site/lib'))
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(rename('angular-esri-core.min.js'))
    .pipe(gulp.dest('dist'))
    .on('error', gutil.log);
});

// concatenate and minify source javascript files
// and copy into dist folder and site
gulp.task('build-js', function() {
  return gulp.src([
    'src/core/esri.core.module.js',
    'src/core/esriLoader.js',
    'src/core/esriRegistry.js',
    'src/esri.map.module.js',
    'src/map/EsriHomeButtonController.js',
    'src/map/EsriMapViewController.js',
    'src/map/EsriSceneViewController.js',
    'src/map/EsriWebsceneSlidesController.js',
    'src/map/esriHomeButton.js',
    'src/map/esriMapView.js',
    'src/map/esriSceneView.js',
    'src/map/esriWebsceneSlides.js'])
    .pipe(ngAnnotate({single_quotes: true}))
    .pipe(concat('angular-esri-map.js'))
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest('site/lib'))
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(rename('angular-esri-map.min.js'))
    .pipe(gulp.dest('dist'))
    .on('error', gutil.log);
});

// lint then clean and build javascript
gulp.task('build', function(callback) {
  runSequence('lint', 'clean', 'build-core-js', 'build-js', 'ngdocs', callback);
});

// serve site and tests on local web server
// and reload anytime source code or site are modified
gulp.task('serve', ['karma-once', 'build'], function() {
  browserSync({
    server: {
      baseDir: ['site', 'test', 'ngdocs']
    },
    open: true,
    port: 9002,
    https: true,
    notify: false
  });

  gulp.watch([srcJsFiles, './site/**.*.html', siteJsFiles, './site/styles/*.css'], ['build', browserSync.reload ]);
  gulp.watch([srcJsFiles, unitTestSpecFiles ], [ 'karma-once' ]);
  gulp.watch(['./site/docs-resources/**'], ['ngdocs', browserSync.reload ]);
});

// serve tests on local web server
gulp.task('serve-test', ['build'], function() {
  browserSync({
    server: {
      baseDir: 'test',
      routes: {
        '/lib': 'site/lib'
      }
    },
    open: false,
    port: 9002,
    notify: false
  });
});

// deploy to github pages
gulp.task('deploy', ['build'], function () {
  return gulp.src(['./site/**/*', 'ngdocs/**/*', './test/**/*', '!./test/unit/coverage/**/*'])
    .pipe(deploy());
});

// deploy to Esri's github pages
gulp.task('deploy-prod', ['build'], function () {
  return gulp.src(['./site/**/*', 'ngdocs/**/*', './test/**/*', '!./test/unit/coverage/**/*'])
    .pipe(deploy({
      remoteUrl: 'https://github.com/Esri/angular-esri-map.git'
    }));
});

gulp.task('karma-once', function(done) {
  new KarmaServer({
    configFile: __dirname + '/test/unit/karma.conf.js',
    singleRun: true,
    browsers: ['PhantomJS']
  }, done).start();
});

gulp.task('karma-coverage', function(done) {
  new KarmaServer({
    configFile: __dirname + '/test/unit/karma.conf.js',
    singleRun: true,
    reporters: ['progress', 'coverage'],
    preprocessors: {
      '../../src/**/*.js': ['coverage']
    }
  }, done).start();
});

gulp.task('karma', function(done) {
  new KarmaServer({
    configFile: __dirname + '/test/unit/karma.conf.js'
  }, done).start();
});

// TODO: run functional tests once we've written some
// for now just running karma coverage
gulp.task('test', ['karma-coverage', 'serve-test'], function() {
  return gulp.src(['./test/e2e/specs/*.js'])
    .pipe(angularProtractor({
      'configFile': 'test/e2e/conf.js',
      'args': ['--baseUrl', 'http://localhost:9002'],
      'autoStartStopServer': true,
      'debug': false
    }))
    .on('end', function() {
      browserSync.exit();
    })
    .on('error', function(e) {
      browserSync.exit();
      gutil.log(e);
    });
});

gulp.task('ngdocs', [], function () {
  var gulpDocs = require('gulp-ngdocs');
  return gulpDocs.sections({
      api: {
        glob: [
          'src/**/*.js', // source files
          'site/docs-resources/**/*.ngdoc' // documentation landing page
        ],
        api: true,
        title: 'API'
      }
    })
    .pipe(gulpDocs.process({
      title: 'angular-esri-map',
      html5Mode: false,
      navTemplate: 'site/docs-resources/docs-nav-template.html',
      styles: ['site/docs-resources/docs-main.css']
    }))
    .pipe(gulp.dest('ngdocs/docs'));
});

// Default Task
gulp.task('default', ['serve']);
