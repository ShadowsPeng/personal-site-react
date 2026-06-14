# 个人网站制作工作流（从 0 到上线）

> 以本站 `shadowspeng.com` 为例总结的完整流程。技术栈：**React + Vite**（页面）→ **Cloudflare Pages**（托管/上线）→ **Cloudflare DNS**（挂域名）。
> 这套组合适合个人站：免费、全球 CDN、自动 HTTPS、改完一条命令上线。下次做别的站照搬即可。

---

## 全景：五个阶段

```
① 做页面 ──→ ② 买域名 ──→ ③ 挂域名 ──→ ④ 上线 ──→ ⑤ 版本迭代
 本地开发      注册商购买     DNS+绑定     部署到CDN    改→测→发→存档
```

第一次做要按 ①→⑤ 走一遍；之后每次改动只走 ⑤。

---

## ① 做页面（本地开发）

### 环境准备
- 装 **Node.js**（LTS 版即可，含 npm）
- 编辑器：VS Code / Claude Code（`cc`）

### 起项目
全新项目用脚手架；本项目已建好，直接装依赖：
```bash
npm create vite@latest 我的网站 -- --template react   # 新项目才需要
npm install                                            # 装依赖
npm run dev                                            # 本地预览 → http://localhost:5173
```
`npm run dev` 开着，改代码浏览器即时刷新（HMR）。

### 页面怎么搭（本项目结构）
```
src/
  App.jsx            # 总装配：把各板块拼起来
  components/        # 每个板块一个组件：Hero / About / Music / Photos / Footer ...
  index.css          # 全站样式（CSS 变量定义配色，统一改一处全站变）
  gallery/<分类>/    # 照片源图，用 import.meta.glob 自动读取（丢图进去就出现）
public/              # 不经打包直接拷贝的静态资源：照片、视频、favicon
```
要点：
- **组件化**：一个板块一个 `.jsx`，互不干扰，好维护。
- **配色集中**：`index.css` 顶部用 `:root { --bg / --accent ... }` 定义，全站引用变量，换色只改一处。
- **响应式**：用 `@media (max-width: 768px)` 等断点适配手机；用 `clamp()` 让字号随屏宽缩放。

### 性能优化（个人站最容易忽视、最影响体验的一步）
图片/视频是加载慢的元凶，**上线前务必处理**：

| 资源 | 怎么做 | 本项目实践 |
|---|---|---|
| **缩略图** | 缩小尺寸 + 转 WebP | `vite-imagetools`：网格用 `?w=720&quality=78&format=webp`（几十 KB） |
| **大图（点开看）** | 保持分辨率换 WebP | lightbox 用 `?w=2560&quality=85&format=webp`，清晰度肉眼无损、体积省 ~35% |
| **背景视频** | 降到 1080p、限码率、去音轨、`faststart` | `ffmpeg -vf scale=1920:1080 -crf 21 -an -movflags +faststart`；30s 长片用 `-maxrate` 封顶 |
| **懒加载** | 首屏外的图加 `loading="lazy"` | 网格缩略图懒加载，首屏只下可见部分 |

> 经验：判断"慢"不要猜，**实测首屏到底下载了多少**（浏览器 DevTools → Network，或脚本统计）。本站一度以为是图片，实测才发现 90% 是首屏视频。

---

## ② 买域名

### 在哪买
- **国内**：阿里云、腾讯云、华为云（要在国内云托管/备案，就在这买，注册商合规）
- **海外**：Cloudflare Registrar（成本价、无溢价）、Namecheap、Spaceship 等
- 本站域名是 `.com`，注册在海外注册商，DNS 托管在 Cloudflare。

### 怎么挑
- 后缀：`.com` 最通用；`.me / .dev / .xyz` 个性但认知度低。
- 名字：短、好记、和品牌一致（本站 = `shadowspeng`）。
- 费用：`.com` 约 ¥70–100/年；首年常有促销，**看续费价**别只看首年。

### 注意
- 买完做 **域名实名认证**（国内注册商强制；海外不强制，但要在国内备案就必须实名且信息与备案主体一致）。
- **新域名有 60 天转移锁**：注册后 60 天内不能转去别的注册商。要换注册商（比如为备案转到国内）得等这 60 天。

---

## ③ 挂域名（DNS + 绑定到托管）

目标：让 `你的域名` 指向托管网站的服务器。本站用 **Cloudflare** 同时做 DNS 和托管，最省事：

1. **把域名 DNS 交给 Cloudflare 管**
   在域名注册商后台，把 **Nameserver(NS)** 改成 Cloudflare 给的两条（如 `xxx.ns.cloudflare.com`）。生效要几分钟到几小时。
2. **在 Cloudflare Pages 绑定自定义域名**
   Pages 项目 → Custom domains → 添加 `shadowspeng.com`。Cloudflare 会自动加好解析记录（CNAME → `项目.pages.dev`）并**自动签发 HTTPS 证书**。
3. **可选 www**：再加一条 `www` 指向同一处，或做 www→根域 跳转。

> 如果 DNS 不在 Cloudflare（比如在阿里云/华为云），就到对应平台加一条 **CNAME 记录**：`@` 或 `www` → `项目.pages.dev`。

验证：浏览器开 `https://你的域名`，能打开且是小绿锁（HTTPS）即成功。

---

## ④ 上线（部署到 Cloudflare Pages）

本项目已配好一条命令（见 `package.json` 的 `deploy` 脚本）：

```bash
npm run deploy
```
它做两件事：① `vite build` 构建出 `dist/` → ② `wrangler pages deploy dist` 上传到 Cloudflare。
看到 `✨ Deployment complete!` 就上线了。

首次部署需要：
```bash
npm install -g wrangler   # 或用项目里的 npx wrangler
npx wrangler login        # 浏览器授权登录 Cloudflare 账号
```

**上线后必做**：开 `https://你的域名` 实测一遍，确认页面、图片、视频都正常（别只信"部署成功"）。

---

## ⑤ 版本迭代（日常改动的标准流程）

每次改东西，按这五步走，稳：

```
1. 本地改  →  npm run dev 看效果（手机也看：npm run dev -- --host）
2. 自测    →  关键功能/多端跑一遍（本项目用 puppeteer-core 脚本自动测：视频是否在播、首屏多大、排版有没有断行）
3. 构建    →  npm run build，确认产物正常
4. 发布    →  npx wrangler pages deploy dist ... （或 npm run deploy）
5. 验证    →  开线上地址实测；没问题再 git 存档
```

### 存档（Git）
```bash
git add .
git commit -m "这次改了啥，一句话"
git push
```
> 顺序：先发布看线上 OK，再 push 存档。

### 回滚（线上出问题时）
Cloudflare 后台 → Workers & Pages → 项目 → **Deployments** → 点任意历史版本即可一键回滚。所以大胆改，坏了能退。

### 踩坑提醒
- **线上白屏/黑屏**：多半是构建缓存。清掉重建：
  `Remove-Item -Recurse -Force dist,node_modules\.vite` 然后 `npm run deploy`。
- **改了不生效**：浏览器强刷（Ctrl+F5）或换无痕窗口，排除缓存。
- **手机端和桌面端表现不同**：`<video>` 自动播放在 iOS 上要 `muted + playsInline`，且 React 的 `muted` 属性不可靠，需用 ref 强制 `video.muted = true`。

---

## 进阶：国内访问加速（按需）

Cloudflare 是海外 CDN，国内访问偏慢。要国内秒开只有一条合规路：
**ICP 备案 + 国内云**（域名转入国内注册商 → 买国内云资源 → 备案 1–3 周 → 用国内 CDN）。
免备案的折中：用**香港节点**（境外不用备案，比海外节点快）。
个人站若只是给人看，海外慢几秒可接受，**不折腾也是合理选择**。

---

## 本项目关键信息备忘
- 线上：https://shadowspeng.com ｜ 备用 https://shadowspeng.pages.dev
- GitHub：https://github.com/ShadowsPeng/personal-site-react
- 托管：Cloudflare Pages，项目名 `shadowspeng`
- DNS：Cloudflare（NS = `*.ns.cloudflare.com`）
- 发布：`npm run deploy`；回滚：Cloudflare 后台 Deployments
