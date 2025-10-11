// vite.config.js
import { defineConfig } from 'vite';
import { htmlPartials } from 'vite-plugin-html-partials';
import path from 'path';

export default defineConfig({
  plugins: [
    htmlPartials({
      // This tells Vite to look for partials in the 'partials' folder
      partials: path.resolve(__dirname, './partials')
    })
  ],
});