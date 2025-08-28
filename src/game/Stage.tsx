// src/game/Stage.tsx
import { useEffect, useRef, useState } from 'react';
import { Application, Assets, Container, Graphics, Sprite, Texture } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

type FitMode = 'cover' | 'contain';
type Rect = { x: number; y: number; w: number; h: number };
type Actor = { id: string; imageUrl: string; rect: Rect; found?: boolean };

type Props = {
  imageUrl: string;
  onViewport?: (vp: Viewport) => void;
  fit?: FitMode;
  leftOffset?: number;        // espacio reservado para el sidebar
  onWorldClick?: (pt: { x: number; y: number }) => void;
  actors?: Actor[];
  debugOverlay?: boolean;     // pinta el rectángulo de cada actor
  onHitActor?: (id: string) => void; // <- ya lo tenías
};

export default function Stage({
  imageUrl,
  onViewport,
  fit = 'cover',
  leftOffset = 0,
  onWorldClick,
  actors = [],
  debugOverlay = true,
  onHitActor,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [ready, setReady] = useState<{ worldW: number; worldH: number } | null>(null);
  const viewportRef = useRef<Viewport | null>(null);
  const spriteLayerRef = useRef<Container | null>(null); // fondo
  const actorsLayerRef = useRef<Container | null>(null); // personajes

  // NUEVO: si el usuario ya interactuó (drag/pinch/wheel), no recentrar en resize
  const userInteractedRef = useRef(false);
  const markInteracted = () => { userInteractedRef.current = true; };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const host = hostRef.current;
      if (!host) return;

      // App
      const app = new Application();
      await app.init({ resizeTo: host, backgroundAlpha: 0 });
      if (cancelled) return;

      appRef.current = app;
      canvasRef.current = app.canvas;
      host.appendChild(app.canvas);

      // Viewport (cámara)
      const viewport = new Viewport({
        events: app.renderer.events,
        ticker: app.ticker,
      });
      viewportRef.current = viewport;
      app.stage.addChild(viewport);

      // Capas
      const bgLayer = new Container();
      const actorsLayer = new Container();
      actorsLayer.sortableChildren = true;

      spriteLayerRef.current = bgLayer;
      actorsLayerRef.current = actorsLayer;

      viewport.addChild(bgLayer);
      viewport.addChild(actorsLayer);

      // Interacciones de cámara
      viewport.drag().pinch().wheel({ smooth: 8 }).decelerate();

      // Escuchar interacción del usuario (para no recentrar después)
      viewport.on('pointerdown', markInteracted);
      viewport.on('wheel', markInteracted);
      viewport.on('drag-start', markInteracted as any);
      viewport.on('pinch-start', markInteracted as any);

      // Cargar fondo
      const tex = await Assets.load(imageUrl);
      const bg = new Sprite(tex);
      bg.x = 0; bg.y = 0;
      bgLayer.addChild(bg);

      // Mundo = tamaño del fondo
      viewport.worldWidth = tex.width;
      viewport.worldHeight = tex.height;
      viewport.clamp({ left: 0, right: tex.width, top: 0, bottom: tex.height });

      const applyFit = () => {
        const hostW = host.clientWidth;
        const hostH = host.clientHeight;

        const wRatio = hostW / tex.width;
        const hRatio = hostH / tex.height;
        const minScale = fit === 'cover' ? Math.max(wRatio, hRatio) : Math.min(wRatio, hRatio);

        viewport.clampZoom({ minScale, maxScale: minScale * 4 });

        // Si por resize quedamos por debajo del mínimo, subimos
        if (viewport.scale.x < minScale) {
          viewport.setZoom(minScale, true);
        }

        // IMPORTANTE: sólo centrar la primera vez (si el usuario no ha tocado/arrastrado)
        if (!userInteractedRef.current) {
          viewport.moveCenter(tex.width / 2, tex.height / 2);
        }
      };

      applyFit();
      const ro = new ResizeObserver(applyFit);
      ro.observe(host);

      // Clicks en mundo (debug coords)
      if (onWorldClick) {
        host.addEventListener('pointerdown', (e) => {
          if (!viewportRef.current) return;
          const rect = host.getBoundingClientRect();
          const screenX = e.clientX - rect.left;
          const screenY = e.clientY - rect.top;
          const worldPt = viewportRef.current.toWorld(screenX, screenY);
          onWorldClick({ x: worldPt.x, y: worldPt.y });
        }, { passive: true });
      }

      setReady({ worldW: tex.width, worldH: tex.height });
      onViewport?.(viewport);

      return () => {
        ro.disconnect();
      };
    })();

    return () => {
      cancelled = true;

      const host = hostRef.current;
      const canvas = canvasRef.current;
      if (host && canvas && canvas.parentNode === host) host.removeChild(canvas);
      canvasRef.current = null;

      try {
        const app = appRef.current;
        if (app) {
          app.stage.removeChildren();
          app.destroy();
        }
      } catch {}
      appRef.current = null;
      viewportRef.current = null;
      spriteLayerRef.current = null;
      actorsLayerRef.current = null;
      setReady(null);
      userInteractedRef.current = false;
    };
  }, [imageUrl, fit, onViewport, onWorldClick]);

  // Dibuja/actualiza actores
  useEffect(() => {
    if (!ready || !actorsLayerRef.current) return;

    const layer = actorsLayerRef.current;
    layer.removeChildren();

    actors.forEach(async (actor, i) => {
      const r = actor.rect;
      if (!r) return;

      if (debugOverlay) {
        const g = new Graphics();
        g.rect(r.x, r.y, r.w, r.h)
          .stroke({ color: 0x22cc88, width: 2 })
          .fill({ color: 0x22cc88, alpha: 0.1 });
        g.zIndex = 5;
        g.eventMode = 'none'; // no capturar clicks
        layer.addChild(g);
      }

      try {
        const tex: Texture = await Assets.load(actor.imageUrl);
        const sp = new Sprite(tex);

        const scale = r.h / tex.height;
        sp.scale.set(scale);
        sp.anchor.set(0.5, 1);
        sp.x = r.x + r.w / 2;
        sp.y = r.y + r.h;
        sp.zIndex = 10 + i;
        sp.alpha = actor.found ? 0.3 : 1;

        sp.eventMode = 'static';
        sp.cursor = 'pointer';
        sp.on('pointertap', () => onHitActor?.(actor.id));

        layer.addChild(sp);
      } catch (err) {
        console.warn(`No pude cargar sprite ${actor.id}: ${actor.imageUrl}`, err);
      }
    });
  }, [actors, ready, debugOverlay, onHitActor]);

  return (
    <div
      ref={hostRef}
      className="absolute inset-0"
      style={{ left: leftOffset }}
    />
  );
}
