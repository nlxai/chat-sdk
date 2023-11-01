const browserify = require("browserify");
const fs = require("fs");

fs.mkdir("lib/umd", () => {
  process.env.NODE_ENV = "production";
  browserify({
    standalone: "nlxai.voiceCompass"
  })
    .add("src/index.ts")
    .plugin("tsify")
    .transform("uglifyify", { global: true })
    .bundle()
    .on("error", error => {
      console.error(error.toString());
    })
    .pipe(fs.createWriteStream("lib/umd/index.js"));
});
