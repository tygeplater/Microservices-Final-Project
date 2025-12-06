import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/stats-service/',
  server: {
    port: 3001,
    host: true
  }
});
