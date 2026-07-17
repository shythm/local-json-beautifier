import { describe, expect, it } from "vitest";

import { formatJson, highlightJson } from "./json-utils";

describe("formatJson", () => {
  it("returns an empty state for whitespace-only input", () => {
    expect(formatJson("  \n", 2)).toEqual({ status: "empty" });
  });

  it.each([
    [2, '{\n  "ok": true\n}'],
    [4, '{\n    "ok": true\n}'],
    ["\t", '{\n\t"ok": true\n}'],
  ] as const)("formats valid JSON using %s indentation", (indent, expected) => {
    expect(formatJson('{"ok":true}', indent)).toEqual({
      status: "valid",
      formatted: expected,
    });
  });

  it("reports a useful location for invalid JSON", () => {
    const result = formatJson('{\n  "ok": true,\n}', 2);

    expect(result.status).toBe("invalid");
    if (result.status === "invalid") {
      expect(result.message).toMatch(/JSON/i);
      expect(result.location).toEqual({ line: 3, column: 1 });
    }
  });
});

describe("highlightJson", () => {
  it("assigns distinct classes to JSON token types", () => {
    const html = highlightJson(
      '{"name":"Ada","age":37,"active":true,"other":null}',
    );

    expect(html).toContain('class="token key"');
    expect(html).toContain('class="token string"');
    expect(html).toContain('class="token number"');
    expect(html).toContain('class="token boolean"');
    expect(html).toContain('class="token null"');
    expect(html).toContain('class="token punctuation"');
  });

  it("escapes user-controlled markup before highlighting", () => {
    const html = highlightJson('{"value":"<script>alert(1)</script>"}');

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
