import { defineConfig } from 'vitest/config';
import { createRequire } from 'module';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.spec.ts'],
  },
});