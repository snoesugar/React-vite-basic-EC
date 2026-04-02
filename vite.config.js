import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/React-vite-basic-EC/',
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
      },
    },
  },
})
