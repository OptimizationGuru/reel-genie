import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';
export default defineConfig({
    plugins: [
        react(),
        mkcert(),
        {
            name: 'wasm-mime-type',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    var _a;
                    if ((_a = req.url) === null || _a === void 0 ? void 0 : _a.endsWith('.wasm')) {
                        res.setHeader('Content-Type', 'application/wasm');
                    }
                    next();
                });
            },
        },
    ],
    server: {
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
        },
    },
});
