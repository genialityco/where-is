// src/game/ui/ZoomControls.tsx
type Props = { onIn: () => void; onOut: () => void };

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
}
