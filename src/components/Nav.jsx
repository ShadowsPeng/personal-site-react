import { useEffect, useState } from 'react'

const LINKS = [
  { label: '关于', href: '#about' },
  { label: '音乐', href: '#music' },
  { label: '摄影', href: '#photos' },
  { label: '联系', href: '#contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
      <a href="#" className="nav-logo">Shadows芃</a>
      <ul className="nav-links">
        {LINKS.map(l => (
          <li key={l.href}><a href={l.href}>{l.label}</a></li>
        ))}
      </ul>
    </nav>
  )
}
