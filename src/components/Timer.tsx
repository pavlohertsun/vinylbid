import { useState, useEffect } from 'react';

interface TimerProps {
  endTime: number;
  onEnd?: () => void;
  className?: string;
}

export default function Timer({ endTime, onEnd, className = '' }: TimerProps) {
  const [remaining, setRemaining] = useState(Math.max(0, endTime - Date.now()));

  useEffect(() => {
    if (remaining === 0) { onEnd?.(); return; }
    const id = setInterval(() => {
      const r = Math.max(0, endTime - Date.now());
      setRemaining(r);
      if (r === 0) { onEnd?.(); clearInterval(id); }
    }, 1000);
    return () => clearInterval(id);
  }, [endTime, onEnd, remaining]);

  if (remaining === 0) return <span className={`text-red-500 font-medium ${className}`}>Завершено</span>;

  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1000);

  return (
    <span className={className}>
      {h > 0 && `${h}г `}{String(m).padStart(2, '0')}хв {String(s).padStart(2, '0')}с
    </span>
  );
}
