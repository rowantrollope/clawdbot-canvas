import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      'localhost',
      'ip-172-31-16-150.tail5d584c.ts.net',
      '.tail5d584c.ts.net'
    ]
  }
})
