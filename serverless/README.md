# 许愿记录服务(Serverless)

让生日页的「小猪许愿」记录**自动写进本仓库**的 `wishes.csv`,许愿的人**无需登录**。
原理:网页把愿望 POST 给一个免费的 Cloudflare Worker,Worker 用你的密钥调用 GitHub API 追加到 `wishes.csv`。

> 为什么要 Worker?GitHub Pages 是纯静态站,不能在公开网页里放写入密钥(谁都能看到)。Worker 在服务端保管密钥,安全。

---

## 一、创建 GitHub 令牌(Token)

1. 打开 https://github.com/settings/personal-access-tokens/new (Fine-grained token)
2. **Resource owner** 选你自己;**Repository access** → Only select repositories → 选 `dy9759/birthdaycake`
3. **Repository permissions** → 找到 **Contents** → 设为 **Read and write**
4. 生成,复制那串 `github_pat_...`(只显示一次)

## 二、部署 Cloudflare Worker(免费)

1. 注册/登录 https://dash.cloudflare.com → 左侧 **Workers & Pages** → **Create** → **Create Worker**
2. 给它起个名字(如 `wish-logger`)→ Deploy 一个默认的
3. 进入这个 Worker → **Edit code**,把本目录 `wish-worker.js` 的内容**整段粘贴**进去 → **Deploy**
4. 回到 Worker 的 **Settings → Variables and Secrets** → **Add**:
   - 类型选 **Secret**
   - Name: `GITHUB_TOKEN`
   - Value: 第一步复制的 `github_pat_...`
   - 保存
5. 复制这个 Worker 的网址,形如 `https://wish-logger.<你的子域>.workers.dev`

## 三、把网址填进网页

打开仓库根目录的 `index.html`,找到这一行:

```js
const WISH_ENDPOINT = ''; // 例如 'https://wish-logger.xxxx.workers.dev'
```

把网址填进去,例如:

```js
const WISH_ENDPOINT = 'https://wish-logger.你的子域.workers.dev';
```

提交并推送(或在 GitHub 网页上直接改这一行并 Commit)。等 Pages 重新部署约 1 分钟即可。

---

## 四、在哪查看记录

每次有人许愿,仓库根目录的 **`wishes.csv`** 会新增一行:

```
time,wish,ua
"2026-06-19T08:30:00.000Z","大别墅和小狗 🏡🐶","Mozilla/5.0 ..."
```

- 在仓库里直接点开 `wishes.csv` 就能看(GitHub 会渲染成表格)。
- 也能在 **Commits** 里看到每条「wish: …」的提交。

> 注意:`wisher` 的浏览器 UA 仅用于区分设备,可按需删除该字段。
> 若你不想每条许愿都触发一次 Pages 重新部署,可把 `wish-worker.js` 里的 `BRANCH` 改成一个独立分支(需先在仓库建好该分支)。

## 安全说明
- 令牌只放在 Worker 的 Secret 里,**不会**出现在网页/仓库中。
- Worker 通过 `ALLOW_ORIGIN` 仅允许你的 Pages 域名调用。
- 令牌权限最小化:只对这一个仓库、只有 Contents 读写。随时可在 GitHub 设置里吊销。
