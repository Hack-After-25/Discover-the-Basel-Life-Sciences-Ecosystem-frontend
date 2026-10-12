const R = 18;
const C = 2 * Math.PI * R;

/** Match score 0–100 as a ring with the number inside. */
export function ScoreRing({ score, size = 52 }: { score: number; size?: number }) {
  const value = Math.max(0, Math.min(100, score));
  return (
    <div role="img" aria-label={`Match score ${score} out of 100`} className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden>
        <circle cx="22" cy="22" r={R} stroke="#E9EEF3" strokeWidth="4" fill="none" />
        <circle
          cx="22"
          cy="22"
          r={R}
          stroke="#0F766E"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * C} ${C}`}
          transform="rotate(-90 22 22)"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-[15px] font-medium">{score}</span>
    </div>
  );
}
