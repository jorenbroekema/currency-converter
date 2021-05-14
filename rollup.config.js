import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const html = require('@web/rollup-plugin-html').default;

export default {
  output: { dir: 'dist' },
  input: './index.html',
  plugins: [html(), nodeResolve()],
};
