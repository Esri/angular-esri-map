'use strict';
var gulp = require('gulp');
var jshint = require('gulp-jshint');
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

// source directives and services
var srcJsFiles = 'src/**/*.js';

// lint source javascript files
gulp.task('lint', function() {
  return gulp.src(srcJsFiles)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// clean built copies of javascript files
// from dist folder and docs
gulp.task('clean', function() {
  return gulp.src(['dist', 'docs/lib'])
    .pipe(clean({force: true}));
});

// concatenate and minify source javascript files
// and copy into dist folder and docs
gulp.task('build-js', function() {
  return gulp.src([
    'src/services/esriLoader.js',
    'src/services/esriRegistry.js',
    'src/directives/esriMap.js',
    'src/directives/esriFeatureLayer.js',
    'src/directives/esriLegend.js'])
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
  runSequence('lint', 'clean', 'build-js', callback);
});

// serve docs on local web server
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

  gulp.watch([srcJsFiles,'./docs/**.*.html', './docs/app/**/*.js', './docs/styles/*.css'], ['build', browserSync.reload ]);
});

// deploy to github pages
gulp.task('deploy', ['build'], function () {
  return gulp.src('./docs/**/*')
    .pipe(deploy());
});

// deploy to Esri's github pages
gulp.task('deploy-prod', ['build'], function () {
  return gulp.src('./docs/**/*')
    .pipe(deploy({
      remoteUrl: 'https://github.com/Esri/angular-esri-map.git'
    }));
});

// Default Task
gulp.task('default', ['serve']);
