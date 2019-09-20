/**
 layui构建
 */

var pkg = require('./package.json');

var gulp = require('gulp');
var watch = require('gulp-watch');
var uglify = require('gulp-uglify');
var minify = require('gulp-minify-css');
var connect = require('gulp-connect');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var header = require('gulp-header');
var del = require('del');
var gulpif = require('gulp-if');
var minimist = require('minimist');
var _ = require('lodash');
var runSequence = require('run-sequence');
var zip = require('gulp-zip');
var tmodjs = require('gulp-tmod');
var clean = require('gulp-clean');
var preprocess = require('gulp-preprocess');

var argv = require('minimist')(process.argv.slice(2), {
    default: {
        ver: 'all'
    }
});
var dest = {
    demo: './dist/sdk/demo/',
    sdk: './dist/sdk/',
    lib: './dist/sdk/lib/',
    doc: './dist/sdk/doc/',
    dist: './dist/',
    tpl: './dist/sdk/tpl/',
    css: './dist/sdk/css/',
    fonts: './dist/sdk/fonts/',
}
var copySrc = {
    lib: {src: 'jssdk/xiaoman/lib/**/*', dist: dest.lib},
    demo: {src: 'demo/**/*', dist: dest.demo},
    readme: {src: 'README.md', dist: dest.sdk},
    doc: {src: 'doc/**/*', dist: dest.doc},
    fonts: {src: 'jssdk/xiaoman/fonts/**/*', dist: dest.fonts},
}
var src = {
    base: 'jssdk/xiaoman/',
    modules: 'jssdk/xiaoman/modules/',
    config_dev: 'jssdk/xiaoman/config_dev.js',
    config_prod: 'jssdk/xiaoman/config_prod.js',
    config_test: 'jssdk/xiaoman/config_test.js',
    main: 'jssdk/xiaoman/xiaoman.js',
    common: 'jssdk/xiaoman/common/**/*.js',
    plugin: 'jssdk/xiaoman/plugin/**/*.js',
    service: 'jssdk/xiaoman/service/**/*.js',
    lib_base: 'jssdk/xiaoman/lib/base.js',
    tpl: 'jssdk/xiaoman/common/tpl/**/*.html',
    tplBasePath: 'jssdk/xiaoman/common/tpl/',
    tmp: 'tmp/',
    css: 'jssdk/xiaoman/css/'
}


var task = {
    miniclientjs: function (module, publishType) {
        var gsrc = [];
        if (module == '') {
            gsrc = [src.modules + 'client/**/*.js', src.tmp + '*.js'];
        } else {
            gsrc = [src.modules + 'client/' + module + '.js', src.tmp + module + '-client-template.js'];
        }
        console.log("miniclientjs->" + gsrc)
        if (publishType == "prod" || publishType == "test") {
            return gulp.src(gsrc)
                .pipe(concat(module == '' ? 'xiaoman-all-client.js' : 'xiaoman-' + module + '-client.js'))
                .pipe(uglify())
                .pipe(header('/** <%= pkg.name %>-v<%= pkg.version %> <%= pkg.license %> license By <%= pkg.homepage %> */\n ;', {pkg: pkg}))
                .pipe(gulp.dest(dest.sdk))
        } else {
            return gulp.src(gsrc)
                .pipe(concat(module == '' ? 'xiaoman-all-client.js' : 'xiaoman-' + module + '-client.js'))
                .pipe(header('/** <%= pkg.name %>-v<%= pkg.version %> <%= pkg.license %> license By <%= pkg.homepage %> */\n ;', {pkg: pkg}))
                .pipe(gulp.dest(dest.sdk))
        }
    },
    minicss: function (module, publishType) {
        var gsrc = [];
        if (module == '') {
            gsrc = [src.css + '**/*.css'];
        } else {
            gsrc = [src.css + 'font-awesome.min.css', src.css + module + '-client.css'];
        }
        console.log("minicss->" + gsrc)
        if (publishType == "prod") {
            return gulp.src(gsrc)
                .pipe(concat(module == '' ? 'xiaoman-all-client.css' : 'xiaoman-' + module + '-client.css'))
                .pipe(minify())
                .pipe(header('/** <%= pkg.name %>-v<%= pkg.version %> <%= pkg.license %> license By <%= pkg.homepage %> */\n ', {pkg: pkg}))
                .pipe(gulp.dest(dest.css))
        } else {
            return gulp.src(gsrc)
                .pipe(concat(module == '' ? 'xiaoman-all-client.css' : 'xiaoman-' + module + '-client.css'))
                .pipe(header('/** <%= pkg.name %>-v<%= pkg.version %> <%= pkg.license %> license By <%= pkg.homepage %> */\n ', {pkg: pkg}))
                .pipe(gulp.dest(dest.css))
        }
    },
    minjs: function (module, publishType) {
        var gsrc = [
            src.modules + "base.js",];
        //可指定模块压缩
        var mod = argv.mod ? function () {
            return argv.mod.replace(/,/g, '|');
        }() : module;
        if (mod == '') {
            gsrc.push(src.modules + '!(client)/*.js');
        } else {
            gsrc.push(src.modules + mod + '/*.js');
        }
        console.log("minjs->" + gsrc)
        if (publishType == "prod" || publishType == "test") {
            return gulp.src(gsrc)
                .pipe(concat(mod == '' ? 'xiaoman-all.js' : 'xiaoman-' + mod + '.js'))
                .pipe(uglify())
                .pipe(header('/** <%= pkg.name %>-v<%= pkg.version %> <%= pkg.license %> license By <%= pkg.homepage %> */\n ;', {pkg: pkg}))
                .pipe(gulp.dest(dest.sdk))
        } else {
            return gulp.src(gsrc)
                .pipe(concat(mod == '' ? 'xiaoman-all.js' : 'xiaoman-' + mod + '.js'))
                .pipe(header('/** <%= pkg.name %>-v<%= pkg.version %> <%= pkg.license %> license By <%= pkg.homepage %> */\n ;', {pkg: pkg}))
                .pipe(gulp.dest(dest.sdk))
        }


    }
    , mainjs: function (publishType) {
        if (publishType == "prod") {
            return gulp.src([src.plugin, src.main, src.common, src.service])
                .pipe(concat("xiaoman.js"))
                .pipe(uglify())
                .pipe(header('/** <%= pkg.name %>-v<%= pkg.version %> <%= pkg.license %> license By <%= pkg.homepage %> */\n ;', {pkg: pkg}))
                .pipe(gulp.dest(dest.sdk))
        }
        if (publishType == "test") {
            return gulp.src([src.plugin, src.main, src.common, src.service])
                .pipe(concat("xiaoman.js"))
                .pipe(uglify())
                .pipe(header('/** <%= pkg.name %>-v<%= pkg.version %> <%= pkg.license %> license By <%= pkg.homepage %> */\n ;', {pkg: pkg}))
                .pipe(gulp.dest(dest.sdk))
        }
        else {
            return gulp.src([src.plugin, src.main, src.common, src.service])
                .pipe(concat("xiaoman.js"))
                .pipe(header('/** <%= pkg.name %>-v<%= pkg.version %> <%= pkg.license %> license By <%= pkg.homepage %> */\n ;', {pkg: pkg}))
                .pipe(gulp.dest(dest.sdk))
        }

    }
    , cfgjs: function (publishType) {
        if (publishType == "prod") {
            return gulp.src(src.config_prod)
                .pipe(concat("xiaoman-config.js"))
                .pipe(gulp.dest(dest.sdk))
        }
        if (publishType == "test") {
            return gulp.src(src.config_test)
                .pipe(concat("xiaoman-config.js"))
                .pipe(gulp.dest(dest.sdk))
        }
        else {
            return gulp.src(src.config_dev)
                .pipe(concat("xiaoman-config.js"))
                .pipe(gulp.dest(dest.sdk))
        }

    }
};

//清理
gulp.task('clear', function () {
    return gulp.src(['./dist', './tmp'], {read: false})
        .pipe(clean({force: true}));
});

//拷贝文件
gulp.task('copy', function () {
    _.forIn(copySrc, function (obj, key) {
        console.log(obj.src + '|' + obj.dist)
        return gulp.src(obj.src)
            .pipe(gulp.dest(obj.dist));
    })
});

gulp.task('zipFile', function () {
    return gulp.src(dest.sdk + "**/*")
        .pipe(zip('xiaoman-sdk.zip'))
        .pipe(gulp.dest(dest.dist));
});

gulp.task('tpl', function () {

    return gulp.src(src.tpl)
        .pipe(tmodjs({
            runtime: 'phone-client-template.js',
            compress: true,
            templateBase: src.tplBasePath,
            combo: true,
            output: src.tmp,
            cache: false
        }));

});

gulp.task('watch', function () {
    gulp.watch([src.base + '/**/*.js', src.base + '/**/*.html', src.base + '/**/*.css', 'demo/**/*.html'], ['dev']);
});


gulp.task('prod-exec', function () {
    task.mainjs('prod');
    task.cfgjs('prod');
    task.minjs('', 'prod');
    task.minjs('phone', 'prod');
    task.miniclientjs('phone', 'prod');
    task.miniclientjs('', 'prod');
    task.minicss('', 'prod');
    task.minicss('phone', 'prod');
    task.minjs('im', 'prod');
});

gulp.task('test-exec', function () {
    task.mainjs('test');
    task.cfgjs('test');
    task.minjs('', 'test');
    task.minjs('phone', 'test');
    task.miniclientjs('phone', 'test');
    task.miniclientjs('', 'test');
    task.minicss('', 'test');
    task.minicss('phone', 'test');
    task.minjs('im', 'test');
});

gulp.task('dev-exec', function () {
    task.mainjs('dev');
    task.cfgjs('dev');
    task.minjs('', 'dev');
    task.minjs('phone', 'dev');
    task.miniclientjs('phone', 'dev');
    task.miniclientjs('', 'dev');
    task.minicss('', 'dev');
    task.minicss('phone', 'dev');
    task.minjs('im', 'dev');
});


gulp.task('prod', function (callback) {
    runSequence(
        'clear',
        'tpl',
        'prod-exec',
        'copy',
        callback);
});

gulp.task('dev', function (callback) {
    runSequence(
        'clear',
        'tpl',
        'dev-exec',
        'copy',
        callback);
});

gulp.task('test', function (callback) {
    runSequence(
        'clear',
        'tpl',
        'test-exec',
        'copy',
        callback);
});

gulp.task('srv', ['watch', 'connect']);

gulp.task('connect', function () {
    connect.server({
        root: ['app'],
        //livereload: true,
        // Change this to '0.0.0.0' to access the server from outside.
        port: 8081/*,
         middleware: function (connect) {
         return [
         connect().use(
         '/scripts',
         connect.static('./dist/scripts')
         ),
         connect().use(
         '/styles',
         connect.static('./dist/styles')
         )
         ];
         }*/
    });
});



