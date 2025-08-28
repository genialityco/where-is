/*import { useEffect, useState } from 'react';

export default function Timer({ running, onTimeout, timeLimitSec = 90 }:{
  running:boolean; onTimeout:()=>void; timeLimitSec?:number;
}){
  const [t, setT] = useState(timeLimitSec);
  useEffect(() => {
    if(!running) return;
    setT(timeLimitSec);
    const id = setInterval(() => setT(v => {
      if(v <= 1){ clearInterval(id); onTimeout(); return 0; }
      return v - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [running, timeLimitSec, onTimeout]);
  return <div className="fixed right-4 top-4 bg-white/90 rounded-xl px-4 py-2 shadow">⏱️ {t}s</div>;
}*/

// src/game/ui/Timer.tsx
import { useEffect, useRef, useState } from "react";

type Props = {
  /** Milisegundos totales. Default: 3 minutos */
  totalMs?: number;
  /** Pausar/reanudar el conteo */
  paused?: boolean;
  /** Tick opcional (cada segundo) */
  onTick?: (leftMs: number) => void;
  /** Se acaba el tiempo */
  onTimeout?: () => void;
  /** Clases Tailwind opcionales para el contenedor */
  className?: string;
};

export default function Timer({
  totalMs = 3 * 60 * 1000,
  paused = false,
  onTick,
  onTimeout,
  className = "",
}: Props) {
  const [left, setLeft] = useState(totalMs);
  const startedRef = useRef(false);

  // Si cambias el totalMs desde fuera, reinicia
  useEffect(() => {
    setLeft(totalMs);
  }, [totalMs]);

  useEffect(() => {
    if (paused) return;
    // Evita arrancar doble vez si React Strict (dev) re-monta
    if (startedRef.current) {
      // ok
    } else {
      startedRef.current = true;
    }

    const id = window.setInterval(() => {
      setLeft((prev) => {
        const next = Math.max(0, prev - 1000);
        onTick?.(next);
        if (next === 0) {
          window.clearInterval(id);
          onTimeout?.();
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [paused]);

  const mm = Math.floor(left / 60000);
  const ss = Math.floor((left % 60000) / 1000);
  const text = `${mm}:${ss.toString().padStart(2, "0")}`;

  return (
    <div
      className={`select-none fixed right-4 top-4 bg-white/90 rounded-xl px-4 py-2 shadow ${className}`}
      aria-label="Tiempo restante"
      title="Tiempo restante"
    >
      ⏱️
      {text}
    </div>
  );
}

