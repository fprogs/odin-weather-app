require('dotenv').config()
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = {
    mode: "development",
    entry: {
        bundle: path.resolve(__dirname, "src/index.js"),
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
        clean: true,
        assetModuleFilename: "[name][ext]",
    },
    devtool: "source-map",
    devServer: {
        static: {
            directory: path.resolve(__dirname, "dist"),
        },
        open: {
            app: {
                name: "firefox",
                arguments: ["--private-window"],
            },
        },
    },
    optimization: {
        runtimeChunk: "single",
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Odin Weather App",
            filename: "index.html",
            template: "src/template.html",
        }),
        new webpack.DefinePlugin({
            "process.env.APPID": JSON.stringify(process.env.APPID),
        }),
    ],
};