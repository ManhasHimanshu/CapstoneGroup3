// A sharper baseball with rounded "stitches" and optional fill.
export default function BaseballIcon({
  size = 22,
  stroke = 'currentColor', // outline color
  seam = 'var(--primary)', // red stitches
  strokeWidth = 1.8,
  filled = true, // fill the ball or not
  fill = '#ffffff', // ball fill color when filled
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-hidden="true">
      {/* Ball */}
      <circle
        cx="12"
        cy="12"
        r="9"
        fill={filled ? fill : 'none'}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />

      {/* Seams (curved, mirrored) */}
      <path
        d="M7.2 4.8c2.2 2.1 2.2 12.3 0 14.4"
        stroke={seam}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray="1.4 3.2"
      />
      <path
        d="M16.8 4.8c-2.2 2.1-2.2 12.3 0 14.4"
        stroke={seam}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray="1.4 3.2"
      />

      {/* Subtle cross curves for depth */}
      <path
        d="M6.7 8.1c1.4.3 2.7.9 3.9 1.8M6.7 15.9c1.4-.3 2.7-.9 3.9-1.8"
        stroke={stroke}
        strokeWidth={strokeWidth * 0.7}
        strokeLinecap="round"
        opacity="0.35"
        fill="none"
      />
      <path
        d="M17.3 8.1c-1.4.3-2.7.9-3.9 1.8M17.3 15.9c-1.4-.3-2.7-.9-3.9-1.8"
        stroke={stroke}
        strokeWidth={strokeWidth * 0.7}
        strokeLinecap="round"
        opacity="0.35"
        fill="none"
      />
    </svg>
  );
}
