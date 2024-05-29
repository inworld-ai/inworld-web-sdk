import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: './build/src/index.js',
  output: {
    file: './dist/inworld-web-core.min.js',
    format: 'cjs',
  },
  plugins: [nodeResolve()],
};
