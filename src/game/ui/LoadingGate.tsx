// src/game/ui/LoadingGate.tsx
import { useEffect, useState } from "react";

export default function LoadingGate({
  open,
  secondsLeft = 5,
}: {
  open: boolean;
  secondsLeft?: number;
}) {
  const [visible, setVisible] = useState(open);
  const [entered, setEntered] = useState(false);

  // manejar transiciones de entrada/salida
  useEffect(() => {
    if (open) {
      setVisible(true);
      const id = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(id);
    } else if (visible) {
      setEntered(false);
      const t = setTimeout(() => setVisible(false), 450);
      return () => clearTimeout(t);
    }
  }, [open, visible]);

  if (!visible) return null;

  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");
  const pct = Math.max(0, Math.min(100, ((5 - secondsLeft) / 5) * 100));

  return (
    <div className="fixed inset-0 z-[60]">
      {/* overlay con blur y B/N */}
      <div
        className={`absolute inset-0 transition-opacity duration-400
                    ${entered ? "opacity-100" : "opacity-0"}
                    bg-black/55 backdrop-blur-md backdrop-grayscale`}
      />

      {/* panel central con animación */}
      <div className="absolute inset-0 grid place-items-center p-4">
        <div
          className={`w-[min(92vw,580px)] rounded-3xl shadow-2xl
                      transition-all duration-500 will-change-transform
                      ${entered ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2"}`}
          style={{
            background:
              "linear-gradient(180deg, rgba(248,250,255,.96) 0%, rgba(255,255,255,.96) 60%, rgba(255,255,255,.96) 100%)",
          }}
        >
          <div className="px-8 pt-8 text-center">
            <h2 className="text-2xl font-extrabold text-buk-500">Preparando el mundo</h2>
            <p className="mt-1 text-sm text-gray-600">Cargando mapa…</p>
          </div>

          {/* contador grande */}
          <div className="mt-6 flex items-end justify-center gap-2">
            <div className="text-[56px] leading-none font-black text-gray-900 tabular-nums">
              {mm}:{ss}
            </div>
          </div>

          {/* barra de progreso simple (basada en la cuenta) */}
          <div className="px-8 mt-6 mb-8">
            <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-buk-500 transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* logo opcional */}
          <div className="pb-6 grid place-items-center">
            <img
              src="/img/logo-buk-gestion-personas.webp"
              alt="BUK"
              className="h-10 w-auto opacity-100"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
