import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  if (command === 'build') {
    return {
      plugins: [react()],
      server: {
        host: true,
        port: 5173,
        watch: {
          usePolling: true
        }
      },
      build: {
        rollupOptions: {
          output: {
            entryFileNames: 'app.js',
            assetFileNames: 'app.css',
            chunkFileNames: 'chunk.js',
            manualChunks: undefined,
          }
        }
      },
    }
  }
  else {
    return {
      plugins: [react()],
      server: {
        host: true,
        port: 5173,
        watch: {
          usePolling: true
        }
      },
    }
  }
})
