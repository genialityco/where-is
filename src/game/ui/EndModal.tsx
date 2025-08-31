// src/game/ui/EndModal.tsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

type Props = {
  open: boolean;
  title: string;
  /** tiempo total del jugador en milisegundos (p.ej. 123456) */
  timeMs: number;
  /** nombre del jugador */
  player: string;
  onContinue: () => void;
};

type LBItem = { name: string; timeMs: number; at: number };

export default function EndModal({
  open,
  title,
  timeMs,
  player,
  onContinue,
}: Props) {
  const [visible, setVisible] = useState(open);
  const [entered, setEntered] = useState(false);

  // ===== Ranking del día (Top-3) =====
  const [top3, setTop3] = useState<LBItem[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const committed = useRef(false);

  // clave por día local YYYY-MM-DD
  const dayKey = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `buk_lb_${yyyy}-${mm}-${dd}`;
  }, []);

  // agrega entrada y calcula top-3 cuando se abre
  useEffect(() => {
    if (!open || committed.current) return;

    const load = (): LBItem[] => {
      try {
        const raw = localStorage.getItem(dayKey);
        return raw ? (JSON.parse(raw) as LBItem[]) : [];
      } catch {
        return [];
      }
    };
    const save = (list: LBItem[]) => {
      try {
        localStorage.setItem(dayKey, JSON.stringify(list));
      } catch {}
    };

    const list = load();
    // añade sólo una vez por apertura de modal
    const mine: LBItem = { name: player || "Jugador", timeMs, at: Date.now() };
    list.push(mine);

    // menor tiempo = mejor puesto
    list.sort((a, b) => a.timeMs - b.timeMs);
    const myIndex = list.findIndex((x) => x === mine);
    setMyRank(myIndex >= 0 ? myIndex + 1 : null);

    // guarda (limitamos a 200 para no crecer infinito)
    save(list.slice(0, 200));

    // top-3
    setTop3(list.slice(0, 3));

    committed.current = true;
  }, [open, dayKey, player, timeMs]);

  // entrada/salida suave
  useEffect(() => {
    if (open) {
      setVisible(true);
      const id = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(id);
    } else if (visible) {
      setEntered(false);
      const t = setTimeout(() => setVisible(false), 350);
      return () => clearTimeout(t);
    }
  }, [open, visible]);

  // ✅ salida suave antes de continuar (navegar)
  const handleContinue = useCallback(() => {
    setEntered(false);
    const t = setTimeout(() => onContinue(), 380);
    return () => clearTimeout(t);
  }, [onContinue]);

  if (!visible) return null;

  // util UI
  const timeText = msToMMSS(timeMs);

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay: blur + B/N */}
      <div
        className={`absolute inset-0 transition-opacity duration-400 ease-out
                    ${entered ? "opacity-100" : "opacity-0"}
                    bg-black/55 backdrop-blur-md backdrop-grayscale`}
      />

      {/* Confeti infinito debajo del popup */}
      <BurstConfetti active={entered} />

      {/* Diálogo */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={`w-[min(82vw,820px)]     /* móviles: ocupa ~92% del ancho, máx. 820px */
          sm:w-[min(58vw,820px)]
          lg:w-[820px]            /* en desktop “normal”, fijo a 820px */
          rounded-3xl shadow-2xl ring-1 ring-black/10 relative z-20
          transition-all duration-500
          ${
            entered
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-2"
          }`}
          // fondo con degradé sutil como ref
          style={{
            background:
              "linear-gradient(180deg, rgba(248,250,255,.95) 0%, rgba(255,255,255,.95) 60%, rgba(255,255,255,.95) 100%)",
          }}
        >
          {/* Título */}
          <div className="px-8 pt-7 text-center">
            <h2 className="text-[32px] sm:text-2xl font-extrabold text-buk-500">
              {title}
            </h2>
          </div>

          {/* Participante / Tiempo (sin separadores visuales) */}
          <div className="px-6 pt-5">
            <div className="rounded-2xl bg-white/80 shadow-inner ring-1 ring-white/40 px-5 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <MiniInfo label="Participante" value={player} />
                <MiniInfo label="Tiempo" value={timeText} align="right" />
              </div>
            </div>
          </div>

          {/* Mensaje personalizado */}
          <div className="px-6 pt-4">
            <div className="rounded-xl bg-white/70 shadow ring-1 ring-black/5 px-4 py-3 text-center text-gray-800">
              Hola <span className="font-semibold">{player}</span>, tu tiempo es
              de <span className="font-semibold">{timeText}</span> y quedaste en
              el puesto <span className="font-extrabold">#{myRank ?? "—"}</span>
              .
            </div>
          </div>

          {/* RANKING Top-3 de la jornada */}
          <div className="px-6 pt-5">
            <div className="mb-5 text-center text-[22px] font-bold tracking-wide text-buk-500">
              RANKING DE LA JORNADA
            </div>

            <div className="space-y-3">
              {top3.map((row, i) => (
                <RankRow
                  key={row.at + i}
                  index={i}
                  name={row.name}
                  timeText={msToMMSS(row.timeMs)}
                />
              ))}
              {top3.length === 0 && (
                <div className="text-center text-sm text-gray-500 py-3">
                  Aún no hay suficientes participaciones hoy.
                </div>
              )}
            </div>
          </div>

          {/* Botón */}
          <div className="flex justify-center px-6 pt-6 pb-4">
            <button
              onClick={handleContinue}
              className="rounded-xl bg-buk-500 px-6 py-2.5 text-sm font-semibold text-white
                         shadow-[inset_0_1px_0_rgba(255,255,255,.5),0_8px_20px_rgba(16,24,40,.15)]
                         hover:brightness-[1.05] active:scale-[0.98] transition"
            >
              Continuar
            </button>
          </div>

          {/* Logo inferior centrado */}
          <div className=" pb-12 pt-12 grid place-items-center">
            <img
              src="/img/logo-buk-gestion-personas.webp"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "/img/logo-buk-gestion-personas.webp";
              }}
              alt="BUK"
              className=" h-12 w-auto opacity-100"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- subcomponentes ---------- */
function MiniInfo({
  label,
  value,
  align = "left",
}: {
  label: string;
  value: string;
  align?: "left" | "right";
}) {
  return (
    <div className={`text-${align}`}>
      <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-0.5 text-2xl font-bold text-gray-900 truncate">
        {value}
      </div>
    </div>
  );
}

function RankRow({
  index,
  name,
  timeText,
}: {
  index: number;
  name: string;
  timeText: string;
}) {
  const styles = [
    { bg: "#f9b82c", text: "#1b2a5b", badge: "#dca517" }, // 1°
    { bg: "#2f4daa", text: "#ffffff", badge: "#223a80" }, // 2°
    { bg: "#d9e3fc", text: "#263a7a", badge: "#bfcff8" }, // 3°
  ][index];

  return (
    <div
      className="flex items-center justify-between rounded-3xl px-4 py-3 shadow"
      style={{ backgroundColor: styles.bg, color: styles.text }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <TrophyIcon color={styles.text} />
        <div className="font-extrabold truncate">{name}</div>
      </div>
      <div className="flex items-center gap-4 pl-3">
        <span className="font-semibold opacity-90">{timeText}</span>
        <span
          className="grid place-items-center w-8 h-8 rounded-full text-sm font-extrabold"
          style={{ backgroundColor: styles.badge, color: "#fff" }}
        >
          {index + 1}
        </span>
      </div>
    </div>
  );
}

function TrophyIcon({ color = "#ffffff" }: { color?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
    >
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M5 8a3 3 0 0 1-3-3h5" />
      <path d="M19 8a3 3 0 0 0 3-3h-5" />
    </svg>
  );
}

function msToMMSS(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

/* =================== Confeti continuo =================== */
type Piece = {
  origin: "center" | "tl" | "tr" | "bl" | "br";
  dx: number;
  dy: number;
  rot: number;
  size: number;
  shape: "rect" | "circle" | "star";
  color: string;
  dur: number;
  delay: number;
};

function BurstConfetti({ active }: { active: boolean }) {
  const COLORS = useMemo(
    () => ["#f9b82c", "#ffcd55", "#ffe08a", "#ffd166", "#ffb703"],
    []
  );

  const makeBurst = (origin: Piece["origin"], amount: number): Piece[] => {
    const pieces: Piece[] = [];
    for (let i = 0; i < amount; i++) {
      const angle =
        origin === "center"
          ? Math.random() * Math.PI * 2
          : origin === "tl"
          ? Math.random() * (Math.PI / 2)
          : origin === "tr"
          ? Math.PI - Math.random() * (Math.PI / 2)
          : origin === "bl"
          ? (Math.PI * 3) / 2 + Math.random() * (Math.PI / 2)
          : Math.PI + Math.random() * (Math.PI / 2);
      const speed = 260 + Math.random() * 520;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      pieces.push({
        origin,
        dx,
        dy,
        rot: (Math.random() - 0.5) * 1080,
        size: 8 + Math.random() * 12,
        shape:
          Math.random() < 0.15
            ? "star"
            : Math.random() < 0.6
            ? "rect"
            : "circle",
        color: COLORS[(Math.random() * COLORS.length) | 0],
        dur: 950 + Math.random() * 1200,
        delay: Math.random() * 180,
      });
    }
    return pieces;
  };

  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setPieces((prev) => {
        const next = [
          ...prev,
          ...makeBurst("center", 42),
          ...makeBurst(Math.random() < 0.5 ? "tl" : "tr", 22),
          ...makeBurst(Math.random() < 0.5 ? "bl" : "br", 22),
        ];
        return next.slice(-900);
      });
    }, 650);
    return () => clearInterval(id);
  }, [active]);

  return (
    <>
      <style>{`
        @keyframes buk-burst {
          0%   { transform: translate3d(0,0,0) scale(.6) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          60%  { transform: translate3d(calc(var(--dx)*.8), calc(var(--dy)*.8 - 40px), 0) scale(1) rotate(calc(var(--rot)*.7)); }
          100% { transform: translate3d(var(--dx), var(--dy), 0) scale(.96) rotate(var(--rot)); opacity: 0; }
        }
        .confetti-star {
          clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 z-10">
        {pieces.map((p, i) => {
          const pos =
            p.origin === "center"
              ? { left: "50%", top: "50%" }
              : p.origin === "tl"
              ? { left: "2%", top: "2%" }
              : p.origin === "tr"
              ? { left: "98%", top: "2%" }
              : p.origin === "bl"
              ? { left: "2%", top: "98%" }
              : { left: "98%", top: "98%" };

          const style: React.CSSProperties = {
            position: "absolute",
            ...pos,
            width: p.size,
            height:
              p.shape === "rect"
                ? p.size * (0.5 + Math.random() * 0.9)
                : p.size,
            backgroundColor: p.shape === "circle" ? "transparent" : p.color,
            borderRadius:
              p.shape === "circle" ? "999px" : p.shape === "rect" ? "6px" : 0,
            border: p.shape === "circle" ? `3px solid ${p.color}` : "none",
            filter: "drop-shadow(0 2px 2px rgba(0,0,0,.12))",
            animationName: "buk-burst",
            animationDuration: `${p.dur}ms`,
            animationDelay: `${p.delay}ms`,
            animationTimingFunction: "cubic-bezier(.16,.84,.36,1)",
            animationIterationCount: 1,
            animationFillMode: "forwards",
            ["--dx" as any]: `${p.dx}px`,
            ["--dy" as any]: `${p.dy}px`,
            ["--rot" as any]: `${p.rot}deg`,
          };

          return (
            <span
              key={i}
              style={style}
              className={p.shape === "star" ? "confetti-star" : ""}
            />
          );
        })}
      </div>
    </>
  );
}
