import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // O MapLibre (1,1 MB, ~300 kB comprimido) é o único arquivo acima de 500 kB e só carrega
    // na tela de rastreamento, sob demanda (01-plano.md, "Orçamento"). O aviso fica logo acima dele.
    chunkSizeWarningLimit: 1200,
    rolldownOptions: {
      output: {
        // GSAP e Lenis num arquivo à parte: nenhum passa dos 500 kB do aviso do Vite
        // e a biblioteca de efeitos fica em cache quando só o código do site muda.
        codeSplitting: {
          groups: [{ name: 'efeitos', test: /node_modules[\\/](gsap|@gsap|lenis)[\\/]/ }],
        },
      },
    },
  },
})
