/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { resolve } from 'path';
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    setupFiles: ['./setup-tests'],
    environment: 'jsdom'
  },
  build: {
    minify: false,
    sourcemap: true,

    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      fileName: 'main',
      formats: ['es'],
    },

    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    },
  },

  plugins: [
    vue(),
    // Plugin to auto-publish the TypeScript library types.
    dts({ include: ['lib'], outDir: 'dist/types' })
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./lib', import.meta.url))
    }
  },
})
