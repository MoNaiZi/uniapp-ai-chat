import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    exclude: ['@huggingface/transformers'],
  },
  assetsInclude: ['**/*.onnx', '**/*.bin', '**/*.wasm'],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  define: {
    'process.env.NODE_ENV': '"development"',
    'process.env': {},
  },
})
