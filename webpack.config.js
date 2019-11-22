const path = require("path");

module.exports = {
  entry: "./src/main.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "wavelet-client.umd.js",
    library: "wavelet-client",
    libraryTarget: "umd",
    libraryExport: "default",
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
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  }
};
