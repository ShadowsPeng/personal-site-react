import { useEffect, useRef, useState } from 'react'

const BASE = import.meta.env.BASE_URL

// 首屏延时视频（已转码为 1080p 网页背景）
const VIDS = ['t5.mp4', 't4.mp4', 't1.mp4', 't2.mp4', 't3.mp4']
// 视频不可用时的图片轮播兜底（降低动效 / 省流量 / 旧设备）
const SHOTS = ['dusk.jpg', 'city-lujiazui.jpg', 'sunrise.jpg', 'firework-disney-01.jpg', 'city-nanpu.jpg']
const POSTER = 'photos/dusk.jpg'

// 是否走图片兜底：降低动效 / 省流量 → 用图片（手机端照常放延时视频）
const useFallback = () => {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
  if (navigator.connection?.saveData) return true
  return false
}

export default function Hero() {
  const videoRef = useRef(null)
  const [fallback] = useState(useFallback)
  const [idx, setIdx] = useState(0)
  const [ready, setReady] = useState(false)   // 当前视频可播 → 淡入

  const list = fallback ? SHOTS : VIDS

  // 图片兜底模式：定时切换
  useEffect(() => {
    if (!fallback) return
    const t = setInterval(() => setIdx(i => (i + 1) % SHOTS.length), 5200)
    return () => clearInterval(t)
  }, [fallback])

  // 切到新视频时先隐藏，等可播再淡入；并用 ref 强制 muted + 主动 play
  // （React 不保证把 muted 写进 DOM，iOS 会因此拒绝自动播放）
  useEffect(() => {
    if (fallback) return
    setReady(false)
    const v = videoRef.current
    if (!v) return
    v.muted = true
    v.play()?.catch(() => {})
  }, [idx, fallback])

  return (
    <div className="hero">
      <div className="hero-bg">
        {fallback ? (
          // 单图轮播：只挂当前张，首屏只下 1 张（5 张全挂会一次性全加载，手机白等）
          <img src={`${BASE}photos/${SHOTS[idx]}`} alt="" className="on" />
        ) : (
          <>
            <img className="hero-poster" src={`${BASE}${POSTER}`} alt="" />
            <video
              key={VIDS[idx]} ref={videoRef}
              className={`hero-video${ready ? ' on' : ''}`}
              src={`${BASE}hero/${VIDS[idx]}`} poster={`${BASE}${POSTER}`}
              autoPlay muted playsInline preload="auto"
              onCanPlay={() => setReady(true)}
              onEnded={() => setIdx(i => (i + 1) % VIDS.length)}
            />
          </>
        )}
      </div>

      <div className="hero-inner">
        <div className="hero-eyebrow">Product Manager · Music · Photography</div>
        <h1 className="hero-name">Shadows<span className="hero-name-cn">芃</span></h1>
        <div className="hero-rule" />
        <div className="hero-sub"><em>Shanghai · 上海</em></div>
        <p className="hero-desc">
          用产品思维理解世界，用镜头和音符感受生活。
        </p>
      </div>

      {/* 左下编辑式小字（右下与音乐播放器冲突，已移除）*/}
      <div className="hero-corner hero-bl">
        <strong>500+</strong>
        <span>影像记录 · Frames</span>
      </div>

      {/* 轮播指示 */}
      <div className="hero-dots">
        {list.map((_, i) => (
          <button
            key={i} className={`hero-dot${i === idx ? ' on' : ''}`}
            aria-label={`第 ${i + 1} 段`} onClick={() => setIdx(i)}
          />
        ))}
      </div>
    </div>
  )
}
