const browserify = require("browserify");
const commonShake = require('common-shakeify');
const fs = require("fs");

fs.mkdir("lib/umd", () => {
  process.env.NODE_ENV = 'production';
  browserify({
    standalone: "chat",
  })
    .add("src/index.tsx")
    .plugin("tsify")
    .plugin(commonShake)
    .transform("uglifyify", { global: true })
    .bundle()
    .on("error", (error) => {
      console.error(error.toString());
    })
    .pipe(fs.createWriteStream("lib/umd/widget.js"));
});
