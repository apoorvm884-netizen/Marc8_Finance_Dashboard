import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['__tests__/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    setupFiles: [path.resolve(__dirname, '__tests__/setup.ts')],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: '__tests__/coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/types/**', 'src/main.tsx', 'src/vite-env.d.ts'],
    },
    css: true,
  },
});
