import { useEffect, useRef, useReducer, useCallback, useState } from 'react'

// ─── constants ────────────────────────────────────────
const BPM = 95
const STEM_BASE = `${import.meta.env.BASE_URL}stems`

const TRACKS = [
  { id: 'vocals', name: '主唱',   color: '#5cd6ff', pos: { left: '50%', top: '70%' } },
  { id: 'guitar', name: '吉他',   color: '#5cf0a8', pos: { left: '27%', top: '64%' } },
  { id: 'bass',   name: '贝斯',   color: '#7d92ff', pos: { left: '73%', top: '64%' } },
  { id: 'drums',  name: '鼓手',   color: '#ff6fb0', pos: { left: '50%', top: '30%' } },
  { id: 'piano',  name: '键盘',   color: '#ffd166', pos: { left: '20%', top: '34%' } },
  { id: 'other',  name: '合成器', color: '#c98bff', pos: { left: '80%', top: '34%' } },
]

// ─── 霓虹乐手（深色 + 发光线条 + HUD 面罩，赛博舞台风）──
const SUIT  = '#1b2230'   // 深色机体
const STEEL = '#2c3646'   // 装甲高光
const DARK  = '#11161f'   // 暗部

const Head = ({ color }) => (
  <g className="g-head">
    <circle cx="60" cy="42" r="25" fill={SUIT} stroke={color} strokeWidth="2.2" />
    <path d="M35 42 Q35 17 60 17 Q85 17 85 42 Q74 34 60 34 Q46 34 35 42 Z"
          fill={STEEL} stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    {/* HUD 面罩 */}
    <rect x="44" y="40" width="32" height="7" rx="3.5" fill={color} />
    <rect x="48" y="41.5" width="9" height="4" rx="2" fill="#fff" opacity=".7" />
    {/* 天线 */}
    <line x1="60" y1="17" x2="60" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="60" cy="7" r="2.4" fill={color} />
  </g>
)

const Legs = () => (
  <g>
    <rect x="50" y="108" width="9" height="27" rx="3" fill={SUIT} stroke={DARK} strokeWidth="1.5" />
    <rect x="61" y="108" width="9" height="27" rx="3" fill={SUIT} stroke={DARK} strokeWidth="1.5" />
    <rect x="48" y="133" width="13" height="5" rx="2" fill={STEEL} />
    <rect x="59" y="133" width="13" height="5" rx="2" fill={STEEL} />
  </g>
)

const Torso = ({ color }) => (
  <g>
    <path d="M43 76 Q60 68 77 76 L72 112 Q60 116 48 112 Z"
          fill={SUIT} stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
    <line x1="60" y1="78" x2="60" y2="110" stroke={color} strokeWidth="1.4" opacity=".55" />
    <circle cx="60" cy="90" r="3" fill={color} opacity=".9" />
  </g>
)

const Arm = ({ d, color, hx, hy, cls }) => (
  <g className={cls}>
    <path d={d} fill="none" stroke={SUIT} strokeWidth="9" strokeLinecap="round" />
    <path d={d} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" opacity=".35" />
    <circle cx={hx} cy={hy} r="5" fill={DARK} stroke={color} strokeWidth="2" />
  </g>
)

const CHIBI = {
  vocals: ({ color }) => (
    <svg className="chibi" viewBox="0 0 120 150" width="118" height="148">
      <Legs />
      <Arm cls="g-arm-l" color={color} d="M47 80 Q39 92 42 105" hx="42" hy="105" />
      <Torso color={color} />
      <Head color={color} />
      <Arm cls="g-arm-r anim-mic" color={color} d="M73 80 Q83 70 74 59" hx="74" hy="59" />
      <g className="g-mic">
        <line x1="74" y1="58" x2="68" y2="50" stroke={STEEL} strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="66" cy="48" r="5.5" fill={DARK} stroke={color} strokeWidth="2" />
      </g>
      <g className="note n1">{note(color)}</g>
      <g className="note n2">{note(color)}</g>
    </svg>
  ),
  guitar: ({ color }) => (
    <svg className="chibi" viewBox="0 0 120 150" width="118" height="148">
      <Legs />
      <Torso color={color} />
      <g>
        <line x1="48" y1="98" x2="100" y2="56" stroke={STEEL} strokeWidth="6" strokeLinecap="round" />
        <rect x="97" y="48" width="9" height="13" rx="2" fill={DARK} stroke={color} strokeWidth="1.6" />
        <ellipse cx="46" cy="100" rx="17" ry="13" fill={DARK} stroke={color} strokeWidth="2.2" />
        <circle cx="46" cy="100" r="5" fill={color} opacity=".8" />
      </g>
      <Head color={color} />
      <Arm cls="g-arm-l" color={color} d="M73 80 Q88 74 94 62" hx="94" hy="62" />
      <Arm cls="g-arm-r anim-strum" color={color} d="M47 80 Q41 93 49 100" hx="49" hy="100" />
    </svg>
  ),
  bass: ({ color }) => (
    <svg className="chibi" viewBox="0 0 120 150" width="118" height="148">
      <Legs />
      <Torso color={color} />
      <g>
        <line x1="72" y1="102" x2="20" y2="58" stroke={STEEL} strokeWidth="6" strokeLinecap="round" />
        <rect x="14" y="50" width="9" height="13" rx="2" fill={DARK} stroke={color} strokeWidth="1.6" />
        <ellipse cx="74" cy="104" rx="16" ry="12" fill={DARK} stroke={color} strokeWidth="2.2" />
        <circle cx="74" cy="104" r="4.5" fill={color} opacity=".8" />
      </g>
      <Head color={color} />
      <Arm cls="g-arm-r" color={color} d="M47 80 Q33 74 26 62" hx="26" hy="62" />
      <Arm cls="g-arm-l anim-strum" color={color} d="M73 80 Q80 93 72 102" hx="72" hy="102" />
    </svg>
  ),
  drums: ({ color }) => (
    <svg className="chibi" viewBox="0 0 120 150" width="118" height="148">
      <Legs />
      <Torso color={color} />
      <Head color={color} />
      <Arm cls="g-arm-l anim-drum" color={color} d="M47 80 Q39 70 43 61" hx="43" hy="61" />
      <Arm cls="g-arm-r anim-drum d2" color={color} d="M73 80 Q81 70 77 61" hx="77" hy="61" />
      <line x1="43" y1="61" x2="33" y2="112" stroke={STEEL} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="77" y1="61" x2="60" y2="110" stroke={STEEL} strokeWidth="2.6" strokeLinecap="round" />
      <ellipse cx="60" cy="118" rx="28" ry="9" fill={DARK} stroke={color} strokeWidth="2.2" />
      <path d="M32 118 L32 132 Q60 140 88 132 L88 118" fill={SUIT} stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
      <ellipse cx="96" cy="96" rx="13" ry="3.5" fill={DARK} stroke={color} strokeWidth="1.8" />
      <line x1="96" y1="99" x2="96" y2="124" stroke={STEEL} strokeWidth="2" />
    </svg>
  ),
  piano: ({ color }) => (
    <svg className="chibi" viewBox="0 0 120 150" width="118" height="148">
      <Legs />
      <Torso color={color} />
      <Head color={color} />
      <Arm cls="g-arm-l anim-keys" color={color} d="M47 80 Q40 92 45 100" hx="45" hy="100" />
      <Arm cls="g-arm-r anim-keys k2" color={color} d="M73 80 Q80 92 75 100" hx="75" hy="100" />
      <g>
        <rect x="28" y="100" width="64" height="14" rx="2" fill={DARK} stroke={color} strokeWidth="2" />
        <line x1="41" y1="101" x2="41" y2="113" stroke={color} strokeWidth="1.2" opacity=".6" />
        <line x1="51" y1="101" x2="51" y2="113" stroke={color} strokeWidth="1.2" opacity=".6" />
        <line x1="61" y1="101" x2="61" y2="113" stroke={color} strokeWidth="1.2" opacity=".6" />
        <line x1="71" y1="101" x2="71" y2="113" stroke={color} strokeWidth="1.2" opacity=".6" />
        <line x1="81" y1="101" x2="81" y2="113" stroke={color} strokeWidth="1.2" opacity=".6" />
      </g>
    </svg>
  ),
  other: ({ color }) => (
    <svg className="chibi" viewBox="0 0 120 150" width="118" height="148">
      <Legs />
      <Torso color={color} />
      <Head color={color} />
      <Arm cls="g-arm-l anim-keys" color={color} d="M47 80 Q40 92 46 101" hx="46" hy="101" />
      <Arm cls="g-arm-r anim-keys k2" color={color} d="M73 80 Q80 92 74 101" hx="74" hy="101" />
      <g>
        <rect x="30" y="100" width="60" height="15" rx="2" fill={DARK} stroke={color} strokeWidth="2" />
        <circle cx="38" cy="107" r="2.6" fill={color} />
        <circle cx="47" cy="107" r="2.6" fill="#fff" opacity=".6" />
        <circle cx="56" cy="107" r="2.6" fill={color} />
        <rect x="64" y="104" width="20" height="7" rx="1" fill={SUIT} stroke={color} strokeWidth="1.2" />
      </g>
      <g className="note n1">{note(color)}</g>
    </svg>
  ),
}

const note = (color) => (
  <g fill={color}>
    <ellipse cx="0" cy="6" rx="3.4" ry="2.6" />
    <rect x="2.6" y="-8" width="1.8" height="14" />
    <path d="M2.6 -8 q7 1 5 8" fill="none" stroke={color} strokeWidth="1.8" />
  </g>
)

// ─── state ────────────────────────────────────────────
const initState = () => ({
  isPlaying: false,
  tracks: Object.fromEntries(TRACKS.map(t => [t.id, { muted: false, solo: false, volume: 1 }])),
})

function reducer(state, action) {
  switch (action.type) {
    case 'PLAY':  return { ...state, isPlaying: true  }
    case 'STOP':  return { ...state, isPlaying: false }
    case 'MUTE':  return { ...state, tracks: { ...state.tracks, [action.id]: { ...state.tracks[action.id], muted:  !state.tracks[action.id].muted  } } }
    case 'SOLO':  return { ...state, tracks: { ...state.tracks, [action.id]: { ...state.tracks[action.id], solo:   !state.tracks[action.id].solo   } } }
    case 'VOL':   return { ...state, tracks: { ...state.tracks, [action.id]: { ...state.tracks[action.id], volume:  action.value                   } } }
    default: return state
  }
}

function getGains(tracks) {
  const anySolo = Object.values(tracks).some(t => t.solo)
  return Object.fromEntries(TRACKS.map(({ id }) => {
    const t = tracks[id]
    if (t.muted) return [id, 0]
    if (anySolo && !t.solo) return [id, 0]
    return [id, t.volume]
  }))
}

// ─── time format ──────────────────────────────────────
function fmt(t) {
  if (!isFinite(t) || t < 0) t = 0
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

// ─── 舞台成员 ─────────────────────────────────────────
function Member({ def, st, anySolo, dispatch }) {
  const dimmed = st.muted || (anySolo && !st.solo)
  const status = st.muted ? 'OFF' : (anySolo && !st.solo) ? '——' : 'ON'

  return (
    <div
      className={`member${dimmed ? ' off' : ''}`}
      data-role={def.id}
      style={{ ...def.pos, '--mc': def.color }}
      onClick={() => dispatch({ type: 'MUTE', id: def.id })}
      title={st.muted ? '点击让 TA 上场' : '点击让 TA 休息'}
    >
      <div className="member-icon">{CHIBI[def.id]({ color: def.color })}</div>
      <div className="member-name">{def.name}<em>{status}</em></div>
      <div className="member-ctl" onClick={e => e.stopPropagation()}>
        <input
          type="range" className="track-vol" min="0" max="1" step="0.01"
          value={st.volume}
          style={{ '--thumb-color': def.color }}
          onChange={e => dispatch({ type: 'VOL', id: def.id, value: +e.target.value })}
        />
        <button
          className={`m-solo${st.solo ? ' soloed' : ''}`}
          onClick={() => dispatch({ type: 'SOLO', id: def.id })}
        >S</button>
      </div>
    </div>
  )
}

// ─── main Music component ─────────────────────────────
export default function Music() {
  const [state, dispatch] = useReducer(reducer, null, initState)
  const [loadState, setLoadState] = useState('idle') // idle | loading | ready | error

  // audio refs
  const actxRef      = useRef(null)
  const analyserRef  = useRef(null)
  const freqRef      = useRef(null)
  const eqRef        = useRef(null)
  const miniEqRef    = useRef(null)
  const autoStarted  = useRef(false)
  const startingRef  = useRef(false)
  const gainNodesRef = useRef({})
  const sourcesRef   = useRef({})
  const buffersRef   = useRef({})
  const durationRef  = useRef(0)
  const startTRef    = useRef(0)
  const elapsedRef   = useRef(0)
  const isPlayingRef = useRef(false)
  const playTimeRef  = useRef(0)
  const timeDispRef  = useRef(null)
  const durDispRef   = useRef(null)
  const progressRef  = useRef(null)
  const stopPlayRef  = useRef(null)

  const anySolo = Object.values(state.tracks).some(t => t.solo)

  // sync gains when track states change
  useEffect(() => {
    const actx = actxRef.current
    if (!actx) return
    const gains = getGains(state.tracks)
    TRACKS.forEach(({ id }) => {
      const gn = gainNodesRef.current[id]
      if (gn) gn.gain.setTargetAtTime(gains[id], actx.currentTime, .04)
    })
  }, [state.tracks])

  // RAF loop: update time display + progress bar + 真实频谱; auto-stop at end
  useEffect(() => {
    let raf
    const tick = () => {
      const bars = eqRef.current?.children
      if (isPlayingRef.current && actxRef.current) {
        const t = actxRef.current.currentTime - startTRef.current
        if (durationRef.current && t >= durationRef.current) {
          stopPlayRef.current?.(true)
        } else {
          playTimeRef.current = t
          if (timeDispRef.current) timeDispRef.current.textContent = fmt(t)
          if (progressRef.current && durationRef.current) {
            progressRef.current.style.width = (t / durationRef.current) * 100 + '%'
          }
          // 真实频谱：读取频率数据驱动每根柱子
          const an = analyserRef.current, f = freqRef.current
          if (an && f) {
            an.getByteFrequencyData(f)
            if (bars) for (let i = 0; i < bars.length; i++) {
              const v = (f[i + 1] || 0) / 255          // 跳过最低 DC 频段
              bars[i].style.height = (6 + v * v * 88) + '%'
            }
            const mb = miniEqRef.current?.children
            if (mb) for (let i = 0; i < mb.length; i++) {
              const v = (f[i + 1] || 0) / 255
              mb[i].style.height = (12 + v * v * 88) + '%'
            }
          }
        }
      } else {
        // 静止时缓慢回落
        if (bars) for (let i = 0; i < bars.length; i++) {
          const h = parseFloat(bars[i].style.height) || 6
          if (h > 6) bars[i].style.height = Math.max(6, h - 6) + '%'
        }
        const mb = miniEqRef.current?.children
        if (mb) for (let i = 0; i < mb.length; i++) {
          const h = parseFloat(mb[i].style.height) || 12
          if (h > 12) mb[i].style.height = Math.max(12, h - 9) + '%'
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const ensureLoaded = useCallback(async () => {
    if (loadState === 'ready') return true
    if (!actxRef.current) {
      const actx = new (window.AudioContext || window.webkitAudioContext)()
      actxRef.current = actx
      const analyser = actx.createAnalyser()
      analyser.fftSize = 64           // 32 频段
      analyser.smoothingTimeConstant = 0.75
      analyser.connect(actx.destination)
      analyserRef.current = analyser
      freqRef.current = new Uint8Array(analyser.frequencyBinCount)
      TRACKS.forEach(({ id }) => {
        const g = actx.createGain()
        g.gain.value = 1
        g.connect(analyser)           // 所有声部汇入分析器
        gainNodesRef.current[id] = g
      })
    }
    setLoadState('loading')
    try {
      await Promise.all(TRACKS.map(async ({ id }) => {
        const res = await fetch(`${STEM_BASE}/${id}.mp3`)
        if (!res.ok) throw new Error(`${id}: ${res.status}`)
        const ab  = await res.arrayBuffer()
        const buf = await actxRef.current.decodeAudioData(ab)
        buffersRef.current[id] = buf
        durationRef.current    = Math.max(durationRef.current, buf.duration)
      }))
      setLoadState('ready')
      if (durDispRef.current) durDispRef.current.textContent = fmt(durationRef.current)
      return true
    } catch (e) {
      console.error('stem load failed', e)
      setLoadState('error')
      return false
    }
  }, [loadState])

  const startPlay = useCallback(async () => {
    if (isPlayingRef.current || startingRef.current) return   // 防并发重复起播
    startingRef.current = true
    try {
      const ok = await ensureLoaded()
      if (!ok) return
      const actx = actxRef.current
      if (actx.state === 'suspended') await actx.resume()

      const gains  = getGains(state.tracks)
      const offset = elapsedRef.current % (durationRef.current || 1)
      TRACKS.forEach(({ id }) => {
        try { sourcesRef.current[id]?.stop() } catch (_) {}
        const src = actx.createBufferSource()
        src.buffer = buffersRef.current[id]
        src.connect(gainNodesRef.current[id])
        src.start(0, offset)
        gainNodesRef.current[id].gain.value = gains[id]
        sourcesRef.current[id] = src
      })

      startTRef.current    = actx.currentTime - offset
      isPlayingRef.current = true
      dispatch({ type: 'PLAY' })
    } finally {
      startingRef.current = false
    }
  }, [ensureLoaded, state.tracks])

  const stopPlay = useCallback((ended = false) => {
    if (actxRef.current && !ended) {
      elapsedRef.current = actxRef.current.currentTime - startTRef.current
    }
    TRACKS.forEach(({ id }) => { try { sourcesRef.current[id]?.stop() } catch (_) {} })
    isPlayingRef.current = false
    if (ended) {
      elapsedRef.current  = 0
      playTimeRef.current = 0
      if (timeDispRef.current) timeDispRef.current.textContent = '0:00'
      if (progressRef.current) progressRef.current.style.width = '0%'
    }
    dispatch({ type: 'STOP' })
  }, [])

  // expose latest stopPlay to the RAF effect without re-running it
  useEffect(() => { stopPlayRef.current = stopPlay }, [stopPlay])

  const rewind = useCallback(() => {
    elapsedRef.current  = 0
    playTimeRef.current = 0
    if (timeDispRef.current) timeDispRef.current.textContent = '0:00'
    if (progressRef.current) progressRef.current.style.width = '0%'
    if (isPlayingRef.current) {
      TRACKS.forEach(({ id }) => { try { sourcesRef.current[id]?.stop() } catch (_) {} })
      isPlayingRef.current = false
      dispatch({ type: 'STOP' })
      setTimeout(startPlay, 50)
    }
  }, [startPlay])

  const sectionRef = useRef(null)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.disconnect() }
    }, { threshold: 0.08 })
    if (sectionRef.current) io.observe(sectionRef.current)
    return () => io.disconnect()
  }, [])

  // 进页面后首次交互自动起播（浏览器禁止无交互带声自动播）
  const startPlayRef = useRef(startPlay)
  useEffect(() => { startPlayRef.current = startPlay }, [startPlay])
  useEffect(() => {
    const evts = ['pointerdown', 'keydown', 'wheel', 'touchstart']
    const kick = () => {
      if (autoStarted.current) return
      autoStarted.current = true
      evts.forEach(e => window.removeEventListener(e, kick))
      startPlayRef.current()
    }
    evts.forEach(e => window.addEventListener(e, kick, { passive: true }))
    return () => evts.forEach(e => window.removeEventListener(e, kick))
  }, [])

  return (
    <>
    <section className="section" id="music">
      <div className="sec-label">音乐</div>
      <p className="music-intro">
        《黑夜中》的 6 位乐手都在台上。<br />
        点击谁，谁就下场休息；拉音量、按 S 独奏，由你来排这场演出。
      </p>

      <div className="bandbox fade-up" ref={sectionRef}>

        {/* ── Transport ── */}
        <div className="daw-transport">
          <button className="t-btn" onClick={rewind} title="回到开头">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <polygon points="9,1 5,5 9,9" /><rect x="0" y="1" width="3" height="8" />
            </svg>
          </button>

          <button
            className={`t-btn${state.isPlaying ? ' active' : ''}`}
            onClick={() => state.isPlaying ? stopPlay() : startPlay()}
            title={state.isPlaying ? '暂停' : '播放'}
            disabled={loadState === 'loading'}
          >
            {state.isPlaying
              ? <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect x="1" y="1" width="3" height="8" /><rect x="6" y="1" width="3" height="8" /></svg>
              : <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor"><polygon points="0,0 10,6 0,12" /></svg>
            }
          </button>

          <button className="t-btn" onClick={() => stopPlay(true)} title="停止">
            <svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor">
              <rect x="0" y="0" width="9" height="9" />
            </svg>
          </button>

          <div className="t-sep" />

          <span className="t-time">
            <span ref={timeDispRef}>0:00</span> / <span ref={durDispRef}>0:00</span>
          </span>

          {loadState === 'loading'
            ? <span className="t-bpm">加载中…</span>
            : loadState === 'error'
              ? <span className="t-bpm">加载失败</span>
              : <span className="t-bpm">{BPM} BPM</span>}
          <span className="t-loop">LIVE · 6 STEMS</span>
        </div>

        {/* ── Progress ── */}
        <div className="tape-progress"><div className="tape-progress-fill" ref={progressRef} /></div>

        {/* ── Stage ── */}
        <div className={`stage${state.isPlaying ? ' playing' : ''}`}>
          <div className="stage-grid" />
          <div className="stage-lights" />
          <div className="stage-eq" ref={eqRef}>{Array.from({ length: 28 }).map((_, i) => <i key={i} />)}</div>
          {TRACKS.map(def => (
            <Member
              key={def.id}
              def={def}
              st={state.tracks[def.id]}
              anySolo={anySolo}
              dispatch={dispatch}
            />
          ))}
        </div>
      </div>

      <p className="music-note">* 由 demucs (htdemucs_6s) 从原曲分离的真实 6 轨音频。</p>
    </section>

    {/* ── 右下角浮动迷你播放器（全站常驻，共用同一音频引擎）── */}
    <div className={`mini-player${state.isPlaying ? ' on' : ''}`}>
      <button
        className="mini-btn"
        onClick={() => state.isPlaying ? stopPlay() : startPlay()}
        title={state.isPlaying ? '暂停' : '播放'}
        disabled={loadState === 'loading'}
      >
        {state.isPlaying
          ? <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor"><rect x="1" y="1" width="3" height="10" /><rect x="7" y="1" width="3" height="10" /></svg>
          : <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor"><polygon points="1,0 11,6 1,12" /></svg>}
      </button>
      <div className="mini-info">
        <div className="mini-eq" ref={miniEqRef}>{Array.from({ length: 16 }).map((_, i) => <i key={i} />)}</div>
        <div className="mini-title">
          {loadState === 'loading' ? '加载中…' : loadState === 'error' ? '加载失败' : '《黑夜中》'}
          <span>{state.isPlaying ? 'NOW PLAYING' : 'PAUSED'}</span>
        </div>
      </div>
    </div>
    </>
  )
}
