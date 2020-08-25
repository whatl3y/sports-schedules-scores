const gulp = require('gulp')
const babel = require('gulp-babel')
const nodemon = require('gulp-nodemon')
const plumber = require('gulp-plumber')
const webpack = require('webpack-stream')
const webpackConfig = require('./webpack.config.js')

gulp.task('src', function () {
  return gulp
    .src('./src/server/**/*.js')
    .pipe(plumber())
    .pipe(babel())
    .pipe(gulp.dest('./dist'))
})

gulp.task('app', function () {
  return gulp
    .src('./src/app/**/*.js')
    .pipe(plumber())
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest('./public/js'))
})

gulp.task('start', function (done) {
  const stream = nodemon({
    exec: 'npm start',
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

gulp.task('build', gulp.parallel('src', 'app'))
