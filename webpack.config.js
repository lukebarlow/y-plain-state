'use strict'

var webpack = require('webpack')

var env = process.env.NODE_ENV
var config = {
  entry: [
    'babel-polyfill',
    './src/index'
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/
      }
    ]
  },
  output: {
    library: 'y-plain-state',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.IgnorePlugin(/.*\.md/),
    new webpack.IgnorePlugin(/SpecHelper/)
  ]
}

if (env === 'production') {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        screw_ie8: true,
        warnings: false
      }
    })
  )
}

module.exports = config
