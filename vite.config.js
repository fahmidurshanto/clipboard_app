import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.js',
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron', 'fs', 'path', 'child_process']
            }
          },
        },
      },
      // Preload is now handled manually to avoid build issues
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
