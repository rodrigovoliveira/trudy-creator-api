import { NextResponse } from "next/server";

/**
 * GET /api/docs — como usar esta API (JSON).
 */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  return NextResponse.json({
    name: "trudy-creator-api",
    description:
      "Proxy para o endpoint Trudy (completeInfo Instagram), agregando o stream SSE em JSON.",
    baseUrl: origin,
    environmentVariables: {
      TRUDY_BRAND_ID: "ID da marca no Trudy (ex.: brnd_...)",
      TRUDY_TOKEN: "JWT de sessão (Clerk), o mesmo contexto da extensão Trudy",
      TRUDY_PROBE_USERNAME:
        "Opcional: username Instagram usado apenas por GET /api/token?probe=1 (padrão interno se omitido)",
    },
    endpoints: [
      {
        method: "GET",
        path: "/api/creator",
        description: "Busca dados do criador no Instagram via Trudy.",
        query: {
          username: "obrigatório — usuário Instagram (letras, números, . e _, até 30 caracteres)",
        },
        example: `${origin}/api/creator?username=USUARIO_INSTAGRAM`,
        response: {
          success: {
            username: "string",
            eventCount: "number",
            events: "array — eventos SSE parseados como JSON",
          },
          errors: [
            "400 — username ausente ou inválido",
            "500 — TRUDY_BRAND_ID ou TRUDY_TOKEN não configurados",
            "502 — falha de rede ou Trudy retornou status não OK",
          ],
        },
      },
      {
        method: "GET",
        path: "/api/token",
        description:
          "Verifica se TRUDY_BRAND_ID/TRUDY_TOKEN estão definidos e se o JWT ainda não expirou (claim exp). Não valida assinatura criptográfica.",
        query: {
          probe:
            "opcional — probe=1 ou probe=true faz uma requisição ao Trudy e informa se a resposta HTTP foi OK (testa aceitação do token no upstream)",
        },
        example: `${origin}/api/token`,
        exampleWithProbe: `${origin}/api/token?probe=1`,
        response: {
          fields: [
            "configured — ambos os segredos presentes",
            "valid — true se configurado e JWT com exp no futuro",
            "jwt.expiresAt, jwt.expired, jwt.secondsRemaining — quando aplicável",
            "probe — presente se query probe; inclui httpStatus do Trudy quando não skipped",
          ],
        },
      },
      {
        method: "GET",
        path: "/api/docs",
        description: "Esta documentação em JSON.",
        example: `${origin}/api/docs`,
      },
    ],
    notes: [
      "O token JWT expira; renove pela extensão Trudy e atualize TRUDY_TOKEN no ambiente.",
      "Validação local completa do fluxo: npm run validate:trudy (com .env.local).",
    ],
  });
}
