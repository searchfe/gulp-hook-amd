let gulp = require("gulp");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tscompile.json");
const inline = require("gulp-inline-template");

gulp.task("build:ts", function () {
  return tsProject.src()
      .pipe(inline())
      .pipe(tsProject())
      .pipe(gulp.dest("dist"));
});
