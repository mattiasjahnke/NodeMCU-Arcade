/*

ESP8266 file system builder

Copyright (C) 2016-2017 by Xose Pérez <xose dot perez at gmail dot com>;

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

// -----------------------------------------------------------------------------
// File system builder
// -----------------------------------------------------------------------------

const fs = require('fs');
const gulp = require('gulp');
const rename = require('gulp-rename');
const htmlmin = require('gulp-htmlmin');
const concat = require('gulp-concat');
const cleancss = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const gzip = require('gulp-gzip');
const del = require('del');
const inline = require('gulp-inline');
const inlineImages = require('gulp-css-base64');
const favicon = require('gulp-base64-favicon');

const dataFolder = '../src/';

gulp.task('clean', function() {
    del([ dataFolder + '*', 'site/_combined.js']);
    return true;
});

gulp.task('buildfs_embeded', ['buildfs_inline'], function() {

    var source = dataFolder + 'index.html.gz';
    var destination = dataFolder + 'index.html.gz.h';

    var wstream = fs.createWriteStream(destination);
    wstream.on('error', function (err) {
        console.log(err);
    });

    var data = fs.readFileSync(source);

    wstream.write('#define index_html_gz_len ' + data.length + '\n');
    wstream.write('const uint8_t index_html_gz[] PROGMEM = {')

    for (i=0; i<data.length; i++) {
        if (i % 1000 == 0) wstream.write("\n");
        wstream.write('0x' + ('00' + data[i].toString(16)).slice(-2));
        if (i<data.length-1) wstream.write(',');
    }

    wstream.write('\n};')
    wstream.end();

    del([ source ]);
    del([ 'site/_combined.js']);
});

gulp.task('scripts', ['clean'], function() {
    return gulp.src('site/**/*.js')
        .pipe(concat('_combined.js'))
        .pipe(gulp.dest('site'));
});

gulp.task('buildfs_inline', ['scripts'], function() {
    return gulp.src('site/index.html')
        .pipe(inline({
            base: 'site/',
            js: uglify,
            css: [cleancss, inlineImages],
            disabledTypes: ['svg', 'img']
        }))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true,
            minifyJS: true
        }))
        .pipe(gzip())
        .pipe(gulp.dest(dataFolder));
})

gulp.task('default', ['buildfs_embeded']);
