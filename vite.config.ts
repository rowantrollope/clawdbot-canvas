import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import type { Plugin } from 'vite'
import { apiMiddleware } from './src/server/api.ts'

function apiPlugin(): Plugin {
  return {
    name: 'api-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        apiMiddleware(req, res, next);
      });
    },
    transformIndexHtml(html) {
      const token = process.env.CLAWDBOT_CANVAS_TOKEN;
      if (!token) return html;
      const escaped = token.replace(/[\\'"]/g, '\\$&');
      return html.replace(
        '</head>',
        `<script>window.__CLAWDBOT_TOKEN="${escaped}"</script>\n</head>`,
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api/calendar': 'http://localhost:3001',
      '/api/tasks': 'http://localhost:3001',
      '/api/crons': 'http://localhost:3001',
      '/api/health': 'http://localhost:3001',
    }
  }
})
