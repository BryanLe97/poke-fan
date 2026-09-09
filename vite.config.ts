import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this project from https://<user>.github.io/poke-fan/,
  // so all built asset URLs need the repo name as a base path.
  base: '/poke-fan/',
  plugins: [react(), tailwindcss()],
})
