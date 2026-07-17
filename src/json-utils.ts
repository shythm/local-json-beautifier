export type JsonIndent = 2 | 4 | "\t";

export type ErrorLocation = {
  line: number;
  column: number;
};

export type FormatResult =
  | { status: "empty" }
  | { status: "valid"; formatted: string }
  | {
      status: "invalid";
      message: string;
      location: ErrorLocation | null;
    };

const TOKEN_PATTERN =
  /"(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\b(?:true|false|null)\b|[{}\[\],:]/g;

export function getErrorLocation(
  source: string,
  error: unknown,
): ErrorLocation | null {
  if (!(error instanceof Error)) return null;

  const explicitLocation = error.message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (explicitLocation) {
    return {
      line: Number(explicitLocation[1]),
      column: Number(explicitLocation[2]),
    };
  }

  const positionMatch = error.message.match(/position\s+(\d+)/i);
  if (!positionMatch) return null;

  const offset = Math.min(Number(positionMatch[1]), source.length);
  const beforeError = source.slice(0, offset);
  const lines = beforeError.split("\n");

  return {
    line: lines.length,
    column: (lines.at(-1)?.length ?? 0) + 1,
  };
}

export function formatJson(source: string, indent: JsonIndent): FormatResult {
  if (!source.trim()) return { status: "empty" };

  try {
    const parsed: unknown = JSON.parse(source);
    return {
      status: "valid",
      formatted: JSON.stringify(parsed, null, indent),
    };
  } catch (error) {
    return {
      status: "invalid",
      message: `Invalid JSON: ${error instanceof Error ? error.message : "Unable to parse input"}`,
      location: getErrorLocation(source, error),
    };
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getTokenType(token: string, remaining: string): string {
  if (token.startsWith('"')) {
    return /^\s*:/.test(remaining) ? "key" : "string";
  }
  if (/^-?\d/.test(token)) return "number";
  if (token === "true" || token === "false") return "boolean";
  if (token === "null") return "null";
  return "punctuation";
}

export function highlightJson(formatted: string): string {
  let html = "";
  let previousEnd = 0;

  for (const match of formatted.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    const token = match[0];
    html += escapeHtml(formatted.slice(previousEnd, index));
    html += `<span class="token ${getTokenType(token, formatted.slice(index + token.length))}">${escapeHtml(token)}</span>`;
    previousEnd = index + token.length;
  }

  return html + escapeHtml(formatted.slice(previousEnd));
}
