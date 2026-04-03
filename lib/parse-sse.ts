/**
 * Lê um stream text/event-stream e extrai linhas `data:` (payload SSE).
 */
export async function collectSseDataLines(
  body: ReadableStream<Uint8Array> | null
): Promise<string[]> {
  if (!body) return [];
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const dataLines: string[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const chunks = buffer.split(/\r?\n\r?\n/);
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      for (const line of chunk.split(/\r?\n/)) {
        if (line.startsWith("data:")) {
          dataLines.push(line.slice(5).trim());
        }
      }
    }
  }

  for (const line of buffer.split(/\r?\n/)) {
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }

  return dataLines;
}

export function parseSseDataLinesAsJson(dataLines: string[]): unknown[] {
  const out: unknown[] = [];
  for (const raw of dataLines) {
    if (!raw || raw === "[DONE]") continue;
    try {
      out.push(JSON.parse(raw));
    } catch {
      out.push(raw);
    }
  }
  return out;
}
