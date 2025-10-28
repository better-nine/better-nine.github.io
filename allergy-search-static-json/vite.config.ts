import { defineConfig } from 'vite'

// For a user/organization GitHub Pages site (better-nine.github.io), base can stay '/'
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
