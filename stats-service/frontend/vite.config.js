import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Get base path from environment variable, default to empty string for local dev
const basePath = process.env.VITE_BASE_PATH || '';

export default defineConfig({
  plugins: [react()],
  base: basePath,
  server: {
    port: 3001,
    host: true
  }
});
