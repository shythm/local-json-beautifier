import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useRef,
  useState,
} from "react";

const DEFAULT_SOURCE_WIDTH = 50;
const MIN_SOURCE_WIDTH = 25;
const MAX_SOURCE_WIDTH = 75;
const KEYBOARD_STEP = 2;

interface ResizableWorkspaceProps {
  sourcePanel: ReactNode;
  resultPanel: ReactNode;
}

function clampSourceWidth(value: number) {
  return Math.min(MAX_SOURCE_WIDTH, Math.max(MIN_SOURCE_WIDTH, value));
}

export default function ResizableWorkspace({
  sourcePanel,
  resultPanel,
}: ResizableWorkspaceProps) {
  const [sourceWidth, setSourceWidth] = useState(DEFAULT_SOURCE_WIDTH);
  const workspaceRef = useRef<HTMLElement>(null);
  const isDraggingRef = useRef(false);

  const resizeFromPointer = (clientX: number) => {
    const bounds = workspaceRef.current?.getBoundingClientRect();
    if (!bounds || bounds.width === 0) return;

    const nextWidth = ((clientX - bounds.left) / bounds.width) * 100;
    setSourceWidth(clampSourceWidth(nextWidth));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    resizeFromPointer(event.clientX);
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!isDraggingRef.current) return;
    resizeFromPointer(event.clientX);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        setSourceWidth((current) =>
          clampSourceWidth(current - KEYBOARD_STEP),
        );
        break;
      case "ArrowRight":
        event.preventDefault();
        setSourceWidth((current) =>
          clampSourceWidth(current + KEYBOARD_STEP),
        );
        break;
      case "Home":
        event.preventDefault();
        setSourceWidth(MIN_SOURCE_WIDTH);
        break;
      case "End":
        event.preventDefault();
        setSourceWidth(MAX_SOURCE_WIDTH);
        break;
    }
  };

  return (
    <section
      ref={workspaceRef}
      className="workspace"
      aria-label="JSON formatter workspace"
      style={
        { "--source-panel-width": `${sourceWidth}%` } as CSSProperties
      }
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {sourcePanel}
      <div
        className="workspace-divider"
        role="separator"
        aria-label="Resize JSON panels"
        aria-orientation="vertical"
        aria-valuemin={MIN_SOURCE_WIDTH}
        aria-valuemax={MAX_SOURCE_WIDTH}
        aria-valuenow={Math.round(sourceWidth)}
        aria-valuetext={`${Math.round(sourceWidth)}% source panel`}
        tabIndex={0}
        onDoubleClick={() => setSourceWidth(DEFAULT_SOURCE_WIDTH)}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
      />
      {resultPanel}
    </section>
  );
}
