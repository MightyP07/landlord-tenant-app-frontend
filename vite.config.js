import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    manifest: true, // keeps manifest for asset caching
  },
  plugins: [
    react(),
    // REMOVE VitePWA entirely
  ],
});
