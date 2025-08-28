/* Props = {
  open: boolean;
  title: string;            // "¡Encontraste a todos!" o "Tiempo agotado"
  timeText: string;         // p.ej. "1:30"
  score?: number;           // opcional
  onRepeat: () => void;
  onContinue: () => void;   // p.ej. ir a /ranking
};

export default function EndModal({ open, title, timeText, score, onRepeat, onContinue }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-sm bg-black/40" />
      <div className="relative z-10 mx-4 w-full max-w-[560px] rounded-2xl bg-white/95 p-6 shadow-2xl">
        <div className="mb-2 text-center text-3xl font-extrabold text-yellow-600">{title}</div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-xl border bg-white/90 p-4 text-center shadow">
            <div className="text-xs uppercase text-gray-500">Tiempo</div>
            <div className="text-2xl font-bold">{timeText}</div>
          </div>
          <div className="rounded-xl border bg-white/90 p-4 text-center shadow">
            <div className="text-xs uppercase text-gray-500">Puntaje</div>
            <div className="text-2xl font-bold">{score ?? 0}</div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onRepeat} className="rounded-lg bg-gray-200 px-4 py-2 shadow hover:bg-gray-300">
            Repetir
          </button>
          <button onClick={onContinue} className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700">
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}*/

// src/game/ui/EndModal.tsx
type Props = {
  open: boolean;
  title: string;
  timeText: string;
  player: string;
  onRepeat: () => void;
  onContinue: () => void;
};

export default function EndModal({
  open,
  title,
  timeText,
  player,
  onRepeat,
  onContinue,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* fondo difuminado */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* diálogo */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-3xl bg-white/95 shadow-xl ring-1 ring-black/10">
          <div className="px-6 pt-6 text-center">
            <h2 className="text-2xl font-extrabold text-gray-800">
              {title}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 px-6 py-5 sm:grid-cols-2">
            <InfoCard label="Participante" value={player} />
            <InfoCard label="Tiempo" value={timeText} />
          </div>

          <div className="flex justify-center gap-3 px-6 pb-6">
            <button
              onClick={onRepeat}
              className="rounded-xl bg-gray-200 px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-300"
            >
              Repetir
            </button>
            <button
              onClick={onContinue}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 text-center shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

