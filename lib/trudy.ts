const TRUDY_BASE =
  "https://shopkeeper.trudy.app/stream/platform/instagram/completeInfo";

/** Username Instagram: letras, números, ponto e underscore, até 30 caracteres. */
export function isValidInstagramUsername(u: string): boolean {
  return /^[a-zA-Z0-9._]{1,30}$/.test(u);
}

export function buildTrudyCompleteInfoUrl(
  username: string,
  brandId: string,
  token: string
): string {
  const params = new URLSearchParams({
    username,
    brandId,
    token,
  });
  return `${TRUDY_BASE}?${params.toString()}`;
}

/** Headers próximos ao navegador (como no curl da extensão Trudy). */
export function trudyFetchHeaders(): HeadersInit {
  return {
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
  };
}
