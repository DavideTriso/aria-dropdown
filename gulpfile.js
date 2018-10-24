//Require packages
var gulp = require('gulp'),
  sass = require('gulp-ruby-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  cssnano = require('gulp-cssnano'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  notify = require('gulp-notify');

//SCSS -> CSS
//Compile SCSS and save compiled + minified CSS file to 'dist' folder
gulp.task('scssDist', function (done) {
  sass('src/scss/*.scss', { style: 'expanded' }).pipe(autoprefixer('last 5 version')).pipe(gulp.dest('dist')).pipe(rename({ suffix: '.min' })).pipe(cssnano()).pipe(gulp.dest('dist')).pipe(notify({ message: 'scssDist task complete' }));
  done();
});

//Save a copy of compiled CSS in 'docs' folder
gulp.task('scssDocs', function (done) {
  sass('src/scss/*.scss', { style: 'expanded' }).pipe(autoprefixer('last 5 version')).pipe(gulp.dest('docs')).pipe(rename({ suffix: '.min' })).pipe(notify({ message: 'scssDocs task complete' }));
  done();
});

//JS -> JS + MIN.JS
//Put a copy and a minified version of JS file in 'dist' folder
gulp.task('jsDist', function (done) {
  gulp.src('src/js/*.js').pipe(gulp.dest('dist')).pipe(rename({ suffix: '.min' })).pipe(uglify()).pipe(gulp.dest('dist')).pipe(notify({ message: 'jsDist task complete' }));
  done();
});

//Put a copy of JS file in 'docs' folder
gulp.task('jsDocs', function (done) {
  gulp.src('src/js/*.js').pipe(gulp.dest('docs')).pipe(notify({ message: 'jsDocs task complete' }));
  done();
});


//HTML -> HTML
//Put a copy of HTML file to 'dist' folder
gulp.task('htmlDist', function (done) {
  gulp.src('src/html/*.html').pipe(gulp.dest('dist')).pipe(notify({ message: 'htmlDist task complete' }));
  done();
});


//WATCH TASKS
gulp.task('watchScss', function () {
  gulp.watch('src/scss/**/*.scss', gulp.parallel('scssDocs', 'scssDist'));
});

gulp.task('watchJS', function () {
  gulp.watch('src/js/*.js', gulp.series('jsDocs', 'jsDist'));
});

gulp.task('watchHTML', function () {
  gulp.watch('src/html/*.html', gulp.series('htmlDocs'));
});

gulp.task('watchAll', function () {
  gulp.watch('src/js/*.js', gulp.parallel('jsDist', 'jsDocs'));
  gulp.watch('src/scss/**/*.scss', gulp.parallel('scssDist', 'scssDocs'));
  gulp.watch('src/html/*.html', gulp.parallel('htmlDist'));
});
