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
  leftOffset?: number;        // ancho ocupado por el sidebar
  onWorldClick?: (pt: { x: number; y: number }) => void;
  actors?: Actor[];
  debugOverlay?: boolean;
  onHitActor?: (id: string) => void;
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
  const spriteLayerRef = useRef<Container | null>(null);
  const actorsLayerRef = useRef<Container | null>(null);

  // no recentrar si el usuario ya tocó la cámara
  const userInteractedRef = useRef(false);
  const markInteracted = () => { userInteractedRef.current = true; };

  // límites de zoom vigentes (recalculados en applyFit)
  const minScaleRef = useRef(1);
  const maxScaleRef = useRef(3);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const host = hostRef.current;
      if (!host) return;

      const app = new Application();
      await app.init({ resizeTo: host, backgroundAlpha: 0 });
      if (cancelled) return;

      appRef.current = app;
      canvasRef.current = app.canvas;
      host.appendChild(app.canvas);

      const viewport = new Viewport({
        events: app.renderer.events,
        ticker: app.ticker,
      });
      viewportRef.current = viewport;
      app.stage.addChild(viewport);

      const bgLayer = new Container();
      const actorsLayer = new Container();
      actorsLayer.sortableChildren = true;
      spriteLayerRef.current = bgLayer;
      actorsLayerRef.current = actorsLayer;
      viewport.addChild(bgLayer);
      viewport.addChild(actorsLayer);

      // interacciones
      viewport
        .drag()
        .pinch()
        .wheel({
          smooth: 14,   // animación del wheel
          percent: 0.12 // paso por rueda (12%)
        })
        .decelerate();

      viewport.on('pointerdown', markInteracted);
      viewport.on('wheel', markInteracted);
      viewport.on('drag-start', markInteracted as any);
      viewport.on('pinch-start', markInteracted as any);

      const tex = await Assets.load(imageUrl);
      const bg = new Sprite(tex);
      bg.x = 0; bg.y = 0;
      bgLayer.addChild(bg);

      viewport.worldWidth = tex.width;
      viewport.worldHeight = tex.height;

      // que nunca aparezcan blancos por arriba/izquierda al alejar
      viewport.clamp({
        left: 0, right: tex.width, top: 0, bottom: tex.height,
        underflow: 'top-left',
      });

      const applyFit = () => {
        const hostW = host.clientWidth;
        const hostH = host.clientHeight;

        const wRatio = hostW / tex.width;
        const hRatio = hostH / tex.height;

        // cover: asegura que el mapa cubre toda el área visible
        const base = fit === 'cover' ? Math.max(wRatio, hRatio) : Math.min(wRatio, hRatio);

        // ✔️ el tope de zoom-out ES la vista inicial
        const minScale = base;
        // margen para acercar (ajústalo si quieres más/menos zoom in)
        const maxScale = base * 2.2;

        minScaleRef.current = minScale;
        maxScaleRef.current = maxScale;

        viewport.clampZoom({ minScale, maxScale });

        // corrige si el resize dejó el zoom fuera de rango
        const s = viewport.scale.x;
        if (s < minScale) viewport.setZoom(minScale, true);
        if (s > maxScale) viewport.setZoom(maxScale, true);

        // vista inicial: pegado al sidebar (esquina superior izquierda)
        if (!userInteractedRef.current) {
          viewport.setZoom(minScale, true);
          viewport.moveCorner(0, 0); // top-left del mundo a top-left de la pantalla
        }
      };

      applyFit();
      const ro = new ResizeObserver(applyFit);
      ro.observe(host);

      // guarda carriles: si el wheel se pasa, recortamos
      viewport.on('zoomed', () => {
        const s = viewport.scale.x;
        const min = minScaleRef.current;
        const max = maxScaleRef.current;
        if (s < min) viewport.setZoom(min, true);
        else if (s > max) viewport.setZoom(max, true);
      });

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

      return () => { ro.disconnect(); };
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
          //.stroke({ color: 0x22cc88, width: 2 }) codigo para el recuadro de los personajes
          //.fill({ color: 0x22cc88, alpha: 0.1 });
        g.zIndex = 5;
        g.eventMode = 'none';
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
      className="absolute inset-0 touch-none"
      style={{ left: leftOffset, overflow: 'hidden' }}
    />
  );
}
