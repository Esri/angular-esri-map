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

// source directives and services
var srcJsFiles = 'src/**/*.js';
var docsJsFiles = 'docs/app/**/*.js';

// lint source javascript files
gulp.task('lint', function() {
  return gulp.src([srcJsFiles, docsJsFiles])
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
// from dist folder and docs
gulp.task('clean', function() {
  return gulp.src(['dist', 'docs/lib'])
    .pipe(clean({force: true}));
});

// concatenate and minify core javascript files
// and copy into dist folder and docs
gulp.task('build-core-js', function() {
  return gulp.src([
    'src/core/esri.core.module.js',
    'src/core/esriLoader.js',
    'src/core/esriRegistry.js',
    'src/core/esriMapUtils.js',
    'src/core/esriLayerUtils.js'])
    .pipe(concat('angular-esri-core.js'))
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest('docs/lib'))
    .pipe(stripDebug())
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(rename('angular-esri-core.min.js'))
    .pipe(gulp.dest('dist'))
    .on('error', gutil.log);
});

// concatenate and minify source javascript files
// and copy into dist folder and docs
gulp.task('build-js', function() {
  return gulp.src([
    'src/core/esri.core.module.js',
    'src/core/esriLoader.js',
    'src/core/esriRegistry.js',
    'src/core/esriMapUtils.js',
    'src/core/esriLayerUtils.js',
    'src/esri.map.module.js',
    'src/map/EsriMapController.js',
    'src/map/esriMap.js',
    'src/map/esriLegend.js',
    'src/layers/EsriLayerControllerBase.js',
    'src/layers/EsriFeatureLayerController.js',
    'src/layers/esriFeatureLayer.js',
    'src/layers/EsriDynamicMapServiceLayerController.js',
    'src/layers/esriDynamicMapServiceLayer.js',
    'src/layers/esriInfoTemplate.js'])
    .pipe(concat('angular-esri-map.js'))
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest('docs/lib'))
    .pipe(stripDebug())
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(rename('angular-esri-map.min.js'))
    .pipe(gulp.dest('dist'))
    .on('error', gutil.log);
});

// lint then clean and build javascript
gulp.task('build', function(callback) {
  runSequence('lint', 'clean', 'build-core-js', 'build-js', callback);
});

// serve docs and tests on local web server
// and reload anytime source code or docs are modified
gulp.task('serve', ['build'], function() {
  browserSync({
    server: {
      baseDir: ['docs', 'test']
    },
    open: true,
    port: 9002,
    notify: false
  });

  gulp.watch([srcJsFiles,'./docs/**.*.html', docsJsFiles, './docs/styles/*.css'], ['build', browserSync.reload ]);
});

// serve tests on local web server
gulp.task('serve-test', ['build'], function() {
  browserSync({
    server: {
      baseDir: 'test',
      routes: {
        '/lib': 'docs/lib'
      }
    },
    open: false,
    port: 9002,
    notify: false
  });
});

// deploy to github pages
gulp.task('deploy', ['build'], function () {
  return gulp.src(['./docs/**/*', './test/**/*'])
    .pipe(deploy());
});

// deploy to Esri's github pages
gulp.task('deploy-prod', ['build'], function () {
  return gulp.src(['./docs/**/*', './test/**/*'])
    .pipe(deploy({
      remoteUrl: 'https://github.com/Esri/angular-esri-map.git'
    }));
});

gulp.task('test', ['serve-test'], function() {
  return gulp.src(['./test/e2e/specs/*.js'])
    .pipe(angularProtractor({
      'configFile': 'test/e2e/conf.js',
      'args': ['--baseUrl', 'http://localhost:9002'],
      'autoStartStopServer': true
      // 'debug': true
    }))
    .on('end', function() {
      browserSync.exit();
    })
    .on('error', function(e) {
      throw e;
    });
});

gulp.task('ngdocs', [], function () {
  var gulpDocs = require('gulp-ngdocs');
  return gulp.src('./src/**/*.js')
    .pipe(gulpDocs.process({
      title: 'angular-esri-map'
    }))
    .pipe(gulp.dest('./ngdocs_test'));
});

gulp.task('dgeni', function() {
  var Dgeni = require('dgeni');
  var dgeni = new Dgeni([require('./dgeni_test/dgeni-example')]);
  return dgeni.generate();
});

// Default Task
gulp.task('default', ['serve']);
