import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// La configuración es una función para poder leer `mode`: `loadEnv` lo necesita
// para saber si toca `.env.development` o `.env.production`.
export default defineConfig(({ mode }) => {
  // Vite expone las variables al navegador como `import.meta.env`, pero este
  // archivo corre en Node antes de eso y ahí `process.env` NO tiene nada de los
  // `.env`: hay que cargarlos a mano. Sin esto, poner VITE_API_ORIGEN en un
  // `.env.local` no hacía nada y el proxy se iba igual contra producción.
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  // La variable de entorno del shell manda sobre el archivo, que es lo que uno
  // espera al hacer `VITE_API_ORIGEN=... npm run dev` para una prueba suelta.
  const origenApi =
    process.env.VITE_API_ORIGEN || env.VITE_API_ORIGEN || 'https://fondefos.com.co'

  return {
    plugins: [react(), tailwindcss()],
    build: {
      // Emit every brand font as a hashed file (design D3: "Vite hashes into dist/assets").
      // Default 4096-byte inline limit would base64-embed the 3.9 KB greek-ext subset.
      assetsInlineLimit: 0,
    },
    test: {
      // jsdom solo donde hace falta: las pruebas de src/lib son de lógica pura y
      // no necesitan DOM. Se elige por archivo con la anotación
      // `// @vitest-environment jsdom`.
      environment: 'node',
    },
    server: {
      // En desarrollo el SPA corre en localhost y el endpoint puede estar en el
      // hosting o en un PHP local. El proxy los pone bajo el mismo origen: sin
      // CORS y sin depender del dominio de producción para probar.
      proxy: {
        '/api': {
          target: origenApi,
          changeOrigin: true,
          // Solo aplica a destinos https. Verificar el certificado es lo
          // correcto contra el hosting; contra un http://localhost no estorba.
          secure: true,
        },
      },
    },
  }
})
