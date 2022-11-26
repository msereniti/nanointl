import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nanointlVitePlugin } from '@nanointl/unplugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nanointlVitePlugin({
      defaultLocale: 'en',
      localesDir: './src/locales',
    }),
  ],
});
