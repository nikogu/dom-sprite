var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

var browserify = require('browserify');
var fs = require('fs');

var b = browserify();
b.add('./src/index.js');

gulp.task('default', function() {
    gulp.watch('src/**/*.js', function(event) {
        b.bundle(function(err, buf) {
            fs.writeFile('./build/dom-sprite.js', buf.toString(), function (err) {
                if (err) throw err;
                console.log('Bundle!');
                gulp.src('build/dom-sprite.js').
                    pipe(uglify({
                        preserveComments: 'some'
                    })).
                    pipe(rename('dom-sprite.min.js')).
                    pipe(gulp.dest('build'));
            });
        });
    });
});

gulp.task('build', function() {
    b.bundle(function(err, buf) {
        fs.writeFile('./build/dom-sprite.js', buf.toString(), function (err) {
            if (err) throw err;
            console.log('Bundle!');
            gulp.src('build/dom-sprite.js').
                pipe(uglify({
                    preserveComments: 'some'
                })).
                pipe(rename('dom-sprite.min.js')).
                pipe(gulp.dest('build'));
        });
    });
});
