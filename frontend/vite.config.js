import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Emit every brand font as a hashed file (design D3: "Vite hashes into dist/assets").
    // Default 4096-byte inline limit would base64-embed the 3.9 KB greek-ext subset.
    assetsInlineLimit: 0,
  },
  server: {
    // En desarrollo el SPA corre en localhost y el endpoint vive en el hosting.
    // El proxy los pone bajo el mismo origen: sin CORS y sin PHP local.
    proxy: {
      '/api': {
        target: process.env.VITE_API_ORIGEN || 'https://fondefos.com.co',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
