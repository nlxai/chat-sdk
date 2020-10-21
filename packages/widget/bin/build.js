const browserify = require("browserify");
const fs = require("fs");

fs.mkdir("lib/umd", () => {
  browserify({
    standalone: "chat",
  })
    .add("src/index.tsx")
    .plugin("tsify")
    .transform("uglifyify", { global: true })
    .bundle()
    .on("error", (error) => {
      console.error(error.toString());
    })
    .pipe(fs.createWriteStream("lib/umd/widget.js"));
});
