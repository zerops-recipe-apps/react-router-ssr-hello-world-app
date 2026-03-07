import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [reactRouter()],
  server: {
    // Reads PORT env var so dev server port matches run.envVariables PORT=3000
    port: parseInt(process.env.PORT ?? '3000'),
    host: '0.0.0.0',
  },
})
