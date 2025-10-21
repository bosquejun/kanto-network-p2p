import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr({
      svgrOptions: {
        svgo: false // Disable SVGO to preserve animations
      }
    }),
    viteStaticCopy({
      targets: [
        {
          src: './pear.js',
          dest: './engine'
        }
      ]
    })
    // visualizer({ open: true }) // Open report after build
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: './',
  build: {
    chunkSizeWarningLimit: 1000,
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      mangle: {
        reserved: ['Pear']
      }
    },

    rollupOptions: {
      output: {
        entryFileNames: 'app.[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
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
        'pear-messages',
        'corestore',
        'hypercore',
        'hyperswarm'
      ]
    }
  }
})
