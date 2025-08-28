// src/services/selectTargets.ts

/** ---------- Tipos del nivel ---------- */
export type Rect = { x: number; y: number; w: number; h: number };
export type Hitbox =
  | { type: "rect"; rect: Rect }
  // Si en el futuro agregas otros tipos (círculo, polígono), añádelos aquí.
  ;

export type PositionDef = {
  hitbox: Hitbox;
  meta?: Record<string, unknown>;
};

export type TargetDef = {
  id: string;
  name: string;
  sprite?: string;
  icon?: string;
  positions: PositionDef[];
};

export type LevelDef = {
  background: { src: string };
  targets: TargetDef[];
};

/** ---------- PRNG determinístico ---------- */
type RNG = () => number;
function mulberry32(seed = Date.now()): RNG {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pickOne<T>(arr: T[], rand: RNG): T {
  return arr[Math.floor(rand() * arr.length)];
}

/** Selecciona 1 posición por target y las baraja */
export function pickTargets(
  level: LevelDef,
  seed?: number
): Array<{ id: string; name: string; hitbox: Hitbox; meta: Record<string, unknown> }> {
  const rand = mulberry32(seed ?? Date.now());

  const chosen = level.targets.map((t) => {
    const pos = pickOne<PositionDef>(t.positions, rand);
    return {
      id: t.id,
      name: t.name,
      hitbox: pos.hitbox,
      meta: (pos.meta ?? {}) as Record<string, unknown>,
    };
  });

  // Barajar
  for (let i = chosen.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [chosen[i], chosen[j]] = [chosen[j], chosen[i]];
  }

  return chosen;
}
