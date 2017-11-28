const gulp = require('gulp')
const gulpsync = require('gulp-sync')(gulp)
const livereload = require('gulp-livereload')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const del = require('del')
const nunjucksRender = require('gulp-nunjucks-render')
const connect = require('gulp-connect-multi')
const proxy = require('gulp-connect-proxy')
const devServer = connect();
const url = require('url');

gulp.task('clean:build', function () {
  return del([
    './dist'
  ])
})

gulp.task('compile:nunjucks', function() {
  return gulp.src(['./src/templates/index.nunjucks'])
  .pipe(nunjucksRender({
      path: ['./src/templates/']
    }))
  .pipe(gulp.dest('./dist')).pipe(devServer.reload())
});

gulp.task('compile:scss', function () {
  return gulp.src('./src/styles/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('./dist/css')).pipe(devServer.reload())
})

gulp.task('move:images', function () {
  return gulp.src(['./src/images/**'])
    .pipe(gulp.dest('./dist/images'))
})

gulp.task('move:icons', function () {
  return gulp.src('./src/icons/**')
    .pipe(gulp.dest('./dist/css/icons'))
})

gulp.task('move:js', function () {
  return gulp.src(['src/scripts/**/*.js'])
    .pipe(gulp.dest('./dist/scripts')).pipe(devServer.reload())
})

gulp.task('move:previous_counter_files', function () {
  return gulp.src(['./previous_web_counter/**/*', '!./previous_web_counter/index.html'])
    .pipe(gulp.dest('./dist'))
})

gulp.task('watch:start', function () {
  gulp.watch(['./src/styles/**/*.scss'], ['compile:scss'])
  gulp.watch(['src/scripts/**/*.js'], ['move:js'])
  gulp.watch('./src/templates/**/*.nunjucks', ['compile:nunjucks'])
})


gulp.task('connect', devServer.server({
    root: ['./dist'],
    port: 1337,
    livereload: true,
    open: {
        browser: 'Google Chrome' // if not working OS X browser: 'Google Chrome'
    },
    middleware: function (connect, opt) {
        var Proxy = require('proxy-middleware');
        //opt.route = ['/rest/servicepoint/user', '/rest/servicepoint/user'];
        //opt.route = '/rest';
        var proxyOptions = url.parse('http://192.168.5.79:8080/rest');
        proxyOptions.route = ['/rest', '/css'];
        var proxy = Proxy(proxyOptions);
        return [proxy];
    }
}));


gulp.task('build', gulpsync.sync(
  [
    'clean:build', 
    'compile:nunjucks',
    'compile:scss', 
    'move:js', 
    'move:images', 
    'move:icons',
    'move:previous_counter_files'
    ]), function () {
  return console.log(`Build Created in folder ./dist`)
})

gulp.task('build:dev', gulpsync.sync(
  [
    'clean:build', 
    'compile:nunjucks',
    'compile:scss',
    'move:js', 
    'move:images', 
    'move:icons',
    'move:previous_counter_files',
    'watch:start',
    'connect'
    ]), function () {
  return console.log(`Build Created in folder ./dist - Listening to changes in scripts/styles/templates...`)
})
