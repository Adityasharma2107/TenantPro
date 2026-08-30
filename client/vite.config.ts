import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Tailwind processes the shared TenantPro design tokens used across every screen.
  plugins: [react(), tailwindcss()],
})
