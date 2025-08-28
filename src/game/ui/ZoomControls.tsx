// src/game/ui/ZoomControls.tsx
/*type Props = { onIn: () => void; onOut: () => void };

export default function ZoomControls({ onIn, onOut }: Props) {
  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-auto flex flex-col gap-2">
      <button
        onClick={onIn}
        className="h-10 w-10 rounded-full bg-white/95 shadow border text-xl leading-none"
        aria-label="Ampliar"
      >+</button>
      <button
        onClick={onOut}
        className="h-10 w-10 rounded-full bg-white/95 shadow border text-xl leading-none"
        aria-label="Reducir"
      >−</button>
    </div>
  );
}*/

type Props = { onIn: () => void; onOut: () => void };

export default function ZoomControls({ onIn, onOut }: Props) {
  return (
    <div className="fixed right-3 bottom-3 z-50 flex flex-col gap-2 pointer-events-auto">
      <button
        aria-label="Acercar"
        onClick={(e) => { e.stopPropagation(); onIn(); }}
        className="h-10 w-10 rounded-full bg-white shadow grid place-items-center text-xl"
      >
        +
      </button>
      <button
        aria-label="Alejar"
        onClick={(e) => { e.stopPropagation(); onOut(); }} 
        className="h-10 w-10 rounded-full bg-white shadow grid place-items-center text-xl"
      >
        –
      </button>
    </div>
  );
}

