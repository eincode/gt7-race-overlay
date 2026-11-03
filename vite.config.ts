import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const allowedHosts = ['overlay.pagurismo.com'];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Proxy the relay server through Vite under /relay so the browser talks to
  // the same origin (works behind HTTPS/Cloudflare: https → wss, no port 3000).
  const proxy = {
    '/relay': {
      target: env.RELAY_TARGET || 'http://localhost:3000',
      changeOrigin: true,
      ws: true,
      rewrite: (path: string) => path.replace(/^\/relay/, ''),
    },
  };

  return {
    plugins: [react(), tailwindcss()],
    server: { allowedHosts, proxy },
    preview: { allowedHosts, proxy },
  };
});
