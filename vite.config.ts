import { defineConfig, ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import { IncomingMessage, ServerResponse } from 'http'

export default defineConfig({
  plugins: [
    react(),
    mkcert(),
    {
      name: 'wasm-mime-type',
      configureServer(server: ViteDevServer) {
        server.middlewares.use(
          (req: IncomingMessage, res: ServerResponse, next: () => void) => {
            if (req.url?.endsWith('.wasm')) {
              res.setHeader('Content-Type', 'application/wasm')
            }
            next()
          }
        )
      },
    },
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})
