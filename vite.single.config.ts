import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// 미리보기/공유용 단일 HTML 파일 빌드
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-single',
  },
  define: {
    __BUILD_TIME__: JSON.stringify(
      new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(5, 16).replace('T', ' '),
    ),
  },
})
