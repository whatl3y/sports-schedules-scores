const gulp = require('gulp')
const babel = require('gulp-babel')
const nodemon = require('gulp-nodemon')
const plumber = require('gulp-plumber')
const sass = require('gulp-sass')

gulp.task('src', function () {
  return gulp
    .src('./src/**/*.js')
    .pipe(plumber())
    .pipe(babel())
    .pipe(gulp.dest('./dist'))
})

gulp.task('scss', function () {
  return gulp
    .src('./src/scss/**/*.{css,scss}')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/css'))
})

gulp.task('start', function (done) {
  const stream = nodemon({
    exec: 'npm run devServer',
    ext: 'js ts scss',
    tasks: ['build'],
    watch: ['src'],
    done: done,
  })

  stream.on('crash', function () {
    console.error('Application has crashed!\n')
    stream.emit('restart', 10) // restart the server in 10 seconds
  })
  return stream
})

gulp.task('build', gulp.parallel('src', 'scss'))
