import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Subcaminho do GitHub Pages (nome do repositorio). Se renomear o repositorio, troque aqui.
  base: '/app_ponto_central/',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    rolldownOptions: {
      output: {
        // Bibliotecas num arquivo separado: um deploy que so muda o app nao invalida o cache delas.
        codeSplitting: { groups: [{ name: 'vendor', test: /node_modules[\\/]/ }] },
      },
    },
  },
});
