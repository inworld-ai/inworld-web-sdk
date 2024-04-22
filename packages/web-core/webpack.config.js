const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './build/src/index.js',
  output: {
    filename: 'inworld-web-core.min.js',
    path: __dirname + '/dist',
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
          mangle: true,
        },
      }),
    ],
  },
};
