'use client';

import { useMemo } from 'react';

interface BarPosition {
  rowId: string;
  startX: number; // pixel offset from timeline left
  endX: number;
  centerY: number; // vertical center of the row
}

interface DependencyArrowsProps {
  dependencies: Map<string, string[]>;
  barPositions: BarPosition[];
}

function findBar(positions: BarPosition[], id: string): BarPosition | undefined {
  return positions.find((p) => p.rowId === id);
}

function buildPath(from: BarPosition, to: BarPosition): string {
  const sx = from.endX;
  const sy = from.centerY;
  const ex = to.startX;
  const ey = to.centerY;

  // If successor starts after predecessor ends — simple right-then-down curve
  if (ex >= sx) {
    const midX = sx + (ex - sx) / 2;
    return `M ${sx},${sy} C ${midX},${sy} ${midX},${ey} ${ex},${ey}`;
  }

  // Overlap: shorter curve with offset
  const offset = 16;
  return `M ${sx},${sy} C ${sx + offset},${sy} ${ex - offset},${ey} ${ex},${ey}`;
}

export function DependencyArrows({ dependencies, barPositions }: DependencyArrowsProps) {
  const arrows = useMemo(() => {
    const result: { from: BarPosition; to: BarPosition; path: string }[] = [];

    dependencies.forEach((prereqs, taskId) => {
      const to = findBar(barPositions, taskId);
      if (!to) return;

      prereqs.forEach((prereqId) => {
        const from = findBar(barPositions, prereqId);
        if (!from) return;
        result.push({ from, to, path: buildPath(from, to) });
      });
    });

    return result;
  }, [dependencies, barPositions]);

  if (arrows.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 15, overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#94A3B8" />
        </marker>
      </defs>
      {arrows.map((arrow, i) => (
        <path
          key={i}
          d={arrow.path}
          fill="none"
          stroke="#94A3B8"
          strokeWidth="1.5"
          markerEnd="url(#arrowhead)"
        />
      ))}
    </svg>
  );
}
