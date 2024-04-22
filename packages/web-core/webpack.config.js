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
            drop_console: false
          },
          mangle: false,
          keep_fnames: true,
          keep_classnames: true,
          toplevel: true,     
        },
      }),
    ],
  }
};