/**
 * Documento OpenAPI 3.0 — fonte para /api/openapi e UI em /docs.
 */
export function buildOpenApiDocument(origin: string): Record<string, unknown> {
  const server = origin.replace(/\/$/, "");

  return {
    openapi: "3.0.3",
    info: {
      title: "trudy-creator-api",
      version: "0.1.0",
      description:
        "Proxy para o endpoint Trudy (completeInfo Instagram), agregando o stream SSE em JSON.\n\n" +
        "**Ambiente:** defina `TRUDY_BRAND_ID` e `TRUDY_TOKEN` no servidor (Vercel).\n\n" +
        "**Token:** JWT (Clerk) expira — renove na extensão Trudy e atualize o segredo.",
    },
    servers: [{ url: server, description: "Implantação atual" }],
    tags: [
      { name: "creator", description: "Dados de criador Instagram via Trudy" },
      { name: "meta", description: "Documentação e diagnóstico" },
    ],
    paths: {
      "/api/creator": {
        get: {
          tags: ["creator"],
          summary: "Complete info (Instagram)",
          description:
            "Encaminha ao Trudy e devolve os eventos SSE agregados em JSON (`events`).",
          parameters: [
            {
              name: "username",
              in: "query",
              required: true,
              schema: { type: "string", pattern: "^[a-zA-Z0-9._]{1,30}$" },
              description: "Usuário Instagram (letras, números, `.` e `_`, até 30 caracteres).",
              example: "usuario",
            },
          ],
          responses: {
            "200": {
              description: "Sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["username", "eventCount", "events"],
                    properties: {
                      username: { type: "string" },
                      eventCount: { type: "integer" },
                      events: {
                        type: "array",
                        items: {},
                        description: "Eventos SSE parseados como JSON",
                      },
                    },
                  },
                },
              },
            },
            "400": { description: "`username` ausente ou inválido" },
            "500": { description: "`TRUDY_BRAND_ID` ou `TRUDY_TOKEN` não configurados" },
            "502": {
              description: "Falha de rede ou Trudy retornou status não OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: { type: "string" },
                      status: { type: "integer" },
                      body: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/token": {
        get: {
          tags: ["meta"],
          summary: "Status do token (JWT)",
          description:
            "Verifica se os segredos estão definidos e se o claim `exp` do JWT ainda é futuro. " +
            "Não valida assinatura criptográfica. Use `probe` para testar HTTP contra o Trudy.",
          parameters: [
            {
              name: "probe",
              in: "query",
              required: false,
              schema: { type: "string", enum: ["1", "true"] },
              description:
                "Se `1` ou `true`, faz uma requisição ao Trudy e retorna se a resposta foi OK (cancela o body SSE).",
            },
          ],
          responses: {
            "200": {
              description: "Diagnóstico",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      configured: { type: "boolean" },
                      valid: { type: "boolean" },
                      reason: { type: "string" },
                      jwt: { type: "object", additionalProperties: true },
                      probe: { type: "object", additionalProperties: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/docs": {
        get: {
          tags: ["meta"],
          summary: "Documentação legada (JSON)",
          description:
            "Objeto JSON com textos de ajuda (formato próprio). Preferir `/api/openapi` + página `/docs`.",
          responses: {
            "200": {
              description: "JSON de ajuda",
              content: { "application/json": { schema: { type: "object" } } },
            },
          },
        },
      },
      "/api/openapi": {
        get: {
          tags: ["meta"],
          summary: "Especificação OpenAPI",
          description: "Este documento em JSON (OpenAPI 3).",
          responses: {
            "200": {
              description: "OpenAPI 3.0",
              content: {
                "application/json": {
                  schema: { type: "object", additionalProperties: true },
                },
              },
            },
          },
        },
      },
    },
  };
}
