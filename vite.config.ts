import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3008/'
      },
    }
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src',
    }
  },
})