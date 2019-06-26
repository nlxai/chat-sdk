const browserify = require("browserify");
const tsify = require("tsify");
const uglifyify = require("uglifyify");
const fs = require("fs");

browserify({
  standalone: "chat"
})
  .add("src/widget/index.tsx")
  .plugin("tsify")
  .transform("uglifyify", { global: true })
  .bundle()
  .on("error", error => {
    console.error(error.toString());
  })
  .pipe(fs.createWriteStream("dist-standalone/widget.js"));
