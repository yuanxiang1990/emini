const baseConfig = require("./webpack.config");
baseConfig.mode = "production";
baseConfig.devtool = "cheap-module-source-map";
module.exports = baseConfig;