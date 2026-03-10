import { useEffect, useRef, useState } from "react";
import { HygieneVerdict } from "../backend";

interface ScoreMeterProps {
  score: number;
  verdict: HygieneVerdict;
  animate?: boolean;
}

const VERDICT_COLORS: Record<HygieneVerdict, string> = {
  [HygieneVerdict.excellent]: "#10b981",
  [HygieneVerdict.good]: "#22c55e",
  [HygieneVerdict.fair]: "#f97316",
  [HygieneVerdict.poor]: "#ef4444",
};

const VERDICT_GLOW: Record<HygieneVerdict, string> = {
  [HygieneVerdict.excellent]: "rgba(16,185,129,0.4)",
  [HygieneVerdict.good]: "rgba(34,197,94,0.4)",
  [HygieneVerdict.fair]: "rgba(249,115,22,0.4)",
  [HygieneVerdict.poor]: "rgba(239,68,68,0.4)",
};

export function ScoreMeter({
  score,
  verdict,
  animate = true,
}: ScoreMeterProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const [arcOffset, setArcOffset] = useState<number | null>(null);
  const animRef = useRef<number | null>(null);

  const size = 200;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const startAngle = 225;
  const sweepAngle = 270;
  const endAngle = startAngle + sweepAngle;

  const polarToCartesian = (angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  const describeArc = (start: number, end: number) => {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  const totalPath = describeArc(startAngle, endAngle);

  const circumference = 2 * Math.PI * radius;
  const arcFraction = sweepAngle / 360;
  const arcLength = circumference * arcFraction;

  useEffect(() => {
    const targetOffset = arcLength - (score / 100) * arcLength;

    if (!animate) {
      setDisplayScore(score);
      setArcOffset(targetOffset);
      return;
    }

    const duration = 1200;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayScore(Math.round(eased * score));

      const offset = arcLength - eased * (score / 100) * arcLength;
      setArcOffset(offset);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(tick);
      }
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [score, animate, arcLength]);

  const color = VERDICT_COLORS[verdict];
  const glow = VERDICT_GLOW[verdict];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="absolute inset-0"
          aria-label={`Hygiene score: ${displayScore} out of 100`}
          role="img"
        >
          <title>Hygiene score: {displayScore} out of 100</title>
          <defs>
            <filter id="glow-filter">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d={totalPath}
            fill="none"
            stroke="oklch(0.28 0.015 250)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {arcOffset !== null && (
            <path
              d={totalPath}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={arcLength}
              strokeDashoffset={arcOffset}
              style={{ filter: `drop-shadow(0 0 8px ${glow})` }}
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-display font-bold leading-none"
            style={{ color }}
          >
            {displayScore}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
            / 100
          </span>
        </div>
      </div>
    </div>
  );
}
