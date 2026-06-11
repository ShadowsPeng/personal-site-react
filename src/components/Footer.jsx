export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="foot-head">
        <div className="foot-name">Shadows芃</div>
        <p className="foot-bio">
          产品经理，胶片摄影爱好者。<br />
          用产品思维理解世界，用镜头和音符感受生活。常驻上海。
        </p>
      </div>

      <div className="foot-cols">
        <div className="foot-col">
          <div className="foot-col-h">Contact</div>
          <a href="mailto:BonnyKanegdo@engineer.com" className="foot-link">BonnyKanegdo@engineer.com</a>
        </div>
        <div className="foot-col">
          <div className="foot-col-h">Social</div>
          <a href="#" className="foot-link">小红书 · 胶片摄影</a>
          <a href="#" className="foot-link">微信 · 预约</a>
        </div>
        <div className="foot-col">
          <div className="foot-col-h">Index</div>
          <a href="#about" className="foot-link">关于</a>
          <a href="#music" className="foot-link">音乐</a>
          <a href="#photos" className="foot-link">摄影</a>
        </div>
      </div>

      <div className="foot-base">
        <span className="foot-copy">© 2026 Shadows芃</span>
        <span className="foot-copy">Shanghai · 上海</span>
      </div>
    </footer>
  )
}
