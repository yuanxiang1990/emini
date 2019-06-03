const baseConfig = require("./webpack.config");
baseConfig.mode = "development";
baseConfig.devtool = "cheap-module-eval-source-map";
module.exports = baseConfig;