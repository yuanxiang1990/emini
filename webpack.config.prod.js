const baseConfig = require("./webpack.config");
const HappyPack = require("happypack");
baseConfig.mode = "production";
baseConfig.devtool = "cheap-module-source-map";
baseConfig.entry = {
    app:["./src/index.js"]
}
baseConfig.plugins = [
    new HappyPack({
        id: "babel",
        loaders: ['babel-loader?cacheDirectory=true'],
        cache: true,
        verbose: true
    })
]
module.exports = baseConfig;