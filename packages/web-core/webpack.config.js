const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './build/src/index.js',
  output: {
    filename: 'inworld-web-core.min.js',
    path: __dirname + '/dist',
  },
  optimization: {
    // mangleExports: false,
    minimize: false,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: false,
          },
          mangle: false,
          module: true,
          keep_fnames: true,
          keep_classnames: true,
          toplevel: true,
        },
      }),
    ],
    // providedExports: false,
  },
};
