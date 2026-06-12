import { useEffect, useRef, useState } from 'react'

const BASE = import.meta.env.BASE_URL

// ── 当前装备（2026.06）──────────────────────────────────
// 轮盘只显示图标/产品图：把产品图放到 public/gear/<id>.png 即可自动替换简笔图标
const BODIES = [
  { id: 'r62',     name: 'CANON R6 II' },
  { id: 'etrsi',   name: 'BRONICA ETRSI', film: true },
  { id: 'p67',     name: 'PENTAX 67',     film: true },
  { id: 'pocket3', name: 'DJI POCKET 3' },
  { id: 'action4', name: 'DJI ACTION 4' },
]

// 镜头轮盘只放真镜头（胶卷另挂到下面）
const GLASS = [
  { id: 'rf24105',  name: 'RF 24-105 F4 L' },
  { id: 'rf1530',   name: 'RF 15-30' },
  { id: 'rf200800', name: 'RF 200-800' },
  { id: 'mk85',     name: '美科 RF 85 F1.8' },
  { id: 'pe75',     name: 'ZENZANON PE 75 F2.8' },
  { id: 'p6790',    name: 'SMC 67 90 F2.8' },
  { id: 'builtin',  name: '内置镜头' },
]

// 胶片机身用的胶卷
const FILMS = {
  e100:     { name: '柯达 E100',      fmt: '120' },
  lucky200: { name: '乐凯 Lucky 200', fmt: '135' },
}
const FILM_OF = {
  etrsi: ['e100', 'lucky200'],
  p67:   ['e100', 'lucky200'],
}

// 「机身id+镜头id」→ 这对组合拍出的照片（从 gallery 真实文件名，不含扩展名）
const SHOTS = {
  'r62+rf200800': ['翠鸟_1', '翠鸟_15', '戴胜1_1', '红耳鹎_1', '黑枕黄鹂000091'],
  'r62+rf1530':   ['119_5', '119_7', '南浦大桥毕业', '日出'],
  'r62+rf24105':  ['张江双子塔_3', '南浦大桥悬日', '久安公寓114', '深圳138'],
  'r62+mk85':     ['333131', '岗厦北135', '台风前夕145'],
  'etrsi+pe75':   ['11000006', '11000008', '36400012', '61010008', '61010011'],
  'p67+p6790':    ['89190001', '89190004', '89190005'],
}
// ────────────────────────────────────────────────────────

// 产品图缺失时的简笔图标
const F = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }
const FALLBACK = {
  r62: (
    <svg width="86" height="58" viewBox="0 0 96 64" {...F}>
      <rect x="14" y="20" width="68" height="34" rx="6" />
      <rect x="36" y="12" width="24" height="8" rx="2" />
      <circle cx="48" cy="37" r="12" />
      <circle cx="48" cy="37" r="6" opacity=".5" />
      <circle cx="72" cy="28" r="2" />
    </svg>
  ),
  etrsi: (
    <svg width="86" height="58" viewBox="0 0 96 64" {...F}>
      <rect x="20" y="14" width="56" height="42" rx="3" />
      <circle cx="48" cy="36" r="14" />
      <circle cx="48" cy="36" r="8" opacity=".5" />
      <rect x="62" y="6" width="12" height="8" rx="2" />
    </svg>
  ),
  pocket3: (
    <svg width="86" height="58" viewBox="0 0 96 64" {...F}>
      <rect x="42" y="28" width="12" height="28" rx="3" />
      <circle cx="48" cy="16" r="9" />
      <circle cx="48" cy="16" r="3.5" opacity=".6" />
      <line x1="48" y1="25" x2="48" y2="28" />
    </svg>
  ),
  action4: (
    <svg width="86" height="58" viewBox="0 0 96 64" {...F}>
      <rect x="26" y="16" width="44" height="34" rx="7" />
      <circle cx="40" cy="33" r="9" />
      <circle cx="40" cy="33" r="4" opacity=".5" />
      <rect x="54" y="26" width="12" height="14" rx="2" opacity=".5" />
    </svg>
  ),
  rf24105: (
    <svg width="86" height="58" viewBox="0 0 96 64" {...F}>
      <rect x="12" y="24" width="8" height="16" />
      <rect x="20" y="20" width="38" height="24" rx="2" />
      <rect x="58" y="17" width="10" height="30" rx="2" />
      <line x1="30" y1="20" x2="30" y2="44" opacity=".4" />
      <line x1="44" y1="20" x2="44" y2="44" opacity=".4" />
    </svg>
  ),
  rf1530: (
    <svg width="86" height="58" viewBox="0 0 96 64" {...F}>
      <rect x="16" y="24" width="8" height="16" />
      <rect x="24" y="20" width="28" height="24" rx="2" />
      <ellipse cx="60" cy="32" rx="8" ry="15" />
    </svg>
  ),
  rf200800: (
    <svg width="86" height="58" viewBox="0 0 96 64" {...F}>
      <rect x="4" y="26" width="7" height="12" />
      <rect x="11" y="24" width="24" height="16" rx="1" />
      <rect x="35" y="20" width="30" height="24" rx="1" />
      <rect x="65" y="14" width="14" height="36" rx="2" />
      <path d="M30 40 v8 h14" opacity=".6" />
      <line x1="46" y1="20" x2="46" y2="44" opacity=".4" />
    </svg>
  ),
  mk85: (
    <svg width="86" height="58" viewBox="0 0 96 64" {...F}>
      <rect x="24" y="24" width="8" height="16" />
      <rect x="32" y="19" width="26" height="26" rx="2" />
      <rect x="58" y="22" width="8" height="20" rx="1" />
    </svg>
  ),
  p67: (
    <svg width="86" height="58" viewBox="0 0 96 64" {...F}>
      <rect x="16" y="22" width="58" height="34" rx="3" />
      <path d="M38 22 l6 -10 h16 l6 10" />
      <circle cx="45" cy="40" r="13" />
      <circle cx="45" cy="40" r="7" opacity=".5" />
      <rect x="72" y="26" width="11" height="22" rx="2" />
    </svg>
  ),
  pe75: (
    <svg width="86" height="58" viewBox="0 0 96 64" {...F}>
      <rect x="20" y="20" width="40" height="28" rx="3" />
      <rect x="60" y="24" width="14" height="20" rx="2" />
      <line x1="32" y1="20" x2="32" y2="48" opacity=".4" />
      <line x1="46" y1="20" x2="46" y2="48" opacity=".4" />
    </svg>
  ),
  p6790: (
    <svg width="86" height="58" viewBox="0 0 96 64" {...F}>
      <rect x="18" y="22" width="46" height="24" rx="3" />
      <rect x="64" y="26" width="13" height="16" rx="2" />
      <ellipse cx="30" cy="34" rx="4" ry="9" opacity=".4" />
      <line x1="44" y1="22" x2="44" y2="46" opacity=".4" />
    </svg>
  ),
  builtin: (
    <svg width="86" height="58" viewBox="0 0 96 64" {...F}>
      <circle cx="48" cy="32" r="17" />
      <circle cx="48" cy="32" r="10" opacity=".6" />
      <circle cx="48" cy="32" r="4" opacity=".4" />
    </svg>
  ),
}

// 胶卷罐图标
function FilmCan() {
  return (
    <svg width="34" height="46" viewBox="0 0 34 46" {...F} strokeWidth="2">
      <rect x="8" y="10" width="18" height="30" rx="3" />
      <rect x="13" y="4" width="8" height="6" rx="1.5" />
      <line x1="8" y1="18" x2="26" y2="18" opacity=".5" />
      <line x1="8" y1="32" x2="26" y2="32" opacity=".5" />
    </svg>
  )
}

function GearImg({ id }) {
  const [err, setErr] = useState(false)
  if (err) return <div className="g-fallback">{FALLBACK[id]}</div>
  return (
    <img
      className="g-img"
      src={`${BASE}gear/${id}.png`}
      alt=""
      loading="lazy"
      onError={() => setErr(true)}
    />
  )
}

function Reel({ items, sel, onSel }) {
  const ref = useRef(null)
  const raf = useRef(0)

  // 滚动时找离中心最近的一项作为选中
  const onScroll = () => {
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      const el = ref.current
      if (!el) return
      const center = el.scrollLeft + el.clientWidth / 2
      let best = null, bestD = Infinity
      for (const child of el.children) {
        const c = child.offsetLeft + child.offsetWidth / 2
        const d = Math.abs(c - center)
        if (d < bestD) { bestD = d; best = child.dataset.id }
      }
      if (best && best !== sel) onSel(best)
    })
  }

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  return (
    <div className="reel-wrap">
      <div className="reel" ref={ref} onScroll={onScroll}>
        {items.map(it => (
          <div
            key={it.id}
            data-id={it.id}
            className={`reel-item${sel === it.id ? ' on' : ''}`}
            title={it.name}
            onClick={e => e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })}
          >
            <div className="reel-box"><GearImg id={it.id} /></div>
            <span className="reel-name">{it.name}</span>
          </div>
        ))}
      </div>
      <div className="reel-marker" />
    </div>
  )
}

function getPhotoUrl(file, photoMap) {
  const p = photoMap?.[file]
  return p?.thumb || p?.url || `${BASE}photos/${file}.jpg`
}

export default function GearMatcher({ onOpen, photoMap }) {
  const [body, setBody]   = useState(BODIES[0].id)
  const [glass, setGlass] = useState(GLASS[0].id)

  const bodyDef  = BODIES.find(b => b.id === body)
  const glassDef = GLASS.find(g => g.id === glass)
  const files    = SHOTS[`${body}+${glass}`] || []

  return (
    <div className="gear-lab fade-up">
      <p className="gear-intro">滑动两条轮盘，把一台机身和一支镜头对进中间的取景框，看看这套组合拍出了什么。</p>

      <div className="gear-row-lbl">Body / 机身</div>
      <Reel items={BODIES} sel={body} onSel={setBody} />

      <div className="gear-row-lbl">Glass / 镜头</div>
      <Reel items={GLASS} sel={glass} onSel={setGlass} />

      {bodyDef.film && (
        <div className="film-strip">
          <div className="gear-row-lbl">Film / 胶卷</div>
          <div className="film-list">
            {FILM_OF[body].map(fid => (
              <div key={fid} className="film-chip">
                <FilmCan />
                <span className="film-name">{FILMS[fid].name}<em>{FILMS[fid].fmt}</em></span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="combo">
        <div className="combo-title">
          {bodyDef.name} × {glassDef.name}
          {files.length > 0 && ` · ${files.length} 张`}
        </div>
        {files.length > 0 ? (
          <div className="combo-strip">
            {files.map(f => (
              <figure key={f} className="combo-ph" onClick={() => onOpen(f)}>
                <img src={getPhotoUrl(f, photoMap)} alt="" loading="lazy" />
              </figure>
            ))}
          </div>
        ) : (
          <div className="combo-empty">Empty Roll — 这对组合还没出片</div>
        )}
      </div>
    </div>
  )
}
