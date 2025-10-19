import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: './pear.js',
          dest: './engine'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.url, './src')
    }
  },
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
    minify: true,
    rollupOptions: {
      output: {
        entryFileNames: 'app.js',
        preserveModules: false
      },
      external: [
        'util',
        'fs',
        'path',
        'url',
        'net',
        'tls',
        'http',
        'https',
        'events',
        'tty',
        'pear-pipe',
        'pear-updates',
        'pear-electron',
        'pear-bridge',
        'pear-messages'
      ]
    }
  }
})
