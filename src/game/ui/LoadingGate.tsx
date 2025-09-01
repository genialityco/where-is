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

  // ✅ Mostrar SOLO un dígito (segundos restantes sin ceros a la izquierda)
  const secondsText = String(Math.max(0, secondsLeft));

  // progreso basado en 5s como antes
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
          className={`w-[min(92vw,580px)] lg:w-[min(90vw,760px)] rounded-3xl shadow-2xl
                      transition-all duration-500 will-change-transform
                      ${entered ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2"}`}
          style={{
            background:
              "linear-gradient(180deg, rgba(248,250,255,.96) 0%, rgba(255,255,255,.96) 60%, rgba(255,255,255,.96) 100%)",
          }}
        >
          <div className="px-8 pt-8 lg:px-12 lg:pt-10 text-center">
            <h2 className="text-2xl lg:text-[45px] font-extrabold text-buk-500">
              Preparando el mundo
            </h2>
            <p className="mt-5 text-sm lg:text-[32px] text-gray-600">Cargando mapa…</p>
          </div>

          {/* contador grande: un solo dígito */}
          <div className="mt-6 lg:mt-8 flex items-end justify-center">
            <div className="text-[56px] lg:text-[150px] leading-none font-black text-buk-500 tabular-nums">
              {secondsText}
            </div>
          </div>

          {/* barra de progreso (basada en la cuenta) */}
          <div className="px-8 lg:px-16 mt-6 lg:mt-8 mb-8 lg:mb-10">
            <div className="h-2.5 lg:h-5 rounded-full bg-gray-200 overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-buk-500 transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* logo */}
          <div className="pb-6 lg:pb-8 grid place-items-center">
            <img
              src="/img/logo-buk-gestion-personas.webp"
              alt="BUK"
              className="h-10 lg:h-[5rem] w-auto opacity-100"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
