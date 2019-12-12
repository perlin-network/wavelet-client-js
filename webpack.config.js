const path = require("path");

module.exports = {
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "wavelet-client.umd.js",
    library: "wavelet-client",
    libraryTarget: "umd",
    globalObject: `(typeof self !== 'undefined' ? self : this)`
  },
  mode: "development",
  resolve: {
    alias: {
      // websocket: path.resolve(__dirname, 'node_modules/websocket/lib/websocket.js'),
      atob: path.resolve(__dirname, "node_modules/atob/node-atob.js")
    }
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      }
    ]
  }
};
