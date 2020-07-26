// vue.config.js
const webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

module.exports = {
  runtimeCompiler: true,

  indexPath: '../views/index.html',
  outputDir: '../public',
  publicPath: '/public',

  devServer: {
    disableHostCheck: true,
    proxy: {
      ['/api']: { target: 'http://localhost:8000' },
      ['/file']: { target: 'http://localhost:8000' },
      ['/public']: { target: 'http://localhost:8000' },
    },
  },

  pages: {
    index: {
      entry: './src/main.js',
      template: './index.pug',
    },
  },

  pluginOptions: {
    webpackBundleAnalyzer: {
      analyzerMode:
        process.env.NODE_ENV === 'production' ? 'disabled' : 'static',
      analyzerPort: 9999,
      openAnalyzer: false,
    },
  },

  configureWebpack: {
    externals:
      process.env.NODE_ENV !== 'test'
        ? {
            jquery: 'jQuery',
          }
        : {},

    // plugins: [
    //   // https://webpack.js.org/plugins/ignore-plugin/
    //   new webpack.IgnorePlugin({
    //     resourceRegExp: /^\.\/locale$/,
    //     contextRegExp: /moment$/
    //   })
    // ],

    resolve: {
      alias: {
        // https://medium.com/js-dojo/how-to-reduce-your-vue-js-bundle-size-with-webpack-3145bf5019b7
        moment: 'moment/src/moment',
      },
    },
  },
}
