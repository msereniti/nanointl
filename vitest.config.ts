import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    dir: '.',
    exclude: ['node_modules', 'utils/.formatjs-repo-clone'],
  },
});
