var gulp        = require('gulp');
var useref      = require('gulp-useref');
var compressor  = require('node-minify');
var del         = require('del');
var runSequence = require('run-sequence')

var source      = './src';
var destination = './dist';

gulp.task('del', function(){
  return del([destination+'/*']);
});

gulp.task('cpy', function(){
  return gulp.src([source+'/**', '!'+source+'/js/client/*'])
  .pipe(gulp.dest(destination))
});

gulp.task('useref', function(){
  return gulp.src('src/*.html')
    .pipe(useref())
    .pipe(gulp.dest(destination))
});

gulp.task('minify', function(){
  compressor.minify({
    compressor: 'gcc',
    input:  destination + '/js/client/class.min.js',
    output: destination + '/js/client/class.min.js',
    callback: function (err, min) {}
  });
  compressor.minify({
    compressor: 'gcc',
    input:  destination + '/js/client/main.min.js',
    output: destination + '/js/client/main.min.js',
    callback: function (err, min) {}
  });
});

gulp.task('prod', function() {
    runSequence('del', 'cpy', 'useref', 'minify');
});

gulp.task('default', ['prod']);
