import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Windows 上往 src/gallery 拷图时，原生监听会因文件被占用(EBUSY)崩溃。
      // 用轮询 + 等待写入完成，拷贝大图不再让 dev server 挂掉。
      usePolling: true,
      interval: 300,
      awaitWriteFinish: { stabilityThreshold: 600, pollInterval: 100 },
    },
  },
})
