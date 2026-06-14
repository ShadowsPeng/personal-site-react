import { useEffect, useRef } from 'react'

// 全屏水波层：经典 height-field 水面算法（双缓冲 + 阻尼），鼠标经过处注入扰动。
// 垫在所有内容最底层（z-index:-1），深色留白处透出涟漪，图片/卡片等不透明区自然盖住 → 不在图片上显示。
export default function Ripple() {
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(hover: none)').matches) return   // 触屏不做

    const canvas = ref.current
    const ctx = canvas.getContext('2d', { alpha: false })
    const DAMP = 0.955             // 衰减更快，涟漪更快平息
    let W, H, prev, cur, img, raf
    let lastX = -1, lastY = -1     // 距离节流：走一段才滴一滴

    const resize = () => {
      const scale = Math.min(0.42, 540 / window.innerWidth)   // 降采样，放大后更柔和、省算力
      W = Math.max(1, Math.round(window.innerWidth  * scale))
      H = Math.max(1, Math.round(window.innerHeight * scale))
      canvas.width = W; canvas.height = H
      prev = new Float32Array(W * H)
      cur  = new Float32Array(W * H)
      img  = ctx.createImageData(W, H)
    }
    resize()

    const drop = (x, y, power) => {
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx, yy = y + dy
          if (xx > 0 && xx < W - 1 && yy > 0 && yy < H - 1) prev[yy * W + xx] += power
        }
    }
    const onMove = e => {
      if (lastX >= 0) {
        const dx = e.clientX - lastX, dy = e.clientY - lastY
        if (dx * dx + dy * dy < 30 * 30) return   // 移动不足 30px 不滴，避免连成一片
      }
      lastX = e.clientX; lastY = e.clientY
      const x = Math.round(e.clientX / window.innerWidth  * W)
      const y = Math.round(e.clientY / window.innerHeight * H)
      drop(x, y, 90)
    }

    const frame = () => {
      // 扩散一步
      for (let y = 1; y < H - 1; y++) {
        const row = y * W
        for (let x = 1; x < W - 1; x++) {
          const i = row + x
          let v = (prev[i - 1] + prev[i + 1] + prev[i - W] + prev[i + W]) * 0.5 - cur[i]
          cur[i] = v * DAMP
        }
      }
      const tmp = prev; prev = cur; cur = tmp   // 交换缓冲

      // 渲染：用波面斜率当高光，深背景上画出冷青色涟漪反光
      const d = img.data
      for (let y = 0; y < H; y++) {
        const row = y * W
        for (let x = 0; x < W; x++) {
          const i = row + x, p = i * 4
          const xo = (x > 0 && x < W - 1) ? prev[i - 1] - prev[i + 1] : 0
          const yo = (y > 0 && y < H - 1) ? prev[i - W] - prev[i + W] : 0
          const s = (xo + yo) * 0.42     // 高光整体调淡
          d[p]     = 11 + s * 0.4       // 基底 = 站点背景 #0b0b0a
          d[p + 1] = 11 + s * 0.7
          d[p + 2] = 10 + s * 1.0       // 偏青蓝高光
          d[p + 3] = 255
        }
      }
      ctx.putImageData(img, 0, 0)
      raf = requestAnimationFrame(frame)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className="ripple-canvas" aria-hidden="true" />
}
