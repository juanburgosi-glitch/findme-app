// vite.config.js
import { defineConfig } from 'vite';
import { htmlPartials } from 'vite-plugin-html-partials';
import path from 'path';

export default defineConfig({
  plugins: [
    htmlPartials({
      // Define la carpeta donde están tus "partes" de HTML
      partials: path.resolve(__dirname, './partials')
    })
  ],
});