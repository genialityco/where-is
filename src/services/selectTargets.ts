// src/services/selectTargets.ts
type RNG = () => number;
function mulberry32(seed = Date.now()): RNG {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function pickOne<T>(arr: T[], rand: RNG): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function pickTargets(level: any, seed?: number) {
  const rand = mulberry32(seed ?? Date.now());
  const chosen = level.targets.map((t: any) => {
    const pos = pickOne(t.positions, rand);
    return { id: t.id, name: t.name, hitbox: pos.hitbox, meta: pos.meta ?? {} };
  });
  // barajar para mostrar en orden aleatorio si quieres
  for (let i = chosen.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [chosen[i], chosen[j]] = [chosen[j], chosen[i]];
  }
  return chosen as Array<{ id: string; name: string; hitbox: any; meta: any }>;
}
