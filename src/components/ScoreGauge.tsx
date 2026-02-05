"use client";

interface ScoreGaugeProps {
  score: number;
  large?: boolean;
}

export default function ScoreGauge({ score, large }: ScoreGaugeProps) {
  const getColor = (s: number) => {
    if (s >= 85) return "#10b981";
    if (s >= 70) return "#f59e0b";
    return "#ef4444";
  };

  const color = getColor(score);

  return (
    <div className={`score-gauge ${large ? "large" : ""}`}>
      <svg viewBox="0 0 100 50" className="gauge-svg">
        <path
          d="M 10 45 A 35 35 0 0 1 90 45"
          fill="none"
          stroke="#1e293b"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 10 45 A 35 35 0 0 1 90 45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${score * 1.1} 110`}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="score-value" style={{ color }}>
        {score}
      </div>
    </div>
  );
}
