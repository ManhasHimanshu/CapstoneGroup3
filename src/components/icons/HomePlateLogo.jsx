export default function HomePlateLogo({ size = 24, stroke = 'currentColor', strokeWidth = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label="Home plate logo">
      {/* Home plate outline */}
      <path
        d="M4 3h16v11l-8 7-8-7V3z"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {/* Subtle stitch-inspired arcs (abstract, not emoji-like) */}
      <path
        d="M8 9c2.2 1.1 5.8 1.1 8 0"
        fill="none"
        stroke="var(--primary)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M8 12c2.2 1.1 5.8 1.1 8 0"
        fill="none"
        stroke="var(--primary)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity=".85"
      />
    </svg>
  );
}
