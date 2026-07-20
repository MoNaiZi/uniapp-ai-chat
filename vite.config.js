import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    exclude: ['@xenova/transformers'],
  },
  assetsInclude: ['**/*.onnx', '**/*.bin'],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  resolve: {
    alias: {
      'onnxruntime-web': 'onnxruntime-web/dist/ort-web.min.js',
    },
  },
  define: {
    'process.env.NODE_ENV': '"development"',
    'process.env': {},
  },
})
