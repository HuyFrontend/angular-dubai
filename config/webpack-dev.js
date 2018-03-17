const path = require('path');
const webpack = require('webpack');

const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack-base.js');
const utils = require('./utils');

const rootPath = utils.getRoot();

const npmm = `${rootPath}/node_modules`;

module.exports = function(env) {
    return webpackMerge(commonConfig(), {
        devtool: 'cheap-module-source-map',
        output: {
            path: `${rootPath}/dist`,
            filename: '[name].bundle.js',
            // publicPath: publicPath,
            sourceMapFilename: '[name].map'
        },
        module: {
            rules: [{
                test: /\.ts$/,
                use: [
                    { loader: 'awesome-typescript-loader' },
                    { loader: 'angular2-template-loader' },
                    {
                        loader: 'angular-router-loader' // For lazyload
                    }
                ],
                exclude: [/\.(spec|e2e)\.ts$/, npmm]
            }]
        },
        plugins: [
            // new webpack.optimize.CommonsChunkPlugin({
            //     name: ['polyfills', 'vendor'].reverse()
            // }),
        ],
        devServer: {
            port: 8088,
            host: 'localhost',
            historyApiFallback: true,
            noInfo: false,
            stats: 'minimal',
            // publicPath: publicPath
            proxy: {
                '/login': {
                    target: 'http://localhost:8080',
                    secure: false
                },
                '/login/callback': {
                    target: 'http://localhost:8080',
                    secure: false
                }
            }
        }
    })
}