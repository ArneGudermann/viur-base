/* {{app_id}} GULP SCRIPT */

// Project data
var srcpaths = {
	less: './less/**/*.less',
	images: './images/**/*',
	icons: './icons/**/*',
};

var destpaths = {
	css: '../deploy/static/css',
	images: '../deploy/static/images',
	icons: '../deploy/html/icons'
};

// Variables and requirements
const gulp = require('gulp');

const path = require('path');
const del = require('del');
const rename = require('gulp-rename');

const less = require('gulp-less');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const zindex = require('postcss-zindex');
const focus = require('postcss-focus');
const nocomments = require('postcss-discard-comments');
const nano = require('gulp-cssnano');
const jmq = require('gulp-join-media-queries');
const stylefmt = require('gulp-stylefmt');

const imagemin = require('gulp-imagemin');
const cheerio = require('gulp-cheerio');

// clean destination folder: remove css files
gulp.task('clean', () =>
	del([
		destpaths.css + '/**/*',
		destpaths.images + '/**/*',
		destpaths.icons + '/**/*',
	], {force: true})
);

// compilation and postproduction of LESS to CSS
gulp.task('css', () =>
	gulp.src('./less/style.less')
		.pipe(less({
			paths: [path.join(__dirname, 'less', 'includes')]
		}))
		.pipe(postcss([
			autoprefixer({ // add vendor prefixes
				browsers: ['last 2 versions'],
				cascade: false
			}),
			nocomments, // discard comments
			focus, // add focus to hover-states
			zindex, // reduce z-index values
		])) // clean up css
		.pipe(jmq())
		.pipe(stylefmt()) // syntax formatting
		.pipe(gulp.dest(destpaths.css)) // save cleaned version
		.pipe(nano()) // minify css
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(destpaths.css)) // save minified version
);


// reduce images for web
gulp.task('images', () =>
	gulp.src(srcpaths.images)
		.pipe(imagemin([
			imagemin.jpegtran({progressive: true}),
			imagemin.optipng({optimizationLevel: 5}),
			imagemin.svgo({
				plugins: [
					{removeViewBox: false},
					{removeDimensions: true}
				]
			})
		]))
		.pipe(gulp.dest(destpaths.images))
);

// reduce icons for web
gulp.task('icons', () =>
	gulp.src(srcpaths.icons)
		.pipe(imagemin([
			imagemin.jpegtran({progressive: true}),
			imagemin.optipng({optimizationLevel: 5}),
			imagemin.svgo({
				plugins: [
					{removeViewBox: false},
					{removeDimensions: true}
				]
			})
		]))
		.pipe(cheerio({
			run: function ($, file) {
				$('style').remove()
				$('[id]').removeAttr('id')
				//$('[class]').removeAttr('class')
				$('[fill]').removeAttr('fill')
				$('svg').addClass('icon')
			},
			parserOptions: {xmlMode: true}
		}))
		.pipe(rename({prefix: 'icon-'}))
		.pipe(gulp.dest(destpaths.icons))
);


gulp.task('watch', () => {
	gulp.watch(srcpaths.less, gulp.series('css'));
	gulp.watch(srcpaths.icons, gulp.series('icons'));
	gulp.watch(srcpaths.images, gulp.series('images'));
});

gulp.task('default', gulp.series(['clean', 'css', 'images', 'icons']));
