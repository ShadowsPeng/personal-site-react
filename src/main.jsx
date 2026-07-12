import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 默认主题 = dark（暖金，向下兼容未设置 data-theme 的情况）
// 在 React 挂载前同步应用主题，避免首屏闪烁
;(function () {
  try {
    const saved = localStorage.getItem('shadowspeng-theme')
    const theme = (saved === 'dark' || saved === 'light' || saved === 'mono') ? saved : 'dark'
    document.documentElement.setAttribute('data-theme', theme)
  } catch {
    document.documentElement.setAttribute('data-theme', 'dark')
  }
})()

createRoot(document.getElementById('root')).render(<App />)