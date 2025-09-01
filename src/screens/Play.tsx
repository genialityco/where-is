// src/screens/Play.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Viewport } from "pixi-viewport";

import level from "../data/level.json";
import Stage from "../game/Stage";
import ZoomControls from "../game/ui/ZoomControls";
import Sidebar from "../game/ui/Sidebar";
import Countdown from "../game/ui/Countdown";
import FoundModal from "../game/ui/FoundModal"; // ← espera panelUrl
import EndModal from "../game/ui/EndModal";     // ← calcula Top-3 con timeMs
import LoadingGate from "../game/ui/LoadingGate"; // 👈 NUEVO

export type Rect = { x: number; y: number; w: number; h: number };
export type Actor = { id: string; name: string; imageUrl: string; rect: Rect };

const TOTAL_SECONDS = 180;

export default function Play() {
  // nombre del jugador (si vienes desde /register)
  const playerName = (history.state?.usr as any)?.name ?? "Jugador";

  const nav = useNavigate(); // para ir al registro

  const vpRef = useRef<Viewport | null>(null);

  // medir ancho del sidebar para “pegar” el mapa al borde izquierdo
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

  // -------- datos del nivel --------
  const targets = (level as any).targets as Array<{
    id: string;
    name: string;
    icon?: string;
    sprite: string;
    panelUrl?: string;
    panel?: string;
    popup?: string;
    imagePanel?: string;
    positions: Array<{ hitbox: { type: "rect"; rect: Rect } }>;
  }>;

  // actores: 1 posición aleatoria por target (estable durante la partida)
  const actors: Actor[] = useMemo(() => {
    return targets.map((t) => {
      const idx = Math.floor(Math.random() * t.positions.length);
      return {
        id: t.id,
        name: t.name,
        imageUrl: t.sprite,
        rect: t.positions[idx].hitbox.rect,
      };
    });
  }, [targets]);

  // encontrados
  const [found, setFound] = useState<Record<string, boolean>>({});
  const foundCount = Object.values(found).filter(Boolean).length;

  // modal encontrado
  const [foundOpen, setFoundOpen] = useState(false);
  const [foundActorId, setFoundActorId] = useState<string | undefined>();

  // modal final
  const [endOpen, setEndOpen] = useState(false);
  const [endTitle, setEndTitle] = useState("¡Encontraste a todos!");

  // timer
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS); // en segundos
  const timeMs = (TOTAL_SECONDS - Math.max(0, timeLeft)) * 1000;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // viewport
  const handleViewport = useCallback((vp: Viewport) => {
    vpRef.current = vp;
  }, []);

  // ---------- ZOOM: saltos claros y respetando clamp-zoom ----------
  const zoomBy = useCallback((factor: number) => {
    const vp = vpRef.current as any;
    if (!vp) return;

    const cz = vp.plugins?.get?.("clamp-zoom")?.options ?? {};
    const min = typeof cz.minScale === "number" ? cz.minScale : 0.05;
    const max = typeof cz.maxScale === "number" ? cz.maxScale : 20;

    const current = (vp as Viewport).scale.x;
    const target = Math.max(min, Math.min(max, current * factor));

    const focus =
      vp.input?.last?.world ??
      (vp as Viewport).toWorld((vp as Viewport).screenWidth / 2, (vp as Viewport).screenHeight / 2);

    (vp as Viewport).setZoom(target, focus);
  }, []);

  const zoomIn = useCallback(() => zoomBy(2), [zoomBy]);      // acerca x2
  const zoomOut = useCallback(() => zoomBy(1 / 2), [zoomBy]); // aleja ÷2
  // ----------------------------------------------------------------

  // click en actor
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

  // continuar luego del final → ir al formulario de registro
  const continueAfterEnd = useCallback(() => {
    window.location.href = "https://bulk-game.netlify.app/";
  }, []);

  // actor y panel para el modal de “Encontrado”
  const popupTarget = useMemo(
    () => targets.find((t) => t.id === foundActorId),
    [targets, foundActorId]
  );

  const popupPanelUrl =
    popupTarget?.panelUrl ||
    popupTarget?.panel ||
    popupTarget?.popup ||
    popupTarget?.imagePanel ||
    undefined;

  const popupActorName = popupTarget?.name;

  const actorsWithFound = useMemo(
    () => actors.map((a) => ({ ...a, found: !!found[a.id] })),
    [actors, found]
  );

  /* ================= PRELOADER (LoadingGate) — mínimo cambio ================= */
  const [gateOpen, setGateOpen] = useState(true);     // 👈 NUEVO
  const [imgReady, setImgReady] = useState(false);    // 👈 NUEVO
  const [countLeft, setCountLeft] = useState(5);      // 👈 NUEVO

  // precargar imagen del mapa
  useEffect(() => {                                     // 👈 NUEVO
    const url = (level as any).background.src;
    const img = new Image();
    img.onload = () => setImgReady(true);
    img.onerror = () => setImgReady(true);
    img.src = url;
    return () => { img.onload = null; img.onerror = null; };
  }, []);

  // cuenta regresiva 5 → 0
  useEffect(() => {                                     // 👈 NUEVO
    let left = 5;
    setCountLeft(left);
    const id = setInterval(() => {
      left -= 1;
      setCountLeft(left);
      if (left <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // cerrar compuerta cuando ambas condiciones se cumplen
  useEffect(() => {                                     // 👈 NUEVO
    if (gateOpen && imgReady && countLeft <= 0) setGateOpen(false);
  }, [gateOpen, imgReady, countLeft]);
  /* ========================================================================== */

  return (
    <div className="fixed inset-0">
      <Sidebar
        ref={sidebarRef}
        countLabel={`${foundCount}/${actors.length}`}
        items={targets.map((t) => ({
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
      />

      {/* HUD */}
      <div className="fixed left-1/2 -translate-x-1/2 top-2 z-10 text-sm text-gray-800">
        Jugador: {playerName}
      </div>
      <ZoomControls onIn={zoomIn} onOut={zoomOut} />

      <Countdown
        seconds={TOTAL_SECONDS}
        running={!endOpen && !foundOpen && !gateOpen /* 👈 NUEVO: pausa mientras carga */}
        onTick={handleTick}
        onFinish={handleFinish}
        className="fixed right-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-sm shadow"
      />

      {/* Modal encontrado (usa panelUrl) */}
      <FoundModal
        open={foundOpen}
        actorName={popupActorName}
        panelUrl={popupPanelUrl}
        onClose={closeFoundModal}
      />

      {/* Modal final: Top-3 interno (pasamos timeMs) */}
      <EndModal
        open={endOpen}
        title={endTitle}
        player={playerName}
        timeMs={timeMs}
        onContinue={continueAfterEnd}
      />

      {/* Loader con fade-in/out (bloquea interacción durante la carga) */}
      <LoadingGate open={gateOpen} secondsLeft={countLeft} /> {/* 👈 NUEVO */}
    </div>
  );
}
