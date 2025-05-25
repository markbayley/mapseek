import React from "react";

interface CircularProgressProps {
  value: number;
  max?: number;
  label: string;
  color: string;
  unit?: string;
}

const size = 68;
const strokeWidth = 8;
const radius = (size - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  label,
  color,
  unit = "%",
}) => {
  const percent = Math.min(Math.max(value / max, 0), 1) || 0;
  const offset = circumference * (1 - percent);

  return (
    <div style={{ width: size, height: size + 24, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ display: "block" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#eee"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s" }}
          />
        </svg>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: 500,
          color: "#555"
        }}>
          {isNaN(value) ? "N/A" : `${value}${unit}`}
        </div>
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: "#888", textAlign: "center" }}>{label}</div>
    </div>
  );
}; 