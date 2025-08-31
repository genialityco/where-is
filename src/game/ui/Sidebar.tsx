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
                 w-[132px] sm:w-[150px] md:w-[168px]
                 bg-white/70 backdrop-blur-md border-r border-black/10
                 px-3 pt-3 overflow-hidden"
    >
      {/* Alto completo en columna */}
      <div className="h-full flex flex-col min-h-0">

        {/* === JUGADORES === */}
        <section className="basis-[60%] max-lg:basis-[60%] max-md:basis-[50%] max-[800px]:basis-[50%] shrink-0 flex flex-col min-h-0">
          {/* Marco externo */}
          <div className="flex-1 rounded-2xl border-2 border-black bg-[#ECEFF7] shadow-sm p-3 flex flex-col min-h-0">
            {/* Placa contador (90% ancho y centrada) */}
            <div
              className="w-[90%] mx-auto mb-3 rounded-lg border-2 border-black bg-white px-3 py-1
                         text-xs text-center font-semibold tracking-wide text-gray-800"
              aria-live="polite"
              aria-atomic="true"
            >
              {label}
            </div>

            {/* Tres tarjetas sin scroll */}
            <div className="flex-1 flex flex-col justify-between items-stretch gap-3">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="relative h-24 sm:h-28 w-full rounded-2xl bg-white grid place-items-center
                             ring-1 ring-black/10 shadow-sm"
                >
                  {it.icon && (
                    <img
                      src={it.icon}
                      alt={it.name}
                      className={`h-20 sm:h-24 w-auto object-contain select-none transition
                                  ${it.found ? "grayscale opacity-70" : ""}`}
                      draggable={false}
                    />
                  )}
                  {/* Check cuando está encontrado */}
                  {it.found && (
                    <span
                      className="absolute right-1.5 top-1.5 grid place-items-center
                                 w-6 h-6 rounded-full bg-emerald-500 text-white shadow"
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

        {/* === LOGO === */}
        <section
          className="basis-[40%] max-lg:basis-[40%] max-md:basis-[50%] max-[800px]:basis-[50%]
                     shrink-0 grid place-items-center mt-3 min-h-0"
        >
          {/* pointer-events-none: no captura toques/drag */}
          <div className="w-full h-full bg-white/65 grid place-items-center px-2 shadow-sm rounded-2xl pointer-events-none">
            <img
              src="/img/logo-buk-vertical.webp"
              alt="BUK"
              className="max-h-[72%] md:max-h-[80%] w-auto object-contain select-none"
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
