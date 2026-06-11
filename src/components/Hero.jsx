const BASE = import.meta.env.BASE_URL

export default function Hero() {
  return (
    <div className="hero">
      <div className="hero-bg">
        <img src={`${BASE}photos/dusk.jpg`} alt="" />
      </div>
      <div className="hero-scan" />
      <div className="hero-grid" />

      <div className="hero-inner">
        <div className="hero-eyebrow">Product Manager · Music · Photography</div>
        <h1 className="hero-name">Shadows芃</h1>
        <div className="hero-sub"><em>Shanghai · 上海</em></div>
        <p className="hero-desc">
          用产品思维理解世界，用镜头和音符感受生活。<br />喜欢复杂系统，也迷恋细节之美。
        </p>
      </div>

      <div className="hero-scroll">
        <span>向下滚动</span>
        <span className="scroll-line" />
      </div>
    </div>
  )
}
