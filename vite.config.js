import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
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
