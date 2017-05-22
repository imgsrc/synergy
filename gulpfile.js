var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),

    postcss = require('gulp-postcss'),
    fonts = require('postcss-font-magician'),
    cssnano = require('cssnano'),
    autoprefixer = require('autoprefixer'),
    pxtorem = require('postcss-pxtorem'),

    del = require('del'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    ftp = require('vinyl-ftp'),
    media = require('gulp-group-css-media-queries'),
    realFavicon = require('gulp-real-favicon'),
    fs = require('fs'),
    smart = require("smart-grid"),
    notify = require("gulp-notify");


// Скрипты проекта
gulp.task('smartgrid', function () {

});

gulp.task('scripts', function () {
  return gulp.src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
    'node_modules/jquery.equalheights/jquery.equalheights.js',
    'app/js/common.js' // Всегда в конце
  ])
      .pipe(concat('scripts.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('app/js'))
      .pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function () {
  browserSync({
    server: {
      baseDir: 'app'
    },
    notify: false
  });
});

gulp.task('postcss', function () {
  const processor = ([
    autoprefixer({browsers: ['last 7 version']}),
    pxtorem({
      rootValue: 16,
      unitPrecision: 5,
      propList: ['font', 'font-size', 'line-height'],
      selectorBlackList: ['body', 'html'],
      replace: true,
      mediaQuery: false,
      minPixelValue: 6
    }),
    cssnano(),
    fonts()
  ]);
  return gulp.src('app/sass/main.sass')
      .pipe(sourcemaps.init())
      .pipe(sass().on("error", notify.onError()))
      .pipe(rename({suffix: '.min', prefix: ''}))
      .pipe(media())
      .pipe(postcss(processor))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./app/css'))
      .pipe(browserSync.reload({
        stream: true
      }))
});

var FAVICON_DATA_FILE = 'faviconData.json';
gulp.task('generate-favicon', function (done) {
  realFavicon.generateFavicon({
    masterPicture: 'app/img/favicon.png',
    dest: 'app/img/favicons',
    iconsPath: '/',
    design: {
      ios: {
        pictureAspect: 'backgroundAndMargin',
        backgroundColor: '#ffffff',
        margin: '21%'
      },
      desktopBrowser: {},
      windows: {
        pictureAspect: 'whiteSilhouette',
        backgroundColor: '#da532c',
        onConflict: 'override'
      },
      androidChrome: {
        pictureAspect: 'shadow',
        themeColor: '#ffffff',
        manifest: {
          name: 'PUGOFKA',
          display: 'browser',
          orientation: 'notSet',
          onConflict: 'override'
        }
      },
      safariPinnedTab: {
        pictureAspect: 'silhouette',
        themeColor: '#5bbad5'
      }
    },
    settings: {
      compression: 5,
      scalingAlgorithm: 'Mitchell',
      errorOnImageTooSmall: false
    },
    markupFile: FAVICON_DATA_FILE
  }, function () {
    done();
  });
});
gulp.task('inject-favicon-markups', function () {
  gulp.src(['app/*.html'])
      .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
      .pipe(gulp.dest('app/*.html'));
});
gulp.task('check-for-favicon-update', function (done) {
  var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
  realFavicon.checkForUpdates(currentVersion, function (err) {
    if (err) {
      throw err;
    }
  });
});

gulp.task('watch', ['postcss', 'scripts', 'browser-sync'], function () {
  gulp.watch('app/sass/**/*.sass', ['postcss']);
  gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['scripts']);
  gulp.watch('app/*.html', browserSync.reload);
});


gulp.task('imagemin', function () {
  return gulp.src('app/img/**/*')
      .pipe(cache(imagemin()))
      .pipe(gulp.dest('dist/img'));
});

gulp.task('build', ['removedist', 'imagemin', 'postcss', 'scripts'], function () {

  var buildFiles = gulp.src([
    'app/*.html',
    'app/.htaccess',
    'app/mail.php'
  ]).pipe(gulp.dest('dist'));

  var buildCss = gulp.src([
    'app/css/main.min.css'
  ]).pipe(gulp.dest('dist/css'));

  var buildJs = gulp.src([
    'app/js/scripts.min.js'
  ]).pipe(gulp.dest('dist/js'));

  var buildFonts = gulp.src([
    'app/fonts/**/*']
  ).pipe(gulp.dest('dist/fonts'));

});

gulp.task('deploy', function () {

  var conn = ftp.create({
    host: '',
    user: '',
    password: '',
    parallel: 10,
    log: gutil.log
  });

  var globs = [
    'dist/**',
    'dist/.htaccess'
  ];
  return gulp.src(globs, {buffer: false})
      .pipe(conn.dest('./avia'));

});

gulp.task('removedist', function () {
  return del.sync('dist');
});
gulp.task('clearcache', function () {
  return cache.clearAll();
});

gulp.task('default', ['watch']);