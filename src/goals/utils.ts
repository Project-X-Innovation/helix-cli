/**
 * Parses API error responses into user-friendly error messages.
 *
 * Handles the pattern where hxFetch throws errors in the format:
 *   "HTTP <status> — <JSON body>"
 *
 * If the body JSON has an `.error` field, returns that.
 * Otherwise returns the raw error message.
 */
export function parseApiError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  const dashIdx = msg.indexOf(" — ");
  if (dashIdx !== -1) {
    const bodyPart = msg.slice(dashIdx + 3);
    try {
      const parsed = JSON.parse(bodyPart);
      if (parsed.error) {
        return parsed.error as string;
      }
    } catch {
      // JSON parse failed — fall through to raw message
    }
  }
  return msg;
}
