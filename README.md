# 🎂 吹蜡烛 · 生日快乐

一个可交互的生日蛋糕网页:点燃蜡烛 → 许愿 → 对着麦克风吹气吹灭 → 冒烟撒花。
纯静态单文件,无需任何依赖。

## 在线预览

部署到 GitHub Pages 后,访问：
`https://<你的用户名>.github.io/<仓库名>/`

> ⚠️ 麦克风功能必须在 **HTTPS 网址** 或浏览器直接打开的本地文件下才可用。
> GitHub Pages 自带 HTTPS,所以部署后手机浏览器打开即可正常吹蜡烛。
> 应用内的预览窗口 / 微信等内置浏览器会拦截麦克风,这是它们的安全限制,不是代码问题。

## 部署到 GitHub Pages

> ✅ 本仓库已内置自动部署工作流 `.github/workflows/pages.yml`。
> 把代码合并/推送到 `main` 分支后,GitHub Actions 会自动构建并发布到 Pages,
> 通常只需在 **Settings → Pages → Source** 选择 **GitHub Actions** 即可(若已自动开启则无需手动设置)。
> 部署完成后访问 `https://<用户名>.github.io/<仓库名>/`。

下面是不依赖工作流的两种手动方式,任选其一也可。

### 方法一：网页上传(最简单,不用命令行)

1. 在 GitHub 新建一个仓库(比如 `birthday-cake`),设为 Public。
2. 点 **Add file → Upload files**,把本文件夹里的 `index.html`、`.nojekyll`、`README.md` 全部拖进去,提交。
3. 进入仓库 **Settings → Pages**。
4. **Source** 选 `Deploy from a branch`,**Branch** 选 `main` + `/ (root)`,点 **Save**。
5. 等 1～2 分钟,页面顶部会出现网址 `https://<用户名>.github.io/<仓库名>/`,打开即可。

### 方法二：命令行(已装 git)

```bash
cd birthday-cake
git init
git add .
git commit -m "birthday cake"
git branch -M main
git remote add origin https://github.com/<用户名>/<仓库名>.git
git push -u origin main
```

推送后,同样到 **Settings → Pages** 把 Source 设为 `main / root` 即可。

## 文件说明

| 文件 | 作用 |
| --- | --- |
| `index.html` | 全部内容(HTML/CSS/JS 都在里面),GitHub Pages 默认入口 |
| `.nojekyll` | 告诉 Pages 跳过 Jekyll 处理,原样提供静态文件 |
| `README.md` | 本说明 |

## 玩法

- 🔥 **点燃蜡烛**:点按钮或单独点某根蜡烛
- 🎤 **用麦克风吹**:授权后先安静 1 秒校准,再对着麦克风吹气
- 💨 **吹一口气**:不想用麦克风时,点按钮也能吹灭

## 自定义

打开 `index.html`,常见可改的地方:

- 蜡烛数量：顶部 `const CANDLE_COUNT = 5;`
- 标题文字：`<h1>生日快乐</h1>`、副标题 `<p class="sub" ...>`
- 吹气灵敏度：麦克风逻辑里的阈值 `Math.max(baseline+0.07, baseline*2.2, 0.10)`,数值调小更灵敏
- 配色：`:root{}` 里的颜色变量
