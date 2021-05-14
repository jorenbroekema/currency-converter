import { playwrightLauncher } from '@web/test-runner-playwright';

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  files: 'test/**/*.test.js',
  nodeResolve: true,
  /** Browsers to run tests on */
  browsers: [playwrightLauncher({ product: 'chromium' })],
});
