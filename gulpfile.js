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

var allJsFiles = 'src/**/*.js';

gulp.task('lint', function() {
  return gulp.src(allJsFiles)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('clean', function() {
  return gulp.src('dist')
    .pipe(clean({force: true}));
});



gulp.task('build-js', function() {
  return gulp.src(['src/directives/esriMap.js',
    'src/directives/esriFeatureLayer.js',
    'src/directives/esriLegend.js'])
    .pipe(concat('angular-esri-map.js'))
    .pipe(gulp.dest('dist'))
    .pipe(stripDebug())
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(rename('angular-esri-map.min.js'))
    .pipe(gulp.dest('app/scripts'))
    .on('error', gutil.log);
});

gulp.task('build', function(callback) {
  runSequence('lint', 'clean', 'build-js', callback);
});

// Watch Files For Changes
// gulp.task('watch', function() {
//     gulp.watch(allJsFiles, ['build']);
// });

gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: 'app',
      directory: false
    },
    open: true,
    port: 9002,
    notify: false
  });

  gulp.watch(['./app/scripts/**/*.*','./app/*.html','./app/styles/*.css'], ['build', browserSync.reload ]);
});


// Default Task
//gulp.task('default', ['build', 'serve']);
