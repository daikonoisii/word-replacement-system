import { defineConfig } from 'vite'
import path from 'path';
import react from '@vitejs/plugin-react'
import officeAddin from 'vite-plugin-office-addin';
import basicSsl from '@vitejs/plugin-basic-ssl'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    basicSsl(),
    react(),
    officeAddin({
      devUrl: 'https://localhost:1234',
      prodUrl: 'https://<your>.github.io',
      path: 'manifest.xml'
    })
  ],
  server: {
    port: 1234
  },
  build: {
    outDir: 'dist',
    sourcemap: true // デバッグ用にソースマップ生成
  },
  resolve: {
  alias: { '@': path.resolve(__dirname, 'src') }
  }
})
