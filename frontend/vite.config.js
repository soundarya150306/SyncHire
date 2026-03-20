import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // Force reload for Tailwind config changes
    server: {
        watch: {
            usePolling: true,
        },
    },
})
