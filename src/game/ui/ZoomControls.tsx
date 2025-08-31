// src/game/ui/ZoomControls.tsx
import { useRef } from "react";

type Props = { onIn: () => void; onOut: () => void };

export default function ZoomControls({ onIn, onOut }: Props) {
  const holdTimer = useRef<number | null>(null);     // delay para iniciar repetición
  const repeatTimer = useRef<number | null>(null);   // intervalo de repetición

  function clearTimers() {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
    if (repeatTimer.current) { clearInterval(repeatTimer.current); repeatTimer.current = null; }
  }

  function start(kind: "in" | "out") {
    const run = kind === "in" ? onIn : onOut;
    run(); // 1 paso inmediato
    clearTimers();
    // solo si se mantiene >300ms comenzamos repetición suave
    holdTimer.current = window.setTimeout(() => {
      repeatTimer.current = window.setInterval(run, 120);
    }, 300);
  }

  const keycap =
    "grid place-items-center w-[44px] h-[36px] rounded-xl " +
    "bg-[#EFF3FA] shadow-[inset_0_-2px_0_rgba(16,24,40,.06)] " +
    "text-[22px] leading-none";

  return (
    <div className="fixed right-4 bottom-4 z-50 pointer-events-auto">
      <div className="w-[56px] rounded-[22px] border border-black/10 bg-white/90 backdrop-blur-sm
                      shadow-[0_12px_24px_rgba(16,24,40,.16)] overflow-hidden">
        {/* + */}
        <button
          type="button"
          aria-label="Acercar"
          onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); start("in"); }}
          onPointerUp={(e) => { e.preventDefault(); clearTimers(); }}
          onPointerCancel={clearTimers}
          onPointerLeave={clearTimers}
          className="w-full h-14 grid place-items-center focus:outline-none active:translate-y-[1px]"
        >
          <span className={keycap}>+</span>
        </button>

        <div className="mx-3 h-px bg-black/10" />

        {/* − */}
        <button
          type="button"
          aria-label="Alejar"
          onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); start("out"); }}
          onPointerUp={(e) => { e.preventDefault(); clearTimers(); }}
          onPointerCancel={clearTimers}
          onPointerLeave={clearTimers}
          className="w-full h-14 grid place-items-center focus:outline-none active:translate-y-[1px]"
        >
          <span className={keycap}>−</span>
        </button>
      </div>
    </div>
  );
}
