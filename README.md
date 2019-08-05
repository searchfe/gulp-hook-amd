# gulp-parser-apm

## 使用
```
let gulp = require("gulp");
const {apmParser,amdUrlParser } = require('./dist/index');
const path = require('path');

gulp.task('apm', function () {
  return gulp.src(['src/**/*.js']).pipe(apmParser({
    projectPath: path.resolve(process.env.PWD),
    path2url: (path)=> `__getAmdUri('${path}')`
  })).pipe(amdUrlParser()).pipe(gulp.dest('./build'));
});


```