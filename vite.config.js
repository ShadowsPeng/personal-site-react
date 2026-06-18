import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  // imagetools：带 ?w/?format query 的图片 import 会被生成缩略图；
  // 不带 query 的 ?url import 保持原图原画质（lightbox 用）。
  plugins: [react(), imagetools(), cloudflare()],
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