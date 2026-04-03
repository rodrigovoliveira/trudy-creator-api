import { NextResponse } from "next/server";
import {
  buildTrudyCompleteInfoUrl,
  isValidInstagramUsername,
  trudyFetchHeaders,
} from "@/lib/trudy";
import { inspectJwtExpiry } from "@/lib/jwt-inspect";

/** Username usado só em `?probe=1` para testar se o Trudy aceita o token (HTTP 200). */
const DEFAULT_PROBE_USERNAME = "brock11johnson";

/**
 * GET /api/token — status do token (env + JWT `exp`).
 * Opcional: ?probe=1 — uma requisição ao Trudy (só status HTTP), cancela o body em seguida.
 */
export async function GET(request: Request) {
  const brandId = process.env.TRUDY_BRAND_ID?.trim();
  const token = process.env.TRUDY_TOKEN?.trim();
  const configured = Boolean(brandId && token);

  const probeParam = new URL(request.url).searchParams.get("probe");
  const probe = probeParam === "1" || probeParam === "true";

  const base = {
    configured,
    brandIdSet: Boolean(brandId),
    tokenSet: Boolean(token),
  } as const;

  if (!token) {
    return NextResponse.json({
      ...base,
      valid: false,
      reason: "TRUDY_TOKEN não definido no ambiente",
      jwt: null,
      probe: probe ? { skipped: true as const, reason: "sem token" } : undefined,
    });
  }

  const jwt = inspectJwtExpiry(token);

  if (!jwt.ok) {
    return NextResponse.json({
      ...base,
      valid: false,
      reason: jwt.reason,
      jwt: { ok: false as const, reason: jwt.reason },
      probe: probe ? { skipped: true as const, reason: "JWT inválido" } : undefined,
    });
  }

  const hasExp = jwt.exp !== undefined && Number.isFinite(jwt.exp);
  const validByClock = hasExp ? !jwt.expired : false;
  const valid = configured && validByClock;

  let probeResult:
    | { skipped: true; reason: string }
    | {
        skipped: false;
        username: string;
        httpStatus: number;
        ok: boolean;
        error?: string;
      }
    | undefined;

  if (probe) {
    if (!brandId) {
      probeResult = { skipped: true, reason: "TRUDY_BRAND_ID não definido" };
    } else {
      const probeUser =
        process.env.TRUDY_PROBE_USERNAME?.trim() || DEFAULT_PROBE_USERNAME;
      if (!isValidInstagramUsername(probeUser)) {
        probeResult = {
          skipped: true,
          reason: "TRUDY_PROBE_USERNAME inválido para Instagram",
        };
      } else {
        const url = buildTrudyCompleteInfoUrl(probeUser, brandId, token);
        try {
          const upstream = await fetch(url, {
            method: "GET",
            headers: trudyFetchHeaders(),
            cache: "no-store",
            signal: AbortSignal.timeout(15_000),
          });
          try {
            upstream.body?.cancel();
          } catch {
            /* ignore */
          }
          probeResult = {
            skipped: false,
            username: probeUser,
            httpStatus: upstream.status,
            ok: upstream.ok,
          };
        } catch (e) {
          const message = e instanceof Error ? e.message : "fetch falhou";
          probeResult = {
            skipped: false,
            username: probeUser,
            httpStatus: 0,
            ok: false,
            error: message,
          };
        }
      }
    }
  }

  return NextResponse.json({
    ...base,
    valid,
    reason: !configured
      ? "defina TRUDY_BRAND_ID e TRUDY_TOKEN"
      : !hasExp
        ? "JWT sem claim exp — não é possível afirmar validade por tempo"
        : jwt.expired
          ? "JWT expirado (renove o token)"
          : valid
            ? "token configurado e JWT dentro da validade"
            : "inválido",
    jwt: {
      ok: true as const,
      expiresAt: jwt.expiresAtIso,
      expired: jwt.expired,
      secondsRemaining: jwt.secondsRemaining,
      hasExpClaim: hasExp,
    },
    ...(probeResult !== undefined ? { probe: probeResult } : {}),
  });
}
