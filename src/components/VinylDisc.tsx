interface VinylDiscProps {
  labelColor: string;
  size?: number;
  spinning?: boolean;
}

export default function VinylDisc({ labelColor, size = 160, spinning = false }: VinylDiscProps) {
  const id = `shine-${labelColor.replace('#', '')}`;
  return (
    <svg
      width={size} height={size} viewBox="0 0 200 200"
      className={spinning ? 'animate-spin' : ''}
      style={spinning ? { animationDuration: '4s' } : {}}
    >
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="white" stopOpacity="0.12" />
          <stop offset="60%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="99" fill="#111111" />
      {[88, 78, 68, 58, 48, 38, 28].map(r => (
        <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#222" strokeWidth="0.8" />
      ))}
      <circle cx="100" cy="100" r="32" fill={labelColor} />
      <circle cx="100" cy="100" r="32" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
      <circle cx="100" cy="100" r="24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      <circle cx="100" cy="100" r="4.5" fill="#111111" />
      <circle cx="100" cy="100" r="99" fill={`url(#${id})`} />
    </svg>
  );
}
