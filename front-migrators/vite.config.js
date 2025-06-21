import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import basicSsl from '@vitejs/plugin-basic-ssl' // 1. Importa el plugin
import { visualizer } from 'rollup-plugin-visualizer'; // <-- 1. Importa


export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      vue(),
      basicSsl(), 
      visualizer({ open: true })
    ],
    server: {
      https: false, // 3. Habilita HTTPS
      host: '0.0.0.0',
      proxy: {
        '/api': {
          // El uso aquí es correcto y seguro
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: env.VITE_API_URL, // Apunta al mismo backend: http://localhost:5000
          changeOrigin: true,
          secure: false,
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom', 
      setupFiles: ['./src/setupTests.js'], 
      deps: {
        inline: ['@vue', '@vueuse'],
      },
    },
  };
};