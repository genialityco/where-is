// src/game/ui/FoundModal.tsx
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  actorName?: string;
  panelUrl?: string; // imagen del panel con textos (derecha)
  onClose: () => void;
};

export default function FoundModal({ open, actorName, panelUrl, onClose }: Props) {
  const [showContinue, setShowContinue] = useState(false);

  // visibilidad + transición (entrada/salida)
  const [visible, setVisible] = useState(open);
  const [entered, setEntered] = useState(false);

  // botón aparece a los 6s
  useEffect(() => {
    if (!open) return;
    setShowContinue(false);
    const id = setTimeout(() => setShowContinue(true), 6000);
    return () => clearTimeout(id);
  }, [open]);

  // manejar apertura/cierre con animación
  useEffect(() => {
    if (open) {
      setVisible(true);
      const id = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(id);
    } else if (visible) {
      setEntered(false);
      const t = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(t);
    }
  }, [open, visible]);

  // cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!visible) return;
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // handler de cierre con salida suave
  const handleClose = () => {
    setEntered(false);
    setTimeout(() => onClose(), 420);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay B/N con fade */}
      <div
        className={`absolute inset-0 transition-opacity duration-400 ease-out
                    ${entered ? "opacity-100" : "opacity-0"}
                    bg-black/55 backdrop-blur-md saturate-0`}
        onClick={handleClose}
      />

      {/* Contenido con scale/translate al entrar/salir */}
      <div
        className={`relative z-10 mx-4 w-full max-w-[980px] lg:max-w-[1100px] transition-all duration-400
                    ${entered ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-[.96] translate-y-2"}`}
        aria-label={`Encontraste a ${actorName ?? "el personaje"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="relative mx-auto flex items-end justify-center gap-6 sm:gap-10 md:gap-12">
          {panelUrl && (
            // 👇 Contenedor con animación continua (float + tilt + breathing)
            <div className="relative inline-block idle-bounce">
              <img
                src={panelUrl}
                alt=""
                className="w-[560px] sm:w-[640px] md:w-[720px] lg:w-[880px] xl:w-[960px] h-auto
                           drop-shadow-[0_24px_50px_rgba(0,0,0,.35)]
                           select-none pointer-events-none
                           origin-bottom animate-[popIn_.8s_.12s_cubic-bezier(.22,1,.36,1)_both]"
                draggable={false}
              />

              {/* Botón flotante (aparece a los 6s con animación) */}
              {showContinue && (
                <div
                  className="absolute pointer-events-auto animate-[btnIn_.55s_cubic-bezier(.22,1,.36,1)_both]"
                  style={{
                    bottom: "calc(1 * clamp(20px, 10vw, 90px))",
                    left: "calc(50% + clamp(0px, 7vw, 40px))",
                    transform: "translateX(-50%)",
                  }}
                >
                  <button
                    onClick={handleClose}
                    className="px-8 sm:px-10 md:px-12 lg:px-14 h-11 lg:h-14
                               rounded-2xl bg-buk-500 text-white font-semibold text-[22px] lg:text-[24px]
                               shadow-[0_8px_20px_rgba(47,77,170,.25)]
                               transition-transform duration-200
                               hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
                  >
                    Continuar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* keyframes inline */}
      <style>{`
        @keyframes popIn {
          0%   { transform: translateY(20px) scale(.96); opacity: 0 }
          60%  { transform: translateY(-6px) scale(1.02); opacity: 1 }
          100% { transform: translateY(0) scale(1) }
        }
        @keyframes btnIn {
          0%   { transform: translate(-50%, 16px) scale(.9); opacity: 0 }
          60%  { transform: translate(-50%, -4px) scale(1.03); opacity: 1 }
          100% { transform: translate(-50%, 0) scale(1) }
        }

        /* 🔥 Idle continuo: bob + tilt + ligera respiración */
        @keyframes floatAlive {
          0%   { transform: translateY(0) rotate(0deg) scale(1) }
          100% { transform: translateY(calc(var(--bob) * -1))
                            rotate(var(--tilt))
                            scale(var(--breath)) }
        }
        .idle-bounce {
          --bob: clamp(36px, 5.6vw, 80px);     /* amplitud vertical */
          --tilt: -0.6deg;                    /* inclinación sutil */
          --breath: 1.012;                    /* “respiración” */
          animation: floatAlive 2.2s 1s ease-in-out infinite alternate;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-[popIn_.8s_.12s_cubic-bezier(.22,1,.36,1)_both] { animation: none !important; }
          .animate-[btnIn_.55s_cubic-bezier(.22,1,.36,1)_both] { animation: none !important; }
          .idle-bounce { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
