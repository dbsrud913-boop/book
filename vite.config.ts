import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 상대 경로 — GitHub Pages 하위 경로(/book/)에서도 동작
  base: './',
  plugins: [react()],
})
