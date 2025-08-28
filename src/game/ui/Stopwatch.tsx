import { useEffect, useState } from 'react';

function fmt(sec: number){
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Stopwatch({
  running,
  onTick,
}:{
  running: boolean;
  onTick?: (seconds: number) => void;
}){
  const [t, setT] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setT(v => {
        const nv = v + 1;
        onTick?.(nv);
        return nv;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, onTick]);

  return (
    <div className="fixed right-4 top-4 bg-white/90 rounded-xl px-4 py-2 shadow">
      ⏱️ {fmt(t)}
    </div>
  );
}
