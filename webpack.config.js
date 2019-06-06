const path = require("path");
const htmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require("webpack");
const HappyPack = require("happypack");
module.exports = {
    mode: "development",
    devtool: "cheap-source-map",
    resolve: {
        modules: [path.resolve(__dirname, 'node_modules')],
        //尽可能减 少后缀尝试的可能性
        extensions: ['.js']
    },
    entry: {
        app: [
            "./dev.js"
        ]
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: "happypack/loader?id=babel",
                exclude: /node_modules/,
            }
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: "/",
        filename: "[name].js"
    },
    plugins: [
        new HappyPack({
            id: "babel",
            loaders: ['babel-loader?cacheDirectory=true'],
            cache: true,
            verbose: true
        }),
        new htmlWebpackPlugin({
            title: 'mini react',
            template: path.resolve(__dirname, 'index.html')
        }),
        new webpack.HotModuleReplacementPlugin()
    ]

}