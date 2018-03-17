const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const utils = require('./utils');

const rootPath = utils.getRoot();
const srcPath = utils.getSrcPath();
const appPath = utils.getAppPath();

const npmm = `${rootPath}/node_modules`;
const corePath = `${appPath}/core`;
const sassPath = `${appPath}/sass`;

module.exports = function () {
  return {
    entry: {
      'polyfills': './src/polyfills.ts',
      'vendor': './src/vendor.ts',
      'main': './src/main.ts'
    },
    output: {
      path: `${rootPath}/dist`,
      filename: '[name].bundle.js'
    },
    resolve: {
      extensions: ['.ts', '.js', '.json', '.scss'],
      modules: [srcPath, 'node_modules'],
      symlinks: false,
      alias: {
        assets: `${srcPath}/assets`,
        features: `${appPath}/features`,
        modules: `${appPath}/modules`,
        guards: `${appPath}/guards`,
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
        services: `${corePath}/services`,
        sass: `${appPath}/sass`,
        data: `${appPath}/data`,
        npmm: `${rootPath}/node_modules`
      }
    },
    module: {
      rules: [
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
            // { loader: 'raw-loader' },
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
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
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
      new HtmlWebpackPlugin({
        template: 'src/index.html',
        chunksSortMode: 'dependency',
        inject: 'head'
      })
    ],
  };
}
