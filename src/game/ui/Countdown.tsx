import { useEffect, useRef, useState } from "react";

type Props = {
  seconds: number;           // p.ej. 180
  running?: boolean;         // default true
  onTick?: (left: number) => void;
  onFinish?: () => void;
  className?: string;
};

export default function Countdown({
  seconds,
  running = true,
  onTick,
  onFinish,
  className,
}: Props) {
  const [left, setLeft] = useState(seconds);
  const started = useRef(false);

  // reinicia si cambia "seconds"
  useEffect(() => { setLeft(seconds); started.current = false; }, [seconds]);

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
  }, [running]);

  const mm = Math.floor(left / 60).toString().padStart(2, "0");
  const ss = (left % 60).toString().padStart(2, "0");

  return (
    <div className={className ?? "fixed right-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-sm shadow"}>
      ⏱ {mm}:{ss}
    </div>
  );
}
