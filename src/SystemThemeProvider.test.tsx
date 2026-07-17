import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SystemThemeProvider from "./SystemThemeProvider";

describe("SystemThemeProvider", () => {
  let matches = false;
  let changeListener: (() => void) | undefined;
  const addEventListener = vi.fn(
    (_type: string, listener: EventListenerOrEventListenerObject) => {
      changeListener =
        typeof listener === "function" ? () => listener(new Event("change")) : undefined;
    },
  );
  const removeEventListener = vi.fn();

  beforeEach(() => {
    matches = false;
    changeListener = undefined;
    addEventListener.mockClear();
    removeEventListener.mockClear();

    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches,
        media: "(prefers-color-scheme: dark)",
        addEventListener,
        removeEventListener,
      })),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  function renderProvider() {
    return render(
      <SystemThemeProvider>
        <div data-testid="content">Content</div>
      </SystemThemeProvider>,
    );
  }

  it("uses the initial light system preference", () => {
    renderProvider();

    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute(
      "data-bezier-theme",
      "light",
    );
  });

  it("uses the initial dark system preference", () => {
    matches = true;

    renderProvider();

    expect(document.documentElement).toHaveAttribute(
      "data-bezier-theme",
      "dark",
    );
  });

  it("updates when the system preference changes", () => {
    renderProvider();

    matches = true;
    act(() => changeListener?.());

    expect(document.documentElement).toHaveAttribute(
      "data-bezier-theme",
      "dark",
    );
  });

  it("removes the system preference listener on unmount", () => {
    const { unmount } = renderProvider();

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });
});
