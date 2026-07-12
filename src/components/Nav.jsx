import { useEffect, useState } from 'react'

const LINKS = [
  { label: '关于', href: '#about' },
  { label: '音乐', href: '#music' },
  { label: '摄影', href: '#photos' },
  { label: '联系', href: '#contact' },
]

const THEMES = [
  { id: 'dark',  label: '暗金' },
  { id: 'light', label: '浅米' },
  { id: 'mono',  label: '黑白' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    const saved = localStorage.getItem('shadowspeng-theme')
    return (saved === 'dark' || saved === 'light' || saved === 'mono') ? saved : 'dark'
  })

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('shadowspeng-theme', theme) } catch {}
  }, [theme])

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
      <a href="#" className="nav-logo">Shadows芃</a>
      <ul className="nav-links">
        {LINKS.map(l => (
          <li key={l.href}><a href={l.href}>{l.label}</a></li>
        ))}
        <li className="nav-themes" role="group" aria-label="主题切换">
          {THEMES.map(t => (
            <button
              key={t.id}
              type="button"
              className={`swatch sw-${t.id}`}
              title={t.label}
              aria-label={t.label}
              aria-pressed={theme === t.id}
              onClick={() => setTheme(t.id)}
            />
          ))}
        </li>
      </ul>
    </nav>
  )
}