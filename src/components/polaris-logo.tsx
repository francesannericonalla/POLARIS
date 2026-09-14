export function PolarisLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Polaris north star logo"
    >
      {/* 4 long cardinal points */}
      <path d="M24 2 L26.5 21.5 L24 24 L21.5 21.5 Z" fill="#D4A017" />
      <path d="M24 46 L21.5 26.5 L24 24 L26.5 26.5 Z" fill="#D4A017" />
      <path d="M2 24 L21.5 21.5 L24 24 L21.5 26.5 Z" fill="#D4A017" />
      <path d="M46 24 L26.5 26.5 L24 24 L26.5 21.5 Z" fill="#D4A017" />
      {/* 4 shorter diagonal points */}
      <path d="M8.69 8.69 L20.8 22 L24 24 L22 20.8 Z" fill="#D4A017" opacity="0.7" />
      <path d="M39.31 8.69 L28 20.8 L24 24 L27.2 22 Z" fill="#D4A017" opacity="0.7" />
      <path d="M8.69 39.31 L22 27.2 L24 24 L20.8 28 Z" fill="#D4A017" opacity="0.7" />
      <path d="M39.31 39.31 L27.2 26 L24 24 L28 27.2 Z" fill="#D4A017" opacity="0.7" />
      {/* Center dot */}
      <circle cx="24" cy="24" r="2.5" fill="#6D1223" />
    </svg>
  );
}
