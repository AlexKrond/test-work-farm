const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: './src/index.js',
  output: {
    filename: 'bindle.js',
    path: path.resolve(__dirname, 'public', 'build'),
  },
  devServer: {
    port: 8080,
    contentBase: path.join(__dirname, 'public'),
  }
};
