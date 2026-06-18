import { useEffect, useRef, useState } from 'react'
import SHOTS from '../gearShots.json'   // 由 EXIF 自动生成的「相机+镜头+胶片 → 照片」映射

const BASE = import.meta.env.BASE_URL

// ── 当前装备（2026.06）──────────────────────────────────
// 轮盘只显示图标/产品图：把产品图放到 public/gear/<id>.png 即可自动替换简笔图标
const BODIES = [
  { id: 'r62',     name: 'CANON R6 II' },
  { id: 'etrsi',   name: 'BRONICA ETRSI', film: true },
  { id: 'p67',     name: 'PENTAX 67',     film: true },
]

// 镜头轮盘只放真镜头（胶卷另挂到下面）
const GLASS = [
  { id: 'rf24105',  name: 'RF 24-105 F4 L' },
  { id: 'rf1530',   name: 'RF 15-30' },
  { id: 'rf200800', name: 'RF 200-800' },
  { id: 'pe75',     name: 'ZENZANON PE 75 F2.8' },
  { id: 'p6790',    name: 'SMC 67 90 F2.8' },
]

// 胶片机身用的胶卷
const FILMS = {
  e100: { name: '柯达 E100',  fmt: '120' },
  c200: { name: '乐凯 C200',  fmt: '135' },
}
const FILM_OF = {
  etrsi: ['e100', 'c200'],   // ETRSI 拍过 E100 和 老乐凯 C200
  p67:   ['e100'],           // 宾得67 只有 E100
}

// 组合键：数码机身 = 「机身+镜头」；胶片机身 = 「机身+镜头+胶卷」。
// 映射在 src/gearShots.json，由 EXIF 焦段(数码就近分到 RF15-30/24-105/200-800)+ F:\胶片 文件夹(胶片)自动生成。
// 重新生成：见 project 记忆里的脚本。
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

function FilmImg({ id }) {
  const [err, setErr] = useState(false)
  if (err) return <FilmCan />
  return (
    <img
      className="film-img"
      src={`${BASE}gear/${id}.png`}
      alt=""
      loading="lazy"
      onError={() => setErr(true)}
    />
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
      draggable={false}
      onError={() => setErr(true)}
    />
  )
}

// 取景台里的小人摄影师：idle→站着；shooting/done→举机到脸前拍一张
function Photographer({ phase }) {
  return (
    <svg className={`tog tog-${phase}`} viewBox="0 0 200 160" width="190" height="152" aria-hidden="true">
      <ellipse className="tog-shadow" cx="92" cy="150" rx="42" ry="6" />
      {/* 腿 + 躯干 + 头 */}
      <path className="tog-line" d="M84 104 L74 140 M100 104 L110 140" />
      <path className="tog-line" d="M92 62 L92 106" />
      <circle className="tog-line" cx="92" cy="50" r="13" />
      {/* 手臂 + 相机（拍摄时整体上抬到脸前）*/}
      <g className="tog-cam">
        <path className="tog-line" d="M92 70 L70 86 M92 70 L120 86" />
        <rect className="tog-body" x="66" y="80" width="58" height="33" rx="5" />
        <rect className="tog-body" x="86" y="73" width="18" height="9" rx="2" />
        <circle className="tog-lens"  cx="95" cy="96" r="13" />
        <circle className="tog-lensi" cx="95" cy="96" r="6" />
      </g>
      {/* 快门火花 */}
      <g className="tog-spark">
        <line x1="138" y1="70" x2="151" y2="63" /><line x1="141" y1="82" x2="156" y2="82" /><line x1="138" y1="94" x2="151" y2="101" />
      </g>
    </svg>
  )
}

// 推箱子组装台：把机身格 + 镜头格拖（或点）进右侧取景台 → 小人组装 + 拍一张 → 回传该组合的照片
export default function GearMatcher({ onSelect }) {
  const [slotBody, setSlotBody]   = useState(null)
  const [slotGlass, setSlotGlass] = useState(null)
  const [film, setFilm]   = useState('e100')
  const [phase, setPhase] = useState('idle')   // idle | assembling | shooting | done
  const [ghost, setGhost] = useState(null)     // 拖拽时跟手的虚影
  const zoneRef = useRef(null)

  const bodyDef  = slotBody  ? BODIES.find(b => b.id === slotBody) : null
  const glassDef = slotGlass ? GLASS.find(g => g.id === slotGlass) : null
  const isFilm   = !!bodyDef?.film
  const films    = isFilm ? (FILM_OF[slotBody] || []) : []
  const curFilm  = films.includes(film) ? film : films[0]
  const ready    = !!(slotBody && slotGlass)
  const comboKey = isFilm ? `${slotBody}+${slotGlass}+${curFilm}` : `${slotBody}+${slotGlass}`
  const files    = ready ? (SHOTS[comboKey] || []) : []

  const onSelRef = useRef(onSelect)
  useEffect(() => { onSelRef.current = onSelect })

  // 机身+镜头都就位 → 组装(0.85s) → 拍摄(0.65s) → 出片
  useEffect(() => {
    if (!ready) { setPhase('idle'); return }
    setPhase('assembling')
    const t1 = setTimeout(() => setPhase('shooting'), 850)
    const t2 = setTimeout(() => {
      setPhase('done')
      const title = `${bodyDef.name} × ${glassDef.name}${isFilm && curFilm ? ` × ${FILMS[curFilm].name}` : ''}`
      onSelRef.current?.({ key: comboKey, files, title })
    }, 1500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comboKey, ready])

  const assign = (kind, id) => kind === 'body' ? setSlotBody(id) : setSlotGlass(id)

  // 兜底：任何指针抬起/取消/失焦都清掉跟手虚影（防 pointercancel 导致虚影卡住）
  useEffect(() => {
    const clear = () => setGhost(null)
    window.addEventListener('pointerup', clear)
    window.addEventListener('pointercancel', clear)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('pointerup', clear)
      window.removeEventListener('pointercancel', clear)
      window.removeEventListener('blur', clear)
    }
  }, [])

  // 指针拖拽（兼容触摸）：拖动过就算选中(不强求精确落在框内)；纯点击由 onClick 兜底
  const startDrag = (kind, id) => e => {
    const sx = e.clientX, sy = e.clientY
    let moved = false
    const move = ev => {
      if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 5) moved = true
      if (moved) setGhost({ id, x: ev.clientX, y: ev.clientY })
    }
    const end = (ev, cancelled) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
      setGhost(null)
      if (!cancelled && moved) assign(kind, id)   // 拖动结束 = 选中；取消/没拖动则不选
    }
    const up = ev => end(ev, false)
    const cancel = ev => end(ev, true)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
  }

  const reset = () => { setSlotBody(null); setSlotGlass(null); setPhase('idle') }

  // 内联渲染一个器材格（不抽成内部组件，否则每次 render 会整组卸载重建）
  const renderTile = (kind, def) => {
    const used = (kind === 'body' ? slotBody : slotGlass) === def.id
    return (
      <button
        key={def.id}
        type="button"
        className={`gear-tile${used ? ' used' : ''}`}
        onPointerDown={startDrag(kind, def.id)}
        onClick={() => assign(kind, def.id)}
        title={`${def.name} — 拖进取景台，或点一下`}
      >
        <span className="tile-pic"><GearImg id={def.id} /></span>
        <span className="tile-name">{def.name}</span>
      </button>
    )
  }

  return (
    <div className="gear-lab fade-up">
      <p className="gear-intro">把一台机身和一支镜头拖进右边的取景台（点一下也行），小人会替你装好、拍一张——看看这套组合拍了什么。</p>

      <div className="gear-assembler">
        {/* 左：器材货架 */}
        <div className="gear-shelf">
          <div className="gear-row-lbl">Body / 机身</div>
          <div className="tile-row">{BODIES.map(b => renderTile('body', b))}</div>

          <div className="gear-row-lbl">Glass / 镜头</div>
          <div className="tile-row">{GLASS.map(g => renderTile('lens', g))}</div>

          {isFilm && (
            <>
              <div className="gear-row-lbl">Film / 胶卷</div>
              <div className="film-list">
                {films.map(fid => (
                  <button
                    key={fid}
                    type="button"
                    className={`film-chip${fid === curFilm ? ' on' : ''}`}
                    onClick={() => setFilm(fid)}
                  >
                    <FilmImg id={fid} />
                    <span className="film-name">{FILMS[fid].name}<em>{FILMS[fid].fmt}</em></span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 右：取景台 + 小人 */}
        <div ref={zoneRef} className={`viewfinder is-${phase}${ready ? ' ready' : ''}`}>
          <div className="vf-head">取景台 / Studio</div>
          <div className="vf-slots">
            <div className={`vf-slot${slotBody ? ' filled' : ''}`}>
              {slotBody ? <GearImg id={slotBody} /> : <span className="vf-ph">机身</span>}
            </div>
            <span className="vf-plus">＋</span>
            <div className={`vf-slot${slotGlass ? ' filled' : ''}`}>
              {slotGlass ? <GearImg id={slotGlass} /> : <span className="vf-ph">镜头</span>}
            </div>
          </div>
          <div className="vf-stage">
            <Photographer phase={phase} />
            <div className="vf-flash" />
          </div>
          <div className="vf-foot">
            {!ready
              ? <span className="vf-hint">把机身 + 镜头拖进来</span>
              : phase === 'done'
                ? <button type="button" className="vf-reset" onClick={reset}>换一套 ↺</button>
                : <span className="vf-hint">组装中…</span>}
          </div>
        </div>
      </div>

      {ghost && (
        <div className="drag-ghost" style={{ left: ghost.x, top: ghost.y }}>
          <GearImg id={ghost.id} />
        </div>
      )}
    </div>
  )
}
