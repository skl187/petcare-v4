import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: 'named',
        namedExport: 'ReactComponent',
      },
    }),
  ],
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: ['portal.bracepetcare.app', 'www.portal.bracepetcare.app', 'localhost'],
    hmr: process.env.NODE_ENV === 'production' ? {
      host: 'portal.domain.app',
      port: 443,
      protocol: 'wss'
    } : undefined  
    },
});
