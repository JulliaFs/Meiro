export function MeiroLogo({ size = 20 }: { size?: number; dark?: boolean }) {
  return (
    <img
      src="/logo-mark.png"
      alt="Meiro"
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: size * 0.2 }}
    />
  );
}
