import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Runs on 5174 so it can run alongside 5173 without conflict!
  },
});
