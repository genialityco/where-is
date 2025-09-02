// src/game/ui/Sidebar.tsx
import { forwardRef } from "react";

export type SidebarItem = { id: string; name: string; found: boolean; icon?: string };

export type SidebarProps = {
  items: SidebarItem[];
  countLabel?: string;
};

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(({ items, countLabel }, ref) => {
  const done = items.filter((i) => i.found).length;
  const total = items.length;
  const label = countLabel ?? `${done}/${total}`;

  return (
    <div
      ref={ref}
      className="fixed left-0 top-0 bottom-0 z-10
                 w-[140px] sm:w-[160px] md:w-[188px]
                 bg-white/70 backdrop-blur-md border-r border-black/10
                 px-3 pt-3 overflow-hidden"
    >
      {/* Alto completo en columna */}
      <div className="h-full flex flex-col min-h-0">

        {/* === JUGADORES (más grandes) === */}
        <section className="basis-[62%] md:basis-[60%] max-[800px]:basis-[58%] shrink-0 flex flex-col min-h-0">
          <div className="flex-1 rounded-2xl border-2 border-black bg-[#ECEFF7] shadow-sm p-3 flex flex-col min-h-0">

            {/* Contador */}
            <div
              className="w-[92%] mx-auto mb-3 rounded-lg border-2 border-black bg-white
                         px-3 py-1.5 text-[13px] sm:text-sm md:text-[22px]
                         text-center font-bold tracking-wide text-gray-800"
              aria-live="polite"
              aria-atomic="true"
            >
              {label}
            </div>

            {/* Tres tarjetas: filas iguales y tarjeta a 100% del alto */}
            <div className="grid grid-rows-[1fr_1fr_1fr] gap-2 h-full min-h-0">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="relative w-full h-full rounded-2xl bg-white grid place-items-center
                             ring-1 ring-black/10 shadow-sm overflow-hidden"
                >
                  {it.icon && (
                    <img
                      src={it.icon}
                      alt={it.name}
                      className={`w-auto object-contain select-none transition
                                  h-[92%] sm:h-[94%] md:h-[96%]
                                  scale-[1.12] sm:scale-[1.18] md:scale-[1.75]
                                  ${it.found ? "grayscale opacity-70" : ""}`}
                      draggable={false}
                    />
                  )}

                  {/* Check cuando está encontrado */}
                  {it.found && (
                    <span
                      className="absolute right-1.5 top-1.5 grid place-items-center
                                 w-7 h-7 md:w-8 md:h-8 rounded-full bg-emerald-500 text-white shadow"
                      aria-label="Encontrado"
                      title="Encontrado"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                  )}
                  <span className="sr-only">{it.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* === LOGO (un poco menos espacio para priorizar jugadores) === */}
        <section
          className="basis-[38%] md:basis-[40%] max-[800px]:basis-[42%]
                     shrink-0 grid place-items-center mt-3 min-h-0"
        >
          <div className="w-full h-full bg-white/65 grid place-items-center px-2 shadow-sm rounded-2xl pointer-events-none">
            <img
              src="/img/logo-buk-vertical.webp"
              alt="BUK"
              className="max-h-[86%] md:max-h-[90%] w-auto object-contain select-none"
              draggable={false}
            />
          </div>
        </section>
      </div>
    </div>
  );
});

Sidebar.displayName = "Sidebar";
export default Sidebar;
