import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: ['chrome69', 'firefox69', 'safari13', 'edge79'],
  },
})
