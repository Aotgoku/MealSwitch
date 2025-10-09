import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // --- ADD THIS ENTIRE SECTION ---
  optimizeDeps: {
    include: ['jspdf'],
  },
  // --- END OF NEW SECTION ---
})