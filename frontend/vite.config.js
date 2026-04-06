import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load .env variables for the current mode
  const env = loadEnv(mode, process.cwd(), '');

  const backendHost = env.VITE_BACKEND_HOST || '127.0.0.1';
  const backendPort = env.VITE_BACKEND_PORT || '8000';
  const backendTarget = `http://${backendHost}:${backendPort}`;

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});