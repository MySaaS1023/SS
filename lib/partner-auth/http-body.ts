export class AuthBodyLimitError extends Error {
  constructor() { super("Request body exceeds the byte limit."); this.name = "AuthBodyLimitError"; }
}
export async function readLimitedAuthBody(request: Request, maximumBytes: number) {
  const reader = request.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let total = 0;
  let text = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      total += chunk.value.byteLength;
      if (total > maximumBytes) {
        await reader.cancel().catch(() => {});
        throw new AuthBodyLimitError();
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    return text + decoder.decode();
  } finally { reader.releaseLock(); }
}
