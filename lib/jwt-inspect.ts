/**
 * Decodifica o payload de um JWT (sem verificar assinatura).
 * Útil para checar `exp` e diagnóstico local.
 */
export type JwtInspectResult =
  | {
      ok: true;
      payload: Record<string, unknown>;
      exp: number | undefined;
      expiresAtIso: string | null;
      expired: boolean;
      secondsRemaining: number | null;
    }
  | { ok: false; reason: string };

export function inspectJwtExpiry(token: string): JwtInspectResult {
  const trimmed = token.trim();
  if (!trimmed) {
    return { ok: false, reason: "token vazio" };
  }

  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    return { ok: false, reason: "formato JWT inválido (esperado 3 segmentos)" };
  }

  let payload: Record<string, unknown>;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    const json = Buffer.from(b64 + pad, "base64").toString("utf8");
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, reason: "payload não é um objeto JSON" };
    }
    payload = parsed as Record<string, unknown>;
  } catch {
    return { ok: false, reason: "não foi possível decodificar o payload (base64/JSON)" };
  }

  const expRaw = payload.exp;
  const exp =
    typeof expRaw === "number"
      ? expRaw
      : typeof expRaw === "string"
        ? Number.parseInt(expRaw, 10)
        : undefined;

  const nowSec = Math.floor(Date.now() / 1000);
  let expired = false;
  let secondsRemaining: number | null = null;
  let expiresAtIso: string | null = null;

  if (exp !== undefined && Number.isFinite(exp)) {
    expiresAtIso = new Date(exp * 1000).toISOString();
    expired = nowSec >= exp;
    secondsRemaining = expired ? 0 : exp - nowSec;
  }

  return {
    ok: true,
    payload,
    exp,
    expiresAtIso,
    expired,
    secondsRemaining,
  };
}
