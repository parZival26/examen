import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  base: '/examen/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'src/index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  assetsInclude: ['**/*.json']
})