type Props = {
  open: boolean;
  actorName?: string;
  actorImage?: string;
  onClose: () => void;
};

export default function FoundModal({ open, actorName, actorImage, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* blur + oscurecido */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/40" onClick={onClose} />

      {/* tarjeta */}
      <div className="relative z-10 mx-4 w-full max-w-[560px] rounded-2xl bg-white/95 p-5 shadow-2xl">
        <div className="mb-4 text-center text-2xl font-extrabold text-blue-700">
          ¡Encontraste a {actorName}!
        </div>

        <div className="flex items-center gap-4">
          {actorImage && (
            <img src={actorImage} alt={actorName} className="h-40 w-auto object-contain drop-shadow" />
          )}

          <div className="flex flex-col gap-3">
            <div className="max-w-[360px] rounded-2xl border border-blue-300 bg-white/95 p-3 shadow">
              <span className="font-semibold text-blue-700 mr-1">RESULTADOS</span> ¡Bien hecho!
            </div>
            <div className="max-w-[360px] rounded-2xl border border-blue-300 bg-white/95 p-3 shadow">
              BUK potencia el talento con <span className="font-semibold">herramientas</span> de evaluación,
              formación y <span className="font-semibold">seguimiento personalizado</span>.
            </div>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
