import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/setup.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@raycast/api': path.resolve(__dirname, './src/test/mocks/raycast.ts'),
      '@raycast/utils': path.resolve(__dirname, './src/test/mocks/raycast.ts'),
    },
  },
});