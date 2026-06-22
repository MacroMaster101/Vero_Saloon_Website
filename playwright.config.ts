import { defineConfig } from '@playwright/test';

// NOTE: `npm run start` runs `next start`, which requires a prior `npm run build`.
// Run the e2e suite with: `npm run build && npm run e2e`.
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
