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
      entry: {
        main: resolve(__dirname, 'lib/main.ts'),
        eslint: resolve(__dirname, 'lib/eslint/index.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },

    rollupOptions: {
      external: ["vue", "eslint", "node:fs", "node:path", "fs", "path"],
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
