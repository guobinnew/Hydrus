const gulp = require('gulp')
const babel = require("gulp-babel")
const uglify = require('gulp-uglify') //js压缩
const browserify = require('browserify')
const source = require('vinyl-source-stream')

const src_file = './*.js'
const dist_path = './dist/js'

gulp.task('default', function() {
  return gulp.src(src_file)
            .pipe(babel())
            .pipe(uglify())
            .pipe(gulp.dest(dist_path))
})

// 监视文件变化，自动执行任务
gulp.task('watch', function(){
  gulp.watch(src_file, ['js', 'browserify']);
})

// browserify
gulp.task("browserify", function () {
  var b = browserify({
      entries: "dist/js/index.js"
  })

  return b.bundle()
      .pipe(source("aquila.js"))
      .pipe(gulp.dest("./dist"))
})
