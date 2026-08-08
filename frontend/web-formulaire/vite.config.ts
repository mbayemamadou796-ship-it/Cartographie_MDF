import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    root: __dirname,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@assets': path.resolve(__dirname, '../../assets'),
        '@shared': path.resolve(__dirname, '../../shared'),
      },
    },
    server: {
      port: 3002,
      host: '0.0.0.0',
      // Le formulaire importe des services partagés depuis web-cartographie :
      // on autorise Vite à servir les fichiers de tout le monorepo.
      fs: { allow: [path.resolve(__dirname, '../..')] },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
