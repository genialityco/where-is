// src/screens/Play.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import level from "../data/level.json";
import Stage from "../game/Stage";
import ZoomControls from "../game/ui/ZoomControls";
import Sidebar from "../game/ui/Sidebar";
import Countdown from "../game/ui/Countdown";
import FoundModal from "../game/ui/FoundModal";
import EndModal from "../game/ui/EndModal";
import { saveEntry } from '../services/leaderboard';
import type { Viewport } from "pixi-viewport";

export type Rect = { x: number; y: number; w: number; h: number };
export type Actor = { id: string; name: string; imageUrl: string; rect: Rect };

const TOTAL_SECONDS = 180;

export default function Play() {
  const { state } = useLocation() as any;
  const nav = useNavigate();
  const playerName: string = state?.name ?? "Jugador";

  const vpRef = useRef<Viewport | null>(null);

  // medir ancho del sidebar
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [leftOffset, setLeftOffset] = useState(0);
  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;
    const update = () => setLeftOffset(el.offsetWidth || 0);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // actores: 1 posición aleatoria por target (estable durante la partida)
  const actors: Actor[] = useMemo(() => {
    const targets = (level as any).targets as Array<{
      id: string;
      name: string;
      sprite: string;
      positions: Array<{ hitbox: { type: "rect"; rect: Rect } }>;
    }>;
    return targets.map((t) => {
      const idx = Math.floor(Math.random() * t.positions.length);
      return {
        id: t.id,
        name: t.name,
        imageUrl: t.sprite,
        rect: t.positions[idx].hitbox.rect,
      };
    });
  }, []);

  // encontrados
  const [found, setFound] = useState<Record<string, boolean>>({});
  const foundCount = Object.values(found).filter(Boolean).length;

  // modal encontrado
  const [foundOpen, setFoundOpen] = useState(false);
  const [foundActorId, setFoundActorId] = useState<string | undefined>();

  // modal final
  const [endOpen, setEndOpen] = useState(false);
  const [endTitle, setEndTitle] = useState("¡Encontraste a todos!");
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS); // segundos restantes
  const timeText = `${String(Math.floor(timeLeft / 60)).padStart(
    2,
    "0"
  )}:${String(timeLeft % 60).padStart(2, "0")}`;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // viewport (memoizado para que Stage no se reinicialice)
  const handleViewport = useCallback((vp: Viewport) => {
    vpRef.current = vp;
  }, []);

  // zoom (pasos más notorios)
  const zoomIn = useCallback(() => {
    vpRef.current?.zoom(1.35, true);
  }, []);
  const zoomOut = useCallback(() => {
    vpRef.current?.zoom(1 / 1.35, true);
  }, []);

  // click actor (memoizado)
  const handleHitActor = useCallback((id: string) => {
    setFound((prev) => {
      if (prev[id]) return prev;
      return { ...prev, [id]: true };
    });
    setFoundActorId(id);
    setFoundOpen(true);
  }, []);

  // cerrar modal encontrado y quizá terminar partida
  const closeFoundModal = useCallback(() => {
    setFoundOpen(false);
    if (foundCount >= actors.length) {
      setEndTitle("¡Encontraste a todos!");
      setEndOpen(true);
    }
  }, [foundCount, actors.length]);

  // countdown callbacks
  const handleTick = useCallback((left: number) => setTimeLeft(left), []);
  const handleFinish = useCallback(() => {
    if (!endOpen) {
      setEndTitle("Tiempo agotado");
      setEndOpen(true);
    }
  }, [endOpen]);

  // utilidades UI final
  const repeat = useCallback(() => window.location.reload(), []);

  // 👉 Guardar marca y navegar al ranking (resaltando la última)
  const continueToRanking = useCallback(() => {
    // tiempo transcurrido en ms
    const elapsedMs = (TOTAL_SECONDS - Math.max(0, timeLeft)) * 1000;
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    saveEntry({
      id,
      name: playerName,
      timeMs: elapsedMs,
      date: Date.now(),
    });

    nav("/ranking", { state: { lastId: id } });
  }, [nav, playerName, timeLeft]);

  const popupActor = useMemo(
    () => actors.find((a) => a.id === foundActorId),
    [actors, foundActorId]
  );

  // Array de actores con flag "found" MEMOIZADO (evita redibujos por el contador)
  const actorsWithFound = useMemo(
    () => actors.map((a) => ({ ...a, found: !!found[a.id] })),
    [actors, found]
  );

  return (
    <div className="fixed inset-0">
      <Sidebar
        ref={sidebarRef}
        countLabel={`${foundCount}/${actors.length}`}
        items={(level as any).targets.map((t: any) => ({
          id: t.id,
          name: t.name,
          found: !!found[t.id],
          icon: t.icon ?? t.sprite,
        }))}
      />

      <Stage
        imageUrl={(level as any).background.src}
        fit="cover"
        leftOffset={leftOffset}
        actors={actorsWithFound}
        onViewport={handleViewport}
        onHitActor={handleHitActor}
        // debugOverlay={false}
      />

      {/* HUD */}
      <div className="fixed left-1/2 -translate-x-1/2 top-2 z-10 text-sm text-gray-800">
        Jugador: {playerName}
      </div>
      <ZoomControls onIn={zoomIn} onOut={zoomOut} />

      <Countdown
        seconds={TOTAL_SECONDS}
        running={!endOpen && !foundOpen}
        onTick={handleTick}
        onFinish={handleFinish}
        className="fixed right-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-sm shadow"
      />

      {/* Modal encontrado */}
      <FoundModal
        open={foundOpen}
        actorName={popupActor?.name}
        actorImage={popupActor?.imageUrl}
        onClose={closeFoundModal}
      />

      {/* Modal final */}
      <EndModal
        open={endOpen}
        title={endTitle}
        timeText={timeText}
        player={playerName}
        onRepeat={repeat}
        onContinue={continueToRanking}
      />
    </div>
  );
}
