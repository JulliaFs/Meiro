export function MeiroLogo({ size = 20, dark = false }: { size?: number; dark?: boolean }) {
  const wingColor = dark ? "#171717" : "#ffffff";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="meiro-beam" x1="16" y1="7" x2="16" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="0.55" stopColor="#8b8cf6" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <polygon points="6,7 15,16 6,25" fill={wingColor} />
      <polygon points="26,7 17,16 26,25" fill={wingColor} />
      <rect x="14" y="9" width="4" height="14" fill="url(#meiro-beam)" />
    </svg>
  );
}
