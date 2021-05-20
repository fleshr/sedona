'use strict';

const { src, dest, watch, series, parallel } = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const del = require('del');

sass.compiler = require('node-sass');

function clean() {
  return del('dist');
}

function browsersyncServe(cb) {
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  });
  cb();
}

function browsersyncReload(cb) {
  browserSync.reload();
  cb();
}

function htmlTask() {
  return src('src/**/*.html')
    .pipe(dest('dist'));
}

function scssTask() {
  return src('src/assets/styles/main.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(rename({
      basename: "style",
      suffix: ".min",
      extname: ".css"
    }))
    .pipe(dest('dist/assets/styles', { sourcemaps: '.' }))
}

function fontsTask() {
  return src('src/assets/fonts/**/*.{woff,woff2}')
    .pipe(dest('dist/assets/fonts'))
}

function imgTask() {
  return src('src/assets/images/**/*.{jpg,png,svg,webp}')
    .pipe(dest('dist/assets/images'))
}

function watchTask() {
  watch('src/**/*.html', series(htmlTask, browsersyncReload));
  watch('src/assets/styles/**/*.scss', series(scssTask, browsersyncReload));
  watch('src/assets/styles/**/*.{woff,woff2}', series(fontsTask, browsersyncReload));
  watch('src/assets/images/**/*.{jpg,png,svg,webp}', series(imgTask, browsersyncReload));
}

const build = series(
  clean,
  parallel(
    htmlTask,
    scssTask,
    fontsTask,
    imgTask
  )
);

const dev = series(
  build,
  browsersyncServe,
  watchTask
);

exports.build = build;
exports.dev = dev;
exports.default = dev;
