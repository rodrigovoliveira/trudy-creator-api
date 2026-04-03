import { NextResponse } from "next/server";
import { buildOpenApiDocument } from "@/lib/openapi";

/** GET /api/openapi — especificação OpenAPI 3 (para Swagger UI, codegen, etc.). */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const doc = buildOpenApiDocument(origin);
  return NextResponse.json(doc, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
