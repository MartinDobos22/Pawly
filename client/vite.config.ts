import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2022',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/system', '@mui/icons-material'],
          'mui-pickers': ['@mui/x-date-pickers', 'date-fns'],
          'firebase-vendor': ['firebase/app', 'firebase/auth'],
          'i18n-vendor': ['react-i18next', 'i18next'],
        },
      },
    },
  },
});
