// src/services/geom.ts
export type Point = { x: number; y: number };
export type Hitbox =
  | { type: 'rect'; rect: { x: number; y: number; w: number; h: number } }
  | { type: 'poly'; points: Array<[number, number]> };

export function pointInRect(p: Point, r: { x: number; y: number; w: number; h: number }) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}
export function pointInPolygon(p: Point, pts: Array<[number, number]>) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1];
    const xj = pts[j][0], yj = pts[j][1];
    const intersect = yi > p.y !== yj > p.y &&
      p.x < ((xj - xi) * (p.y - yi)) / (yj - yi + 1e-7) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
export function isHit(p: Point, h: Hitbox) {
  return h.type === 'rect' ? pointInRect(p, h.rect) : pointInPolygon(p, h.points);
}
