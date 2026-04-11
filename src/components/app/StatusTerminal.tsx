import { useEffect, useState, useRef } from 'react';

interface StatusTerminalProps {
  lines: string[];
  active: boolean;
}

export function StatusTerminal({ lines, active }: StatusTerminalProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) {
      setVisibleCount(lines.length);
      return;
    }
    setVisibleCount(0);
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= lines.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [lines, active]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleCount]);

  const visibleLines = lines.slice(Math.max(0, visibleCount - 8), visibleCount);

  return (
    <div
      ref={containerRef}
      className="rounded-lg bg-background border border-border p-4 font-mono text-sm max-h-[300px] overflow-y-auto"
    >
      {visibleLines.map((line, i) => (
        <div key={i} className="text-risk-low">
          <span className="text-muted-foreground">&gt; </span>
          {line}
          {i === visibleLines.length - 1 && active && visibleCount <= lines.length && (
            <span className="inline-block w-2 h-4 bg-risk-low ml-1 animate-pulse" />
          )}
        </div>
      ))}
    </div>
  );
}
