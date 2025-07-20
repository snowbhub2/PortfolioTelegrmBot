import React from "react";

interface MiniChartProps {
  data: number[];
  isPositive: boolean;
  width?: number;
  height?: number;
}

export function MiniChart({
  data,
  isPositive,
  width = 80,
  height = 40,
}: MiniChartProps) {
  if (data.length < 2) {
    return (
      <svg width={width} height={height} className="overflow-visible">
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          opacity="0.3"
        />
      </svg>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  if (range === 0) {
    return (
      <svg width={width} height={height} className="overflow-visible">
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={
            isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"
          }
          strokeWidth="2"
        />
      </svg>
    );
  }

  const points = data
    .map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((point - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
