import { defineConfig } from 'vite'
import { join } from "path"
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0'
  },
  resolve: {
    alias: {
      '@': join(__dirname, "src"),
    }
  }
})
