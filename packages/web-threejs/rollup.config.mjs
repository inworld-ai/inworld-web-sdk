import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: './build/src/index.js',
  output: {
    file: './dist/inworld-web-threejs.min.js',
    format: 'cjs',
  },
  plugins: [nodeResolve()],
};
