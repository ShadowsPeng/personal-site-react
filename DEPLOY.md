# 上线 & 发布说明

个人网站 `shadowspeng.com`，托管在 Cloudflare Pages，代码用 GitHub 管理。

## 平时改完代码，怎么发布？（2 步）

### 第 1 步：上线（让网站更新）
在项目目录打开终端，敲一条命令：

```
npm run deploy
```

它会自动：① 重新构建 → ② 上传到 Cloudflare。等它显示 `Deployment complete` 就上线了。

### 第 2 步：存档（把这次改动记进 GitHub）
```
git add .
git commit -m "这次改了啥，简单写一句"
git push
```

> 顺序建议：先 `npm run deploy` 看线上没问题，再 `git push` 存档。

---

## 本地预览（发布前自己先看一眼）
```
npm run dev
```
浏览器开 http://localhost:5173 ，改代码即时刷新。看满意了再 `npm run deploy`。

手机也想看：`npm run dev -- --host`，然后用同一 WiFi 的手机访问它给出的地址。

---

## 重要：发布前务必清干净缓存重建（避免黑屏）
如果遇到线上白屏/黑屏，多半是构建缓存问题。手动清一次：

```
rmdir /s /q dist node_modules\.vite
npm run deploy
```

（PowerShell 用：`Remove-Item -Recurse -Force dist,node_modules\.vite`）

---

## 关键信息备忘
- 网站地址：https://shadowspeng.com
- Cloudflare 备用地址：https://shadowspeng.pages.dev
- GitHub 仓库：https://github.com/ShadowsPeng/personal-site-react
- Cloudflare Pages 项目名：`shadowspeng`
- 域名 & DNS：华为云
- 回滚：Cloudflare 后台 → Workers & Pages → shadowspeng → Deployments，点任意历史版本可回滚

---

## 国内访问说明
托管在 Cloudflare（海外节点），国内访问偶尔会慢或需刷新，属正常现象。
若以后要国内稳定访问，需走「ICP 备案 + 国内云」，再议。
