const webpack = require("webpack");
const webpackHotMiddleware = require("webpack-hot-middleware");
const webpackDevMiddleware = require("webpack-dev-middleware");
const express = require("express");
const opn = require("opn");
const webpakcConfig = require("./webpack.config.dev");
const path = require("path");
webpakcConfig.entry.app.unshift("webpack-hot-middleware/client?noInfo=true&reload=true");
const app = express(),
    PORT = 8888,
    DIST_DIR = path.join(__dirname, 'dist'),
    compiler = webpack(webpakcConfig);


let devMiddleware = webpackDevMiddleware(compiler, {
    publicPath: webpakcConfig.output.publicPath,
    quiet: false
})


let hotMiddleware = webpackHotMiddleware(compiler, {
    heartbeat: 2000
})

app.use(devMiddleware);
app.use(hotMiddleware);
app.use(express.static(DIST_DIR));


app.listen(PORT, function () {
    console.log('成功启动:localhost:' + PORT);
    opn('http://127.0.0.1:' + PORT);
})

