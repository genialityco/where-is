// src/game/ui/Sidebar.tsx
import { forwardRef } from "react";

export type SidebarItem = { id: string; name: string; found: boolean; icon?: string };

export type SidebarProps = {
  items: SidebarItem[];
  /** Muestra un texto como "1/3". Si no lo envías, se calcula automáticamente. */
  countLabel?: string;
};

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(({ items, countLabel }, ref) => {
  const done = items.filter((i) => i.found).length;
  const total = items.length;
  const label = countLabel ?? `${done}/${total}`;

  return (
    <div
      ref={ref}
      className="fixed left-0 top-0 bottom-0 z-10 w-[92px] sm:w-[112px] bg-white/70 backdrop-blur-md border-r border-black/5 px-2 pt-3"
    >
      <div className="text-xs font-semibold text-gray-700 bg-white/70 rounded-md py-1 px-2 mb-3 border border-black/5 text-center">
        {label}
      </div>

      <div className="flex flex-col gap-3">
        {items.map((it) => (
          <div
            key={it.id}
            className={`flex flex-col items-center justify-center rounded-lg border border-black/10 bg-white/80 py-2 px-1 transition ${
              it.found ? "opacity-40" : ""
            }`}
          >
            {it.icon ? (
              <img
                src={it.icon}
                alt={it.name}
                className="w-10 h-auto mb-1"
                draggable={false}
              />
            ) : null}
            <span className="text-[10px] text-gray-800 text-center leading-tight">
              {it.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
