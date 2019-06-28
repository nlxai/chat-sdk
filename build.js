const packageJson = require("./package.json");
const browserify = require("browserify");
const fs = require("fs");

fs.mkdir("lib/umd", () => {
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
    .pipe(
      fs.createWriteStream("lib/umd/widget.js")
    );
});
