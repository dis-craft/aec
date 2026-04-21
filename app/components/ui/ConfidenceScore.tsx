interface ConfidenceScoreProps {
  score: number;
  size?: number;
}

export function ConfidenceScore({ score, size = 56 }: ConfidenceScoreProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 80 ? '#43e97b' : score >= 60 ? '#f9a825' : '#ff6584';

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: size < 60 ? '0.7rem' : '0.9rem', fontWeight: 700, color, lineHeight: 1 }}>
          {score}%
        </span>
      </div>
    </div>
  );
}
