var gulp = require('gulp');
var gutil = require('gulp-util');

var baseSrcDir = './src/';
var baseDestDir = './build/';
var port = 9000;


gulp.task('default', ['watch', 'connect']);
gulp.task('build', ['jade', 'styles', 'jshint', 'scripts', 'images']);


/*
 * Watch - Watch files, trigger tasks when they are modified
 */

gulp.task('watch', ['build'], function () {
	gulp.watch('src/scss/**', ['styles']);
	gulp.watch('src/images/**', ['images']);
	gulp.watch('src/templates/**', ['jade']);
	gulp.watch('src/javascript/**', ['jshint', 'scripts']);
	// Note: The browserify task handles js recompiling with watchify
});


/*
 * Connect - Serve files, on a silver platter
 */

var connect = require('gulp-connect');

gulp.task('connect', function () {
	connect.server({
		root: [baseDestDir],
		port: port
	})
});


/*
* Scripts - Use Browserify to compile and move JavaScript
*/

var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var size = require('gulp-size');

var bundler = browserify(baseSrcDir+'javascript/app.js');

gulp.task('scripts', function(){
	return bundler.bundle()
		.pipe(source('app.js'))
		.pipe(buffer())
//		.pipe(uglify())
//		.pipe(size())
		.pipe(gulp.dest(baseDestDir + '/js'));
});


/*
* jshint - Ensure our JavaScript is pretty lookin
*/

var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

gulp.task('jshint', function(){
	gulp.src(baseSrcDir+'javascript/app.js')
	.pipe(jshint())
	.pipe(jshint.reporter(stylish));
});



/*
 * Images - Compress and move images
**/

var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');

gulp.task('images', function () {
	return gulp.src(baseSrcDir + 'images/**')
		.pipe(changed(baseSrcDir + 'images/**')) // Ignore unchanged files
		.pipe(imagemin()) // Optimize
		.pipe(gulp.dest(baseDestDir + 'images/'));
});



/*
* Compile / Move Jade (HTML)
* */

var jade = require('gulp-jade');

gulp.task('jade', function () {
	return gulp.src(baseSrcDir + 'templates/layouts/*.jade')
		.pipe(jade({
			pretty: true
		})).on('error', gutil.log)
		.pipe(gulp.dest(baseDestDir));
});



/*
* Fonts - Move font files
* */


gulp.task('fonts', function () {
	return gulp.src(baseSrcDir + 'fonts/*')
		.pipe(gulp.dest(baseDestDir));
});



/*
 * SASS - Compile and move sass
**/

var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var pixrem = require('gulp-pixrem');

gulp.task('styles', function () {
	return gulp.src([baseSrcDir + 'scss/app.scss', baseSrcDir + 'scss/ie8.scss'])
		.pipe(sass({
			outputStyle: 'expanded',
			errLogToConsole: true
		})).on('error', gutil.log)
		.pipe(sourcemaps.init())
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(pixrem())
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest(baseDestDir + 'css/'));
});
