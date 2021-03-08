const path = require("path");

module.exports = {
  entry: "./src/penrose.js",
  output: {
    filename: "penrose.js",
    path: path.resolve(__dirname, "penrose"),
  },
};
