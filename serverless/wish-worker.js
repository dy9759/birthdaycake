/**
 * Cloudflare Worker — 把生日页的"小猪许愿"记录写进 GitHub 仓库的 wishes.csv
 *
 * 部署后,把 Worker 的网址填到 index.html 里的 WISH_ENDPOINT。
 * 需要在 Worker 里配置一个密钥(Secret):GITHUB_TOKEN
 *   - 用一个「细粒度个人访问令牌(Fine-grained PAT)」
 *   - 仅授权这一个仓库 dy9759/birthdaycake
 *   - 权限:Repository permissions → Contents → Read and write
 *
 * 详见同目录 README.md。
 */

const OWNER = "dy9759";
const REPO = "birthdaycake";
const BRANCH = "claude/github-pages-setup-u8v1pg"; // 记录写到的分支(= Pages 部署分支)
const PATH = "wishes.csv";
const ALLOW_ORIGIN = "https://dy9759.github.io"; // 只允许你的页面调用

function b64encode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}
function b64decode(b64) {
  const bin = atob(b64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
function clean(s) {
  return String(s || "").replace(/[\r\n"]/g, " ").slice(0, 200);
}

export default {
  async fetch(req, env) {
    const cors = {
      "Access-Control-Allow-Origin": ALLOW_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST")
      return new Response("ok", { headers: cors });

    let data = {};
    try { data = await req.json(); } catch (e) {}
    const ts = clean(data.ts || new Date().toISOString());
    const wish = clean(data.wish);
    const ua = clean(data.ua);
    if (!wish) return new Response("empty", { status: 400, headers: cors });
    const line = `"${ts}","${wish}","${ua}"\n`;

    const api = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(PATH)}`;
    const gh = {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "wish-logger",
    };

    // 读取-追加-写回,遇到并发冲突(409)重试几次
    for (let attempt = 0; attempt < 4; attempt++) {
      let sha = null;
      let content = "time,wish,ua\n";
      const getRes = await fetch(`${api}?ref=${BRANCH}`, { headers: gh });
      if (getRes.status === 200) {
        const j = await getRes.json();
        sha = j.sha;
        content = b64decode(j.content);
      } else if (getRes.status !== 404) {
        return new Response("github get " + getRes.status, { status: 502, headers: cors });
      }

      const body = {
        message: "wish: " + wish.slice(0, 50),
        content: b64encode(content + line),
        branch: BRANCH,
      };
      if (sha) body.sha = sha;

      const putRes = await fetch(api, {
        method: "PUT",
        headers: { ...gh, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (putRes.ok) return new Response("saved", { headers: cors });
      if (putRes.status === 409) continue; // sha 冲突,重试
      const t = await putRes.text();
      return new Response("github put " + putRes.status + " " + t, { status: 502, headers: cors });
    }
    return new Response("conflict", { status: 409, headers: cors });
  },
};
