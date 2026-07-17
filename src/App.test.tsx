import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppProvider } from "@channel.io/bezier-react";

import App from "./App";

function renderApp() {
  return render(
    <AppProvider themeName="dark">
      <App />
    </AppProvider>,
  );
}

describe("Local JSON Beautifier", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  async function finishDebounce() {
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
  }

  it("formats JSON automatically 250ms after input", async () => {
    renderApp();

    fireEvent.change(screen.getByLabelText("JSON input"), {
      target: { value: '{"name":"Ada"}' },
    });
    expect(screen.getByLabelText("Formatted JSON")).not.toHaveTextContent(
      '"name": "Ada"',
    );

    await finishDebounce();

    expect(screen.getByLabelText("Formatted JSON")).toHaveTextContent(
      '"name": "Ada"',
    );
    expect(screen.getByRole("status")).toHaveTextContent("Valid JSON");
  });

  it("reformats immediately when indentation changes and saves the preference", async () => {
    renderApp();
    fireEvent.change(screen.getByLabelText("JSON input"), {
      target: { value: '{"ok":true}' },
    });
    await finishDebounce();

    fireEvent.click(screen.getByRole("button", { name: "Indentation" }));
    await act(async () => {
      vi.advanceTimersByTime(32);
    });
    fireEvent.click(screen.getByRole("option", { name: "4 spaces" }));

    expect(screen.getByLabelText("Formatted JSON").textContent).toContain(
      '\n    "ok": true',
    );
    expect(localStorage.getItem("json-beautifier-indent")).toBe("4");
  });

  it("keeps the last valid result and marks it stale for invalid input", async () => {
    renderApp();
    const input = screen.getByLabelText("JSON input");
    fireEvent.change(input, { target: { value: '{"ok":true}' } });
    await finishDebounce();

    fireEvent.change(input, { target: { value: '{"ok":}' } });
    await finishDebounce();

    expect(screen.getByLabelText("Formatted JSON")).toHaveTextContent(
      '"ok": true',
    );
    expect(screen.getByLabelText("Formatted JSON")).toHaveAttribute(
      "data-stale",
      "true",
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid JSON");
  });

  it("loads a sample and clears both panes", async () => {
    renderApp();

    fireEvent.click(screen.getByRole("button", { name: "Load sample" }));
    await finishDebounce();
    expect(
      (screen.getByLabelText("JSON input") as HTMLTextAreaElement).value,
    ).toContain('"project"');
    expect(screen.getByLabelText("Formatted JSON")).toHaveTextContent(
      '"project"',
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear input" }));
    await finishDebounce();
    expect(screen.getByLabelText("JSON input")).toHaveValue("");
    expect(screen.getByLabelText("Formatted JSON")).toHaveTextContent(
      "Formatted output will appear here",
    );
  });

  it("copies only a valid formatted result", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderApp();
    const copy = screen.getByRole("button", { name: "Copy formatted JSON" });
    expect(copy).toBeDisabled();

    fireEvent.change(screen.getByLabelText("JSON input"), {
      target: { value: '{"ok":true}' },
    });
    await finishDebounce();
    fireEvent.click(copy);
    await act(async () => Promise.resolve());

    expect(writeText).toHaveBeenCalledWith('{\n  "ok": true\n}');
    expect(screen.getByRole("status")).toHaveTextContent("Copied");
  });

  it("exposes the Bezier toolbar actions with their existing accessible names", () => {
    renderApp();

    expect(
      screen.getByRole("button", { name: "Indentation" }),
    ).toHaveTextContent("2 spaces");
    expect(screen.getByRole("button", { name: "Load sample" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Clear input" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Copy formatted JSON" }),
    ).toBeDisabled();
  });
});
