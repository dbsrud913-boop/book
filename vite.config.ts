import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 상대 경로 — GitHub Pages 하위 경로(/book/)에서도 동작
  base: './',
  plugins: [react()],
  define: {
    // 설정 화면에 표시할 빌드 시각 (KST)
    __BUILD_TIME__: JSON.stringify(
      new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(5, 16).replace('T', ' '),
    ),
  },
})
