const path = require("path");
const htmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require("webpack");

module.exports = {
    mode: "development",
    devtool: "cheap-source-map",
    entry: {
        app: [
            "webpack-hot-middleware/client?noInfo=true&reload=true",
            "./index.js"
        ]
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            }
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: "/",
        filename: "[name].js"
    },
    plugins: [
        new htmlWebpackPlugin({
            title: 'mini react',
            template: path.resolve(__dirname, 'index.html')
        }),
        new webpack.HotModuleReplacementPlugin()
    ]

}