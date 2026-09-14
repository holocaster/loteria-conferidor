import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "npm run dev -- --port 5173 --strictPort",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:5173",
    // slowMo só entra no modo headed (test:e2e:headed) — em headless fica 0.
    launchOptions: { slowMo: process.env.PWSLOWMO ? Number(process.env.PWSLOWMO) : 0 },
  },
});
