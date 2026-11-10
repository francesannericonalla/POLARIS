export function PolarisLogo({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden="true"
      className={className}
    >
      {/* Orbital swoosh ellipse */}
      <ellipse
        cx="60" cy="60"
        rx="52" ry="20"
        fill="none"
        stroke="#C9A84C"
        strokeWidth="2"
        strokeLinecap="round"
        transform="rotate(-18, 60, 60)"
        opacity="0.9"
      />
      {/* Star / compass point on the orbital */}
      <g transform="translate(100, 32)">
        <path d="M0,-7 L1.6,-1.6 L7,0 L1.6,1.6 L0,7 L-1.6,1.6 L-7,0 L-1.6,-1.6 Z" fill="#C9A84C" />
      </g>
      {/* North compass point (the distinctive A crossbar element) */}
      <polygon points="60,8 64,20 56,20" fill="#C9A84C" opacity="0.85" />
      {/* Maroon filled center circle */}
      <circle cx="60" cy="60" r="22" fill="#800D2D" />
      {/* White A letterform inside */}
      <text
        x="60" y="68"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="22"
        fontFamily="Georgia, serif"
        fontWeight="700"
      >
        A
      </text>
    </svg>
  );
}
