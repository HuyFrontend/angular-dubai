const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const ngToolsWebpack = require('@ngtools/webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const commonConfig = require('./webpack-base.js');
const utils = require('./utils');

const rootPath = utils.getRoot();
const srcPath = utils.getSrcPath();
const appPath = utils.getAppPath();

const npmm = `${rootPath}/node_modules`;
const corePath = `${appPath}/core`;
const sassPath = `${appPath}/sass`;

module.exports = function() {
    return {
        entry: {
            'polyfills': './src/polyfills.ts',
            'vendor': './src/vendor.ts',
            'main': './src/main.ts'
        },
        /**
         * Developer tool to enhance debugging
         *
         * See: http://webpack.github.io/docs/configuration.html#devtool
         * See: https://github.com/webpack/docs/wiki/build-performance#sourcemaps
         */
        devtool: 'source-map',
        /**
         * Options affecting the output of the compilation.
         *
         * See: http://webpack.github.io/docs/configuration.html#output
         */
        output: {

            /**
             * The output directory as absolute path (required).
             *
             * See: http://webpack.github.io/docs/configuration.html#output-path
             */
            path: `${rootPath}/dist`,

            /**
             * Specifies the name of each output file on disk.
             * IMPORTANT: You must not specify an absolute path here!
             *
             * See: http://webpack.github.io/docs/configuration.html#output-filename
             */
            filename: '[name].[chunkhash].bundle.js',

            /**
             * The filename of the SourceMaps for the JavaScript files.
             * They are inside the output.path directory.
             *
             * See: http://webpack.github.io/docs/configuration.html#output-sourcemapfilename
             */
            sourceMapFilename: '[name].[chunkhash].bundle.map',

            /**
             * The filename of non-entry chunks as relative path
             * inside the output.path directory.
             *
             * See: http://webpack.github.io/docs/configuration.html#output-chunkfilename
             */
            chunkFilename: '[id].[chunkhash].chunk.js'
        },
        resolve: {
            extensions: ['.ts', '.js', '.json', '.scss'],
            modules: [srcPath, 'node_modules'],
            symlinks: false,
            alias: {
                assets: `${srcPath}/assets`,
                modules: `${appPath}/modules`,
                guards: `${appPath}/guards`,
                features: `${appPath}/features`,
                components: `${appPath}/components`,
                pipes: `${appPath}/pipes`,
                core: `${corePath}`,
                state: `${corePath}/state`,
                models: `${corePath}/models`,
                directives: `${corePath}/directives`,
                constant: `${corePath}/constant`,
                configs: `${corePath}/configs`,
                utils: `${corePath}/utils`,
                providers: `${corePath}/providers`,
                sass: `${appPath}/sass`,
                data: `${appPath}/data`,
                npmm: `${rootPath}/node_modules`
            }
        },
        module: {
            rules: [{
                    test: /\.ts$/,
                    use: [
                        '@ngtools/webpack'
                    ],
                    exclude: [/\.(spec|e2e)\.ts$/]
                },
                /*
                 * to string and css loader support for *.css files (from Angular components)
                 * Returns file content as string
                 *
                 */
                {
                    test: /\.css$/,
                    use: ['to-string-loader', 'css-loader']
                },
                /*
                 * to string and sass loader support for *.scss files (from Angular components)
                 * Returns compiled css content as string
                 *
                 */
                {
                    test: /\.scss$/,
                    use: [
                        { loader: 'to-string-loader' },
                        { loader: 'css-loader' },
                        { loader: 'sass-loader' }
                    ]
                },

                /* Raw loader support for *.html
                 * Returns file content as string
                 *
                 * See: https://github.com/webpack/raw-loader
                 */
                {
                    test: /\.html$/,
                    use: 'raw-loader',
                    exclude: [`${srcPath}/index.html`]
                },
                /*
                 * File loader support for images.*
                 */
                {
                    test: /\.(jpg|png|gif)$/,
                    use: 'file-loader'
                },
                /*
                 * Url loader support for font.*
                 */
                {
                    test: /\.(woff|woff2|eot|ttf|svg)$/,
                    use: {
                        loader: 'url-loader',
                        options: {
                            limit: 100000
                        }
                    }
                }
            ],
        },
        plugins: [
            new webpack.ProvidePlugin({
                Quill: 'quill'
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
            }),
            new ngToolsWebpack.AotPlugin({
                tsConfigPath: `${rootPath}/tsconfig-aot.json`
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: ['polyfills', 'vendor'].reverse()
            }),

            /*
             * Plugin: HtmlWebpackPlugin
             * Description: Simplifies creation of HTML files to serve your webpack bundles.
             * This is especially useful for webpack bundles that include a hash in the filename
             * which changes every compilation.
             *
             * See: https://github.com/ampedandwired/html-webpack-plugin
             */
            // Workaround needed for angular 2 angular/angular#11580
            new webpack.ContextReplacementPlugin(
                // The (\\|\/) piece accounts for path separators in *nix and Windows
                /angular(\\|\/)core(\\|\/)@angular/,
                path.join(__dirname, 'src') // location of your src
            ),
            new CopyWebpackPlugin([
                { from: 'src/assets', to: 'assets' }
            ]),
            new webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false
            }),
            new webpack.optimize.UglifyJsPlugin({
                beautify: false, //prod
                output: {
                    comments: false
                }, //prod
                mangle: {
                    screw_ie8: true
                }, //prod
                compress: {
                    screw_ie8: true,
                    warnings: false,
                    conditionals: true,
                    unused: true,
                    comparisons: true,
                    sequences: true,
                    dead_code: true,
                    evaluate: true,
                    if_return: true,
                    join_vars: true,
                    negate_iife: false // we need this for lazy v8
                }
            }),
            new HtmlWebpackPlugin({
                template: 'src/index.html',
                chunksSortMode: 'dependency',
                inject: 'head'
            }),
        ],
    };
}
