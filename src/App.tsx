import { useEffect, useState } from "react";

import {
  formatJson,
  highlightJson,
  type FormatResult,
  type JsonIndent,
} from "./json-utils";

const INDENT_KEY = "json-beautifier-indent";
const SAMPLE_JSON = `{
  "project": "Local JSON Beautifier",
  "private": true,
  "features": ["auto format", "syntax highlight", "custom indent"],
  "settings": {
    "indent": 2,
    "analytics": null
  }
}`;

type ViewStatus = FormatResult["status"] | "pending";

function readStoredIndent(): JsonIndent {
  if (typeof window === "undefined") return 2;
  const stored = window.localStorage.getItem(INDENT_KEY);
  if (stored === "4") return 4;
  if (stored === "tab") return "\t";
  return 2;
}

export default function App() {
  const [source, setSource] = useState("");
  const [indent, setIndent] = useState<JsonIndent>(readStoredIndent);
  const [formatted, setFormatted] = useState("");
  const [viewStatus, setViewStatus] = useState<ViewStatus>("empty");
  const [error, setError] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");

  const applyResult = (result: FormatResult) => {
    setViewStatus(result.status);
    setCopyFeedback("");

    if (result.status === "valid") {
      setFormatted(result.formatted);
      setError("");
      return;
    }

    if (result.status === "empty") {
      setFormatted("");
      setError("");
      return;
    }

    const location = result.location
      ? ` Line ${result.location.line}, column ${result.location.column}.`
      : "";
    setError(`${result.message}${location}`);
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      applyResult(formatJson(source, indent));
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [source, indent]);

  const handleSourceChange = (value: string) => {
    setSource(value);
    setCopyFeedback("");
    setViewStatus(value.trim() ? "pending" : "empty");
  };

  const handleIndentChange = (value: string) => {
    const nextIndent: JsonIndent =
      value === "4" ? 4 : value === "tab" ? "\t" : 2;
    setIndent(nextIndent);
    window.localStorage.setItem(INDENT_KEY, value);
    applyResult(formatJson(source, nextIndent));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatted);
      setCopyFeedback("Copied");
    } catch {
      setCopyFeedback("Copy failed");
    }
  };

  const statusText =
    copyFeedback ||
    (viewStatus === "pending"
      ? "Formatting…"
      : viewStatus === "valid"
        ? "Valid JSON"
        : viewStatus === "invalid"
          ? "Check the highlighted error"
          : "Ready — paste JSON to begin");

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="mark" aria-hidden="true">
            {"{ }"}
          </div>
          <div>
            <h1>JSON Beautifier</h1>
            <p>Format locally. Nothing leaves your browser.</p>
          </div>
        </div>

        <div className="toolbar" aria-label="Formatting tools">
          <label className="select-label" htmlFor="indentation">
            <span>Indentation</span>
            <select
              id="indentation"
              value={indent === "\t" ? "tab" : String(indent)}
              onChange={(event) => handleIndentChange(event.target.value)}
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="tab">Tab</option>
            </select>
          </label>
          <button
            className="button secondary"
            type="button"
            onClick={() => handleSourceChange(SAMPLE_JSON)}
          >
            Load sample
          </button>
          <button
            className="button secondary"
            type="button"
            onClick={() => handleSourceChange("")}
            disabled={!source}
          >
            Clear input
          </button>
        </div>
      </header>

      <section className="status-strip" aria-label="Privacy and status">
        <div className="privacy-note">
          <span className="privacy-dot" aria-hidden="true" />
          Local-only processing
        </div>
        <div role="status" aria-live="polite" className={`status ${viewStatus}`}>
          {statusText}
        </div>
      </section>

      <section className="workspace" aria-label="JSON formatter workspace">
        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Source</span>
              <label htmlFor="json-input">JSON input</label>
            </div>
            <span className="character-count">{source.length.toLocaleString()} chars</span>
          </div>
          <textarea
            id="json-input"
            value={source}
            onChange={(event) => handleSourceChange(event.target.value)}
            placeholder={'Paste or type JSON here…\n\n{"hello":"world"}'}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
          />
        </article>

        <article className="panel output-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Result</span>
              <span className="panel-title">Formatted JSON</span>
            </div>
            <button
              className="button primary"
              type="button"
              onClick={handleCopy}
              disabled={viewStatus !== "valid" || !formatted}
              aria-label="Copy formatted JSON"
            >
              {copyFeedback === "Copied" ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="output-wrap">
            <pre
              aria-label="Formatted JSON"
              data-stale={viewStatus === "invalid" ? "true" : "false"}
              className={!formatted ? "empty-output" : undefined}
              dangerouslySetInnerHTML={
                formatted
                  ? { __html: highlightJson(formatted) }
                  : undefined
              }
            >
              {!formatted ? "Formatted output will appear here" : undefined}
            </pre>
            {viewStatus === "invalid" && formatted ? (
              <span className="stale-badge">Last valid result</span>
            ) : null}
          </div>
        </article>
      </section>

      {error ? (
        <div className="error-banner" role="alert">
          <strong>Couldn’t parse this JSON.</strong>
          <span>{error}</span>
        </div>
      ) : null}

      <footer>
        <span>Auto-formats 250 ms after you stop typing</span>
        <span>No uploads · No tracking · No persistence</span>
      </footer>
    </main>
  );
}
