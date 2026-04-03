/**
 * Valida localmente o mesmo fluxo HTTP + SSE que a API usa.
 * Uso: copie .env.example para .env.local, preencha, depois:
 *   npm run validate:trudy
 *
 * Opcional: argumento na linha de comando (evita conflito com USERNAME do macOS):
 *   node --env-file=.env.local scripts/validate-trudy.mjs outro_user
 * Ou: TRUDY_TEST_USERNAME=outro_user npm run validate:trudy
 */
const TRUDY_BASE =
  "https://shopkeeper.trudy.app/stream/platform/instagram/completeInfo";

const brandId = process.env.TRUDY_BRAND_ID;
const token = process.env.TRUDY_TOKEN;
/** Não usar process.env.USERNAME — no macOS é o usuário do sistema. */
const username =
  process.argv[2]?.trim() ||
  process.env.TRUDY_TEST_USERNAME?.trim() ||
  process.env.IG_USERNAME?.trim() ||
  "brock11johnson";

if (!brandId || !token) {
  console.error(
    "Defina TRUDY_BRAND_ID e TRUDY_TOKEN (ex.: arquivo .env.local e npm run validate:trudy)"
  );
  process.exit(1);
}

const params = new URLSearchParams({ username, brandId, token });
const url = `${TRUDY_BASE}?${params}`;

const res = await fetch(url, {
  method: "GET",
  headers: {
    accept: "text/event-stream",
    "accept-language": "pt-BR,pt;q=0.9,en;q=0.8",
    "cache-control": "no-cache",
    origin: "https://www.instagram.com",
    referer: "https://www.instagram.com/",
    "sec-ch-ua":
      '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
  },
});

if (!res.ok) {
  const t = await res.text();
  console.error("HTTP", res.status, t.slice(0, 500));
  process.exit(1);
}

const text = await res.text();
const dataLines = [];
for (const block of text.split(/\r?\n\r?\n/)) {
  for (const line of block.split(/\r?\n/)) {
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }
}

console.log("OK — username:", username);
console.log("Linhas data: (SSE):", dataLines.length);
const parsed = dataLines.filter(Boolean).map((raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
});
console.log("Eventos parseados:", parsed.length);
if (parsed[0] !== undefined) {
  console.log("Primeiro evento (amostra):", JSON.stringify(parsed[0]).slice(0, 400));
}
