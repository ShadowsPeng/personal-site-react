import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sharp from 'sharp'

// 构建期图片优化：限宽 + 压缩，只作用于打包输出，src 里的原片一张不动。
// 36MB 原图 → 约 8-10MB，国内加载明显变快。
function optimizeImages({ maxWidth = 1920, quality = 80 } = {}) {
  return {
    name: 'optimize-images',
    apply: 'build',
    async generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type !== 'asset' || !/\.(jpe?g|png)$/i.test(file.fileName)) continue
        const input = Buffer.isBuffer(file.source) ? file.source : Buffer.from(file.source)
        try {
          let img = sharp(input).rotate() // 按 EXIF 自动转正
          const meta = await img.metadata()
          if (meta.width && meta.width > maxWidth) img = img.resize({ width: maxWidth })
          const out = /\.png$/i.test(file.fileName)
            ? await img.png({ quality, compressionLevel: 9 }).toBuffer()
            : await img.jpeg({ quality, mozjpeg: true }).toBuffer()
          if (out.length < input.length) file.source = out
        } catch { /* 单张失败则保留原图，不阻断构建 */ }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), optimizeImages({ maxWidth: 1600, quality: 70 })],
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
