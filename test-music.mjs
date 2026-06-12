import puppeteer from 'puppeteer-core'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const URL = process.env.TEST_URL || 'http://localhost:5173/#music'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const log = (ok, msg) => console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`)

const errors = []
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1400, height: 900 })   // 桌面尺寸 → 拖动可用
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message))
page.on('requestfailed', r => errors.push(`REQ FAIL ${r.response()?.status() || ''} ${r.url()}`))
page.on('response', r => { if (r.status() === 404) errors.push(`404 ${r.url()}`) })

await page.goto(URL, { waitUntil: 'networkidle2' })
await page.evaluate(() => document.querySelector('#music')?.scrollIntoView())
await sleep(500)

// 1) 点播放键
await page.evaluate(() => {
  const btns = [...document.querySelectorAll('.daw-transport .t-btn')]
  btns[1]?.click()                      // 中间那个是 play/pause
})
await sleep(2500)                       // 等加载+解码+起播

// 2) 是否真的在播放：进度条宽度 + 时间显示
const playState = await page.evaluate(() => {
  const fill = document.querySelector('.tape-progress-fill')
  const time = document.querySelector('.t-time span')
  const w = fill ? parseFloat(getComputedStyle(fill).width) : 0
  return { width: w, time: time?.textContent, bpm: document.querySelector('.t-bpm')?.textContent }
})
log(playState.width > 0, `进度条在走 (width=${playState.width}px, time=${playState.time}, ${playState.bpm})`)

// 3) 乐手是否跟着各自音轨动（--amp 应有 >0.2 的）
const amps = await page.evaluate(() =>
  [...document.querySelectorAll('.member')].map(m => ({
    role: m.dataset.role,
    amp: +m.style.getPropertyValue('--amp') || 0,
  }))
)
const reacting = amps.filter(a => a.amp > 0.2)
log(reacting.length > 0, `乐手随声音动 (${reacting.length}/6 有反应: ${amps.map(a => a.role+':'+a.amp.toFixed(2)).join(' ')})`)

// 4) 预设：卡拉OK → 主唱应下场(muted/off)
await page.evaluate(() => {
  const dp = [...document.querySelectorAll('.dp-btn')].find(b => b.textContent.includes('卡拉OK'))
  dp?.click()
})
await sleep(400)
const karaoke = await page.evaluate(() => {
  const v = document.querySelector('.member[data-role=vocals]')
  const g = document.querySelector('.member[data-role=guitar]')
  return { vocalsOff: v?.classList.contains('off'), guitarOff: g?.classList.contains('off') }
})
log(karaoke.vocalsOff && !karaoke.guitarOff, `卡拉OK: 主唱下场=${karaoke.vocalsOff}, 吉他留台=${!karaoke.guitarOff}`)

// 5) Solo 追光：按鼓手 S → stage.has-solo + 该乐手 .soloed
await page.evaluate(() => {
  document.querySelector('.member[data-role=drums] .m-solo')?.click()
})
await sleep(300)
const solo = await page.evaluate(() => ({
  stageHasSolo: !!document.querySelector('.stage.has-solo'),
  drumsSoloed: document.querySelector('.member[data-role=drums]')?.classList.contains('soloed'),
}))
log(solo.stageHasSolo && solo.drumsSoloed, `Solo 追光: stage.has-solo=${solo.stageHasSolo}, 鼓手.soloed=${solo.drumsSoloed}`)
// 取消 solo 复位
await page.evaluate(() => document.querySelector('.member[data-role=drums] .m-solo')?.click())

// 6) 拖动：把贝斯手拖动一段，位置(left/top)应改变，且不报错
const before = await page.evaluate(() => {
  const b = document.querySelector('.member[data-role=bass]')
  const r = b.getBoundingClientRect()
  return { left: b.style.left, top: b.style.top, cx: r.x + r.width / 2, cy: r.y + r.height / 2 }
})
const cx = before.cx
const cy = before.cy
await page.mouse.move(cx, cy)
await page.mouse.down()
await page.mouse.move(cx - 140, cy - 40, { steps: 12 })
await page.mouse.up()
await sleep(300)
const after = await page.evaluate(() => {
  const b = document.querySelector('.member[data-role=bass]')
  return { left: b.style.left, top: b.style.top }
})
log(after.left !== before.left, `拖动换位生效 (left ${before.left} -> ${after.left}, top ${before.top} -> ${after.top})`)

// 7) console / page 报错
log(errors.length === 0, `运行期无报错 (${errors.length} 条)` + (errors.length ? '\n   ' + errors.slice(0, 5).join('\n   ') : ''))

await browser.close()
