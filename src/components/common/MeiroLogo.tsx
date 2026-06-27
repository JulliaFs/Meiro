export function MeiroLogo({ size = 20, dark = false }: { size?: number; dark?: boolean }) {
  const wingColor = dark ? "#171717" : "#ffffff";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="meiro-beam" x1="16" y1="8" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="0.45" stopColor="#f0abfc" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <polygon points="6,6 16,16 6,26" fill={wingColor} />
      <polygon points="26,6 16,16 26,26" fill={wingColor} />
      <path
        d="M16,8 C16,11.5 16,13.5 13,15.5 C10,17.5 13,19.5 16,21.5 C19,23.5 14.5,25.5 12.5,28"
        fill="none"
        stroke="url(#meiro-beam)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
