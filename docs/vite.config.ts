/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  root: './docs',
  build: {
    outDir: '../dist/docs',
    rollupOptions: {
      input: './docs/index.html',
    },
  },

  plugins: [vue()],
})
