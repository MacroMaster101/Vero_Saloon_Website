import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // `server-only` throws when imported outside an RSC. Stub it so the
      // service-role admin client can be exercised by the integration test.
      'server-only': resolve(__dirname, 'tests/stubs/server-only.ts'),
    },
  },
});
