const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');

module.exports = {
  mode: process.env.NODE_ENV,
  entry: './src/index.ts',
  output: {
    path: resolve(__dirname, 'js'),
    filename: 'index.js',
  },
  resolve: {
    extensions: ['.ts'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-typescript'],
          },
        },
      },
    ],
  },
  watch: process.env.NODE_ENV === 'development',
  devtool: 'source-map',
  plugins: [
    new HtmlWebpackPlugin({
      title: 'XPath vs CSS selectors benchmark',
      template: 'src/index.html',
    }),
    new DefinePlugin({
      __DEBUG__: JSON.stringify(process.env.DEBUG) && ['true', '1', 'on', 'yes'].includes(process.env.DEBUG),
    }),
  ],
};
