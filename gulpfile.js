'use strict';

// Requirements
var gulp = require('gulp');
var shell = require('gulp-shell');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var jshint = require('gulp-jshint');
var notify = require('gulp-notify');
var del = require('del');
var autoprefixer = require('gulp-autoprefixer');
var mainBowerFiles = require('main-bower-files');
var gulpIgnore = require('gulp-ignore');
var exists = require('path-exists').sync;
var gutil = require('gulp-util');
var bowerMain = require('bower-main');
var notifier = require('node-notifier');
var debug = require('gulp-debug');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('gulp-browserify');
var debowerify = require('debowerify');

// Tasks
// IMPORTANT: Using the callback makes this synchronous, preventing random future fails
gulp.task('clean', function (cb) {
    return del('static/**/*');
});

gulp.task('css', function() {
    return gulp.src('./css/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({errLogToConsole: true}))
        .pipe(autoprefixer('last 3 version', '> 3%', 'ie 8', 'Safari >= 5'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./static/css'))
        .pipe(notify({message: 'CSS task complete!', onLast: true}));
});

gulp.task('bower', function() {
    // Copy minified js files
    gulp.src(bowerMain('js', 'min.js').minified, {base: './bower_components'})
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./static/js'));

    // Copy non-minified js that don't have minified versions
    // TODO: Minify these?
    gulp.src(mainBowerFiles(), {base: './bower_components'})
        .pipe(gulpIgnore.include(keepNonMinified))
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./static/js'));

    notifier.notify({title: 'Gulp notification', message: 'Bower task complete!'});
    gutil.log(gutil.colors.cyan('gulp-notify:'), '[',
        gutil.colors.blue('Gulp notification'), ']', gutil.colors.green('Bower task complete!'));
});

gulp.task('js', function() {
    return gulp.src('./js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
		.pipe(browserify({
			insertGlobals: false,
			debug: false,
			transform: ['debowerify']
		}))
        .pipe(gulp.dest('./static/js'))
        .pipe(notify({message: 'JS task complete!', onLast: true}));
});

gulp.task('html', function() {
    return gulp.src('./templates/**/*.html')
        .pipe(gulp.dest('./static/templates'))
        .pipe(notify({message: 'HTML task complete!', onLast: true}));
});

gulp.task('images', function() {
    return gulp.src('./images/**/*.{png,jpg,jpeg,gif,ico}')
        .pipe(gulp.dest('./static/images'))
        .pipe(notify({message: 'Images task complete!', onLast: true}));
});

/* Run Pipeline */
// Run clean first
gulp.task('default', function() {
    gulp.start('build');
});

// Run watch and clean before deploying files
gulp.task('build', ['watch', 'clean'], function() {
    gulp.start('deploy');
});

// Watch front end files for changes
gulp.task('watch', function() {
    gulp.watch('./src/static/css/*.scss', ['css']);
    gulp.watch('./src/static/js/*.js', ['js']);
    gulp.watch('./src/templates/*.html', ['html']);
    gulp.watch('./src/static/images/*.{png,jpg,jpeg,gif,ico}', ['images']);
});

// Deploy all files then finally run the python server
gulp.task('deploy', ['js', 'css', 'bower', 'html', 'images'], function() {
    gulp.start('django');
});

// Run build before starting Django
gulp.task('django', shell.task(['~/.virtualenvs/inspiro/bin/python manage.py runserver_plus']));

/* Random JS Functions */
// Determines if we should keep a non-minified JS file based on if a minified file exists
function keepNonMinified(file) {
	var keep = true;
	if(file.path.match('.js$')) {
		var minPath = file.path.replace('.js', '.min.js');
		keep = !exists(minPath);
	}
	return keep;
}