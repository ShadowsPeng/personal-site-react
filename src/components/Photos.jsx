import { useCallback, useEffect, useRef, useState } from 'react'
import GearMatcher from './GearMatcher'

const BASE = import.meta.env.BASE_URL

// ── 板块图标（统一线性风格）──────────────────────────
const I = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
const ICONS = {
  city: (
    <svg viewBox="0 0 24 24" {...I}>
      <path d="M3 21V8l5-2.5V21" /><path d="M8 21V4l6 2.5V21" /><path d="M14 21V10l7 2.5V21" />
      <path d="M2 21h20" />
      <path d="M5 11h1M5 15h1M10.5 10h1.5M10.5 14h1.5M17 14h1.5" opacity=".5" />
    </svg>
  ),
  bird: (
    <svg viewBox="0 0 24 24" {...I}>
      <path d="M2 13c5 .5 7-2.5 8-6" /><path d="M10 7c1 3.5 3 5 6 5" />
      <path d="M16 12c2.5 0 4-1 6-3" /><path d="M10 7c0 7-1 10-3 13" />
    </svg>
  ),
  film: (
    <svg viewBox="0 0 24 24" {...I}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="7.5" y1="4" x2="7.5" y2="20" /><line x1="16.5" y1="4" x2="16.5" y2="20" />
      <path d="M3 8.5h4.5M3 15.5h4.5M16.5 8.5H21M16.5 15.5H21" opacity=".6" />
    </svg>
  ),
  firework: (
    <svg viewBox="0 0 24 24" {...I}>
      <line x1="12" y1="2.5" x2="12" y2="7" /><line x1="12" y1="17" x2="12" y2="21.5" />
      <line x1="2.5" y1="12" x2="7" y2="12" /><line x1="17" y1="12" x2="21.5" y2="12" />
      <line x1="5.4" y1="5.4" x2="8.5" y2="8.5" /><line x1="15.5" y1="15.5" x2="18.6" y2="18.6" />
      <line x1="18.6" y1="5.4" x2="15.5" y2="8.5" /><line x1="8.5" y1="15.5" x2="5.4" y2="18.6" />
      <circle cx="12" cy="12" r="1.2" />
    </svg>
  ),
  live: (
    <svg viewBox="0 0 24 24" {...I}>
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5.5 10.5a6.5 6.5 0 0 0 13 0" />
      <line x1="12" y1="17" x2="12" y2="21.5" /><line x1="8" y1="21.5" x2="16" y2="21.5" />
    </svg>
  ),
  style: (
    <svg viewBox="0 0 24 24" {...I}>
      <circle cx="12" cy="7.5" r="4" />
      <path d="M4.5 21c0-4.5 3.4-7 7.5-7s7.5 2.5 7.5 7" />
    </svg>
  ),
}

// ── 板块定义（图片从 src/gallery/<id>/ 自动读取，丢图即出）──
const META = [
  { id: 'city',     title: '城市风光', en: 'Cityscape',  icon: 'city' },
  { id: 'bird',     title: '鸟类',     en: 'Birds',      icon: 'bird' },
  { id: 'film',     title: '胶片',     en: 'Film',       icon: 'film' },
  { id: 'firework', title: '烟花',     en: 'Fireworks',  icon: 'firework' },
  { id: 'live',     title: '演唱会',   en: 'Live',       icon: 'live' },
  { id: 'man',      title: '风格',     en: 'Style',      icon: 'style' },
]

// 从文件名衍生说明（去掉数字后缀/前缀，保留中文关键词）
const captionOf = (base) => {
  let s = base
    .replace(/^[A-Z\d]+[-_]/i, '')        // 去型号前缀 (NE2A8107_ 等)
    .replace(/[-_]?\d{5,}$/, '')          // 去末尾长数字 (000091)
    .replace(/[-_]?\d{3,4}$/, '')         // 去末尾短数字 (_12)
    .replace(/^0+(\d{3,})$/, '$1')        // 去前导零
    .replace(/[_-]/g, ' ')                // 下划线→空格
    .replace(/\s+\d{1,2}$/, '')           // 去空格+数字后缀
    .trim()
  if (!s || /^\d+$/.test(s)) s = base     // 纯数字→保留原名
  return s
}

// 扫描 src/gallery/<cat>/*.{jpg,jpeg,png}（eager → 构建期解析，丢图刷新即生效）
// FULLS：lightbox 大图，2560px WebP q85（清晰度肉眼无损，比原 jpeg 省 ~35%、点开更快）。
// THUMBS：720px WebP q78 缩略图（网格用，小而清晰、加载快）。
const FULLS  = import.meta.glob('../gallery/*/*.{jpg,jpeg,JPG,JPEG,png,PNG}', { eager: true, query: '?w=2560&quality=85&format=webp', import: 'default' })
const THUMBS = import.meta.glob('../gallery/*/*.{jpg,jpeg,JPG,JPEG,png,PNG}', { eager: true, query: '?w=720&quality=78&format=webp', import: 'default' })

const GALLERY = (() => {
  const byCat = {}
  for (const path in FULLS) {
    const m = path.match(/gallery\/([^/]+)\/([^/]+)\.\w+$/)
    if (!m) continue
    const [, cat, base] = m
    ;(byCat[cat] ||= []).push({ base, url: FULLS[path], thumb: THUMBS[path] || FULLS[path], caption: captionOf(base) })
  }
  for (const cat in byCat) byCat[cat].sort((a, b) => a.base.localeCompare(b.base))
  return byCat
})()

const CATEGORIES = META.map(c => {
  const photos = (GALLERY[c.id] || []).map(p => ({ file: p.base, url: p.url, thumb: p.thumb, caption: p.caption }))
  return { ...c, photos }
})

const PHOTO_BY_FILE = Object.fromEntries(
  CATEGORIES.flatMap(c => c.photos).map(p => [p.file, p])
)

// 可缩放 / 翻页 lightbox
function Lightbox({ list, idx, setActive, onClose }) {
  const [z, setZ] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const drag = useRef(null)
  const p = list[idx]
  const single = list.length <= 1

  const navRef = useRef(d => setActive(a => ({ ...a, idx: (a.idx + d + list.length) % list.length })))
  useEffect(() => { navRef.current = d => setActive(a => ({ ...a, idx: (a.idx + d + list.length) % list.length })) })
  const zoomRef = useRef(d => setZ(v => Math.min(4, Math.max(1, +(v + d).toFixed(2)))))
  useEffect(() => { zoomRef.current = d => setZ(v => Math.min(4, Math.max(1, +(v + d).toFixed(2)))) })
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })

  useEffect(() => { setZ(1); setPan({ x: 0, y: 0 }) }, [idx])
  useEffect(() => { if (z <= 1) setPan({ x: 0, y: 0 }) }, [z])
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onCloseRef.current()
      else if (e.key === 'ArrowRight') navRef.current(1)
      else if (e.key === 'ArrowLeft') navRef.current(-1)
      else if (e.key === '+' || e.key === '=') zoomRef.current(0.3)
      else if (e.key === '-' || e.key === '_') zoomRef.current(-0.3)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onWheel = e => zoomRef.current(-e.deltaY * 0.0016)
  const onDown = e => { if (z > 1) drag.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y } }
  const onMove = e => { if (drag.current) setPan({ x: drag.current.px + e.clientX - drag.current.sx, y: drag.current.py + e.clientY - drag.current.sy }) }
  const onUp = () => { drag.current = null }

  return (
    <div className="lightbox open" onClick={onClose} onMouseMove={onMove} onMouseUp={onUp} role="dialog" aria-modal="true">
      <button className="lb-x" aria-label="关闭" onClick={onClose}>&times;</button>
      {!single && <button className="lb-nav lb-prev" aria-label="上一张" onClick={e => { e.stopPropagation(); navRef.current(-1) }}>‹</button>}
      {!single && <button className="lb-nav lb-next" aria-label="下一张" onClick={e => { e.stopPropagation(); navRef.current(1) }}>›</button>}
      <div className="lb-stage" onClick={e => e.stopPropagation()} onWheel={onWheel} onMouseDown={onDown}>
        <img
          className="lightbox-img" src={p.url || `${BASE}photos/${p.file}.jpg`} alt={p.caption} draggable={false}
          onDoubleClick={() => setZ(z > 1 ? 1 : 2)}
          style={{ transform: `translate(${pan.x}px,${pan.y}px) scale(${z})`, cursor: z > 1 ? 'grab' : 'zoom-in' }}
        />
      </div>
      <div className="lb-bar" onClick={e => e.stopPropagation()}>
        <button onClick={() => zoomRef.current(-0.3)} aria-label="缩小">−</button>
        <span>{Math.round(z * 100)}%</span>
        <button onClick={() => zoomRef.current(0.3)} aria-label="放大">+</button>
      </div>
      {(p.caption || !single) && (
        <div className="lightbox-cap">{p.caption}{!single && <em> · {idx + 1} / {list.length}</em>}</div>
      )}
    </div>
  )
}

// 鼠标位置 → 卡片 3D 倾斜 + 光泽点位。直接写元素 style，不触发 React 重渲染。
const TILT_OK = typeof window !== 'undefined'
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  && !window.matchMedia('(hover: none)').matches
const onTilt = e => {
  if (!TILT_OK) return
  const el = e.currentTarget, r = el.getBoundingClientRect()
  const px = (e.clientX - r.left) / r.width  - 0.5   // -0.5 ~ 0.5
  const py = (e.clientY - r.top)  / r.height - 0.5
  el.style.setProperty('--ry', `${(px * 11).toFixed(2)}deg`)
  el.style.setProperty('--rx', `${(-py * 11).toFixed(2)}deg`)
  el.style.setProperty('--gx', `${((px + 0.5) * 100).toFixed(1)}%`)
  el.style.setProperty('--gy', `${((py + 0.5) * 100).toFixed(1)}%`)
}
const onTiltLeave = e => {
  const el = e.currentTarget
  el.style.setProperty('--rx', '0deg')
  el.style.setProperty('--ry', '0deg')
}

export default function Photos() {
  const ref = useRef(null)
  const [active, setActive] = useState(null)   // { list, idx } | null
  // 统一图集的当前筛选：按类型(cat) 或 按器材(gear)
  const [sel, setSel] = useState({ type: 'cat', id: CATEGORIES[0].id })

  // 器材组装完成 → 把该组合的照片喂给同一个网格
  const onGear = useCallback(({ key, files, title }) => {
    const photos = files.map(f => PHOTO_BY_FILE[f]).filter(Boolean)
    setSel({ type: 'gear', key, title, photos })
  }, [])

  const gridPhotos = sel.type === 'gear'
    ? sel.photos
    : (CATEGORIES.find(c => c.id === sel.id)?.photos || [])
  const gridKey = sel.type === 'gear' ? `gear:${sel.key}` : sel.id

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) } })
    }, { threshold: 0.06 })
    ref.current?.querySelectorAll('.fade-up').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section className="section" id="photos" ref={ref}>
      <div className="sec-label">摄影</div>

      {/* 器材组装台（按器材筛选）*/}
      <GearMatcher onSelect={onGear} />

      {/* 分类导航（按类型筛选，hover/点击即切换；与器材筛选共用下方同一个图集）*/}
      <nav className="cat-nav fade-up">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            className={`cat-tab${sel.type === 'cat' && sel.id === c.id ? ' on' : ''}`}
            onMouseEnter={() => setSel({ type: 'cat', id: c.id })}
            onClick={() => setSel({ type: 'cat', id: c.id })}
          >
            <span className="cat-tab-ico">{ICONS[c.icon]}</span>
            <span className="cat-tab-txt">{c.title}</span>
            <span className="cat-tab-num">{c.photos.length}</span>
          </button>
        ))}
      </nav>

      {/* 器材组合的结果标题 */}
      {sel.type === 'gear' && (
        <div className="gear-result fade-up">
          <span className="gr-title">{sel.title}</span>
          <em className="gr-sub">{sel.photos.length > 0 ? `${sel.photos.length} 张` : 'Empty Roll · 这套组合还没出片'}</em>
        </div>
      )}

      {/* 统一正方形网格 */}
      {gridPhotos.length > 0 ? (
        <div className="sq-grid" key={gridKey}>
          {gridPhotos.map((p, i) => (
            <figure
              key={p.file} className="sq-item"
              onMouseMove={onTilt} onMouseLeave={onTiltLeave}
              onClick={() => setActive({ list: gridPhotos, idx: i })}
            >
              <img src={p.thumb} alt={p.caption} loading="lazy" />
              {p.caption && <figcaption className="sq-cap">{p.caption}</figcaption>}
            </figure>
          ))}
        </div>
      ) : (
        <div className="cat-empty">{sel.type === 'gear' ? 'Empty Roll · 这套组合还没出片' : '敬请期待 · Coming soon'}</div>
      )}

      {active && <Lightbox list={active.list} idx={active.idx} setActive={setActive} onClose={() => setActive(null)} />}
    </section>
  )
}
