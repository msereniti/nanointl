import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { nanointlVitePlugin } from '@nanointl/unplugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    nanointlVitePlugin({
      defaultLocale: 'en',
      localesDir: './src/locales',
    }),
  ],
});
