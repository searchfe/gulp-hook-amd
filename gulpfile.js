let gulp = require("gulp");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tscompile.json");
const inline = require("gulp-inline-template");
const {apmParser,amdUrlParser } = require('./dist/index');
const path = require('path');

gulp.task("build:ts", function () {
  return tsProject.src()
      .pipe(inline())
      .pipe(tsProject())
      .pipe(gulp.dest("dist"));
});
gulp.task('apm', function () {
  return gulp.src(['./www-wise/src/**/*_config.js']).pipe(apmParser({
    projectPath: path.resolve(process.env.PWD,'./www-wise/src/'),
    path2url: (path)=> `__getAmdUri('${path}')`
  })).pipe(amdUrlParser()).pipe(gulp.dest('./build'));
});
