var path = require('path');
var webpack = require('webpack');

var Clean = require('clean-webpack-plugin');

const src = path.join(__dirname, 'src');
const dist = path.join(__dirname, 'build');

module.exports = {
  entry: [
    path.join(src, 'index.js')
  ],
  output: {
    path: dist,
    filename: 'index.js',
    publicPath: '/',
    pathinfo: true
  },
  plugins: [
    // new Clean([dist])
  ],
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: ['transform-function-bind']
        }
      }
    ]
  },
  resolve: {
    alias: {
      src: src
    }
  },
  devtool: 'source-map'
};
