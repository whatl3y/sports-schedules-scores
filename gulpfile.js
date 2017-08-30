const gulp = require('gulp')
const babel = require('gulp-babel')
const plumber = require('gulp-plumber')
// const replace = require('gulp-replace')
// const sourcemaps = require('gulp-sourcemaps')
// const uglify = require('gulp-uglify')

gulp.task('config', function() {
  return gulp.src("./src/config.js")
    .pipe(babel())
    .pipe(gulp.dest("./"))
})

gulp.task('libs-dev', function() {
  return gulp.src("./src/libs/**/*.js")
    .pipe(babel())
    .pipe(gulp.dest("./libs"))
})

gulp.task('libs-prod', function() {
  return gulp.src("./src/libs/**/*.js")
    // .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(babel())
    // .pipe(uglify().on('error', console.log))
    // .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest("./libs"))
})

gulp.task('bin-dev', function() {
  return gulp.src("./src/bin/*.js")
    .pipe(babel())
    .pipe(gulp.dest("./bin"))
})

gulp.task('bin-prod', function() {
  return gulp.src("./src/bin/*.js")
    // .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(babel())
    // .pipe(uglify().on('error', console.log))
    // .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest("./bin"))
})

gulp.task('routes-dev', function() {
  return gulp.src("./src/routes/**/*.js")
    .pipe(babel())
    .pipe(gulp.dest("./routes"))
})

gulp.task('routes-prod', function() {
  return gulp.src("./src/routes/**/*.js")
    // .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(babel())
    // .pipe(uglify().on('error', console.log))
    // .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest("./routes"))
})

gulp.task('tasks-dev', function() {
  return gulp.src("./src/tasks/**/*.js")
    .pipe(babel())
    .pipe(gulp.dest("./tasks"))
})

gulp.task('tasks-prod', function() {
  return gulp.src("./src/tasks/**/*.js")
    // .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(babel())
    // .pipe(uglify().on('error', console.log))
    // .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest("./tasks"))
})

gulp.task('prep-dev', ['config', 'libs-dev', 'bin-dev', 'routes-dev', 'tasks-dev'], function() {})
gulp.task('prep-prod', ['config', 'libs-prod', 'bin-prod', 'routes-prod', 'tasks-prod'], function() {})
