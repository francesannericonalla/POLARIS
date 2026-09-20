export function PolarisLogo({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden="true"
      className={className}
    >
      {/* Spinning shadow petals */}
      <g style={{ transformOrigin: "50px 50px", animation: "polRoseSpin 150s linear infinite" }}>
        <path d="M50 50 L60 40 L84 16 L60 60 Z" fill="#9C6F1F" opacity=".9" />
        <path d="M50 50 L60 60 L84 84 L40 60 Z" fill="#9C6F1F" opacity=".9" />
        <path d="M50 50 L40 60 L16 84 L40 40 Z" fill="#9C6F1F" opacity=".9" />
        <path d="M50 50 L40 40 L16 16 L60 40 Z" fill="#9C6F1F" opacity=".9" />
      </g>
      {/* Breathing compass rose */}
      <g style={{ transformOrigin: "50px 50px", animation: "polRoseBreathe 9s ease-in-out infinite" }}>
        <path d="M50 1 L64 40 L50 99 L36 40 Z" fill="#D9A43A" />
        <path d="M1 50 L40 36 L99 50 L40 64 Z" fill="#C9973A" />
        <circle cx="50" cy="50" r="16" fill="#7A1330" />
        <circle cx="50" cy="50" r="16" fill="none" stroke="#E8C66E" strokeWidth="4" opacity=".95" />
      </g>
    </svg>
  );
}
