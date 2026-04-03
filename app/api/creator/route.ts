import { NextResponse } from "next/server";
import {
  collectSseDataLines,
  parseSseDataLinesAsJson,
} from "@/lib/parse-sse";
import {
  buildTrudyCompleteInfoUrl,
  isValidInstagramUsername,
  trudyFetchHeaders,
} from "@/lib/trudy";

/** Duração máxima na Vercel (ajuste conforme o plano; Pro+ permite até 300s). */
export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim() ?? "";

  if (!username) {
    return NextResponse.json(
      { error: "Parâmetro obrigatório: username" },
      { status: 400 }
    );
  }

  if (!isValidInstagramUsername(username)) {
    return NextResponse.json(
      { error: "username inválido para Instagram" },
      { status: 400 }
    );
  }

  const brandId = process.env.TRUDY_BRAND_ID;
  const token = process.env.TRUDY_TOKEN;

  if (!brandId || !token) {
    return NextResponse.json(
      {
        error:
          "Servidor não configurado: defina TRUDY_BRAND_ID e TRUDY_TOKEN no ambiente",
      },
      { status: 500 }
    );
  }

  const url = buildTrudyCompleteInfoUrl(username, brandId, token);

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "GET",
      headers: trudyFetchHeaders(),
      cache: "no-store",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "fetch falhou";
    return NextResponse.json(
      { error: "Falha ao contatar Trudy", detail: message },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    return NextResponse.json(
      {
        error: "Trudy retornou erro",
        status: upstream.status,
        body: text.slice(0, 2000),
      },
      { status: 502 }
    );
  }

  const dataLines = await collectSseDataLines(upstream.body);
  const events = parseSseDataLinesAsJson(dataLines);

  return NextResponse.json({
    username,
    eventCount: events.length,
    events,
  });
}
