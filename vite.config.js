import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' keeps asset paths relative so the build works on GitHub Pages
// (served from /<repo>/) as well as Netlify (served from /).
export default defineConfig({
  plugins: [react()],
  base: './',
})
