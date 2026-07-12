import { useEffect, useRef } from 'react'

const BASE = import.meta.env.BASE_URL

const TRAITS = ['财务 PM', '系统设计', 'PM × AI', '胶片摄影', '哈苏 · ETRSI · 宾得67', '观鸟', '户外', '独立音乐']

// 性格 / 身份坐标（星座、MBTI 待用户确认真实值）
const STATS = [
  { k: 'MBTI', v: 'INTP' },
  { k: '星座', v: '金牛座' },
  { k: '城市', v: '上海' },
]

export default function About() {
  const ref = useRef(null)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.disconnect() }
    }, { threshold: 0.12 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  return (
    <section className="section" id="about">
      <div className="sec-label">关于我</div>
      <div className="about-grid fade-up" ref={ref}>
        <div className="about-text">
          <h2>思考者，<br />也是<em>感受者</em></h2>
          <p>我是一名产品经理，习惯用系统性思维拆解问题，但同时也相信直觉和美感的力量。</p>
          <p>音乐给了我另一种语言——不需要逻辑就能传达情绪的那种。摄影则让我学会慢下来，在日常里寻找值得被记住的瞬间。</p>
          <div className="stats">
            {STATS.map(s => (
              <div key={s.k} className="stat">
                <span className="stat-k">{s.k}</span>
                <span className="stat-v">{s.v}</span>
              </div>
            ))}
          </div>
          <div className="traits">
            {TRAITS.map(t => <span key={t} className="trait">{t}</span>)}
          </div>
        </div>
        <div className="about-portrait">
          <img src={`${BASE}about-portrait.jpg`} alt="Shadows芃" />
          <div className="about-portrait-cap">
            <strong>Shadows芃</strong>
            <span>Product Manager · Photography · Music</span>
          </div>
        </div>
      </div>
    </section>
  )
}
