// src/utils/flatten.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

export function flatten(obj: any, prefix = "", out: Record<string, any> = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (isPlainObject(v)) flatten(v as any, key, out);
    else out[key] = v;
  }
  return out;
}
function isPlainObject(v: any) {
  if (!v) return false;
  if (Array.isArray(v)) return false;
  if ((v as any).toDate) return false; // Firestore Timestamp
  return typeof v === "object";
}
export function toCell(v: any) {
  if (v == null) return "";
  if ((v as any).toDate) return (v as any).toDate(); // Excel lo toma como fecha
  if (v instanceof Date) return v;
  if (typeof v === "object") return JSON.stringify(v);
  return v;
}
