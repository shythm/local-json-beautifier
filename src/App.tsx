import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Select,
  SelectOption,
  Text,
} from "@channel.io/bezier-react/beta";

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
            <Text as="h1" typo="30" bold>
              JSON Beautifier
            </Text>
            <Text as="p" typo="13" color="text-neutral-lighter">
              Format locally. Nothing leaves your browser.
            </Text>
          </div>
        </div>

        <div className="toolbar" aria-label="Formatting tools">
          <div className="select-label">
            <Text as="span" typo="12" color="text-neutral-lighter">
              Indentation
            </Text>
            <Select
              aria-label="Indentation"
              value={indent === "\t" ? "tab" : String(indent)}
              onValueChange={handleIndentChange}
              triggerSize="m"
              dropdownWidth={160}
            >
              <SelectOption value="2" label="2 spaces" />
              <SelectOption value="4" label="4 spaces" />
              <SelectOption value="tab" label="Tab" />
            </Select>
          </div>
          <Button
            label="Load sample"
            variant="filled"
            semantic="secondary"
            size="m"
            type="button"
            onClick={() => handleSourceChange(SAMPLE_JSON)}
          />
          <Button
            label="Clear input"
            variant="filled"
            semantic="secondary"
            size="m"
            type="button"
            onClick={() => handleSourceChange("")}
            disabled={!source}
          />
        </div>
      </header>

      <section className="status-strip" aria-label="Privacy and status">
        <Badge className="privacy-badge" size="s" variant="green">
          Local-only processing
        </Badge>
        <div role="status" aria-live="polite" className={`status ${viewStatus}`}>
          <Text as="span" typo="12">
            {statusText}
          </Text>
        </div>
      </section>

      <section className="workspace" aria-label="JSON formatter workspace">
        <article className="panel">
          <div className="panel-header">
            <div>
              <Text as="span" className="eyebrow" typo="11" bold>
                Source
              </Text>
              <label htmlFor="json-input">JSON input</label>
            </div>
            <Text
              as="span"
              className="character-count"
              typo="11"
              color="text-neutral-lighter"
            >
              {source.length.toLocaleString()} chars
            </Text>
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
              <Text as="span" className="eyebrow" typo="11" bold>
                Result
              </Text>
              <Text as="span" className="panel-title" typo="14" bold>
                Formatted JSON
              </Text>
            </div>
            <Button
              label={copyFeedback === "Copied" ? "Copied" : "Copy"}
              variant="filled"
              semantic="primary"
              size="m"
              type="button"
              onClick={handleCopy}
              disabled={viewStatus !== "valid" || !formatted}
              aria-label="Copy formatted JSON"
            />
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
              <Badge className="stale-badge" size="s" variant="red">
                Last valid result
              </Badge>
            ) : null}
          </div>
        </article>
      </section>

      {error ? (
        <div className="error-banner" role="alert">
          <Text as="strong" typo="12" bold>
            Couldn’t parse this JSON.
          </Text>
          <Text as="span" typo="12">
            {error}
          </Text>
        </div>
      ) : null}

      <footer>
        <Text as="span" typo="11" color="text-neutral-lighter">
          Auto-formats 250 ms after you stop typing
        </Text>
        <Text as="span" typo="11" color="text-neutral-lighter">
          No uploads · No tracking · No persistence
        </Text>
      </footer>
    </main>
  );
}
