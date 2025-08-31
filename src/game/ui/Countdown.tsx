import { useEffect, useState } from "react";

type Size = "sm" | "md" | "lg" | "xl";

type Props = {
  seconds: number;           // p.ej. 180
  running?: boolean;         // default true
  onTick?: (left: number) => void;
  onFinish?: () => void;
  /** Tamaño visual del reloj (afecta padding y tipografía) */
  size?: Size;               // default "lg"
  /** Clases extra (usa aquí solo posicionamiento, p.ej. "fixed right-4 top-4") */
  className?: string;
};

const SIZE_STYLES: Record<Size, { pad: string; text: string; icon: string }> = {
  sm: { pad: "px-3 py-1.5", text: "text-base",  icon: "text-base"  },
  md: { pad: "px-4 py-2",   text: "text-xl",    icon: "text-xl"    },
  lg: { pad: "px-5 py-2.5", text: "text-2xl",   icon: "text-2xl"   },
  xl: { pad: "px-6 py-3",   text: "text-3xl",   icon: "text-2xl"   },
};

export default function Countdown({
  seconds,
  running = true,
  onTick,
  onFinish,
  size = "lg",
  className = "",
}: Props) {
  const [left, setLeft] = useState(seconds);

  // reinicia si cambia "seconds"
  useEffect(() => { setLeft(seconds); }, [seconds]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((prev) => {
        const next = Math.max(0, prev - 1);
        onTick?.(next);
        if (next === 0) {
          clearInterval(id);
          onFinish?.();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, onTick, onFinish]);

  const mm = Math.floor(left / 60).toString().padStart(2, "0");
  const ss = (left % 60).toString().padStart(2, "0");
  const s = SIZE_STYLES[size];

  return (
    <div
      className={`z-20 ${className}`}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Tiempo restante ${mm}:${ss}`}
      title="Tiempo restante"
    >
      <div
        className={`flex items-center gap-2 rounded-full bg-white/95
                    ring-1 ring-black/5 shadow-xl select-none ${s.pad}`}
      >
        <span className={`text-buk-500 ${s.icon}`} aria-hidden>⏱️</span>
        <span className={`tabular-nums font-semibold tracking-wide ${s.text}`}>
          {mm}:{ss}
        </span>
      </div>
    </div>
  );
}
