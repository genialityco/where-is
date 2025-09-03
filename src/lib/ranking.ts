/* eslint-disable @typescript-eslint/no-explicit-any */

import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export type RankingEntry = {
  id?: string;
  name: string;
  email?: string | null;
  // phone?: string | null;  // ← ya no se usa para escribir
  timeMs: number;
  createdAt?: any;
};

const LOCAL_PREFIX = "dailyRankingLocal:";

export function todayKeyLocal(d = new Date()): string {
  return d.toLocaleDateString("en-CA");
}

function saveLocalFallback(entry: { name: string; email?: string | null; timeMs: number }, dateKey = todayKeyLocal()) {
  try {
    const k = `${LOCAL_PREFIX}${dateKey}`;
    const arr = JSON.parse(localStorage.getItem(k) || "[]");
    arr.push(entry);
    localStorage.setItem(k, JSON.stringify(arr));
  } catch { /* ignore */ }
}

function readLocalFallback(dateKey = todayKeyLocal()): RankingEntry[] {
  try {
    return JSON.parse(localStorage.getItem(`${LOCAL_PREFIX}${dateKey}`) || "[]");
  } catch { return []; }
}

/** Guarda puntaje del día actual; si falla red, guarda respaldo local. */
export async function saveDailyScore(entry: { name: string; email?: string | null; timeMs: number }): Promise<string> {
  const dateKey = todayKeyLocal();
  try {
    const ref = await addDoc(collection(db, "dailyRanking", dateKey, "entries"), {
      name: entry.name,
      email: entry.email ?? null,
      timeMs: Number(entry.timeMs),
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch {
    saveLocalFallback(entry, dateKey);
    return `local-${Date.now()}`;
  }
}

/** Escucha el ranking de hoy (remoto + respaldo local). */
export function listenTodayRanking(cb: (rows: RankingEntry[]) => void, topN = 100): () => void {
  const dateKey = todayKeyLocal();
  const q = query(
    collection(db, "dailyRanking", dateKey, "entries"),
    orderBy("timeMs", "asc"),
    limit(topN)
  );

  const emit = (remote: RankingEntry[]) => {
    const local = readLocalFallback(dateKey);
    const merged = [...remote, ...local].sort((a, b) => a.timeMs - b.timeMs).slice(0, topN);
    cb(merged);
  };

  emit([]);
  const unsub = onSnapshot(q, (snap) => {
    const remote: RankingEntry[] = [];
    snap.forEach((d) => remote.push({ id: d.id, ...(d.data() as any) }));
    emit(remote);
  }, () => emit([]));

  return unsub;
}

/** mm:ss.mmm */
export function formatMs(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const ms3 = Math.floor(ms % 1000);
  const pad = (n: number, len: number) => String(n).padStart(len, "0");
  return `${pad(m,2)}:${pad(s,2)}.${pad(ms3,3)}`;
}

/* ============================================================
   UTILIDADES DE MIGRACIÓN DESDE LOCALSTORAGE A FIRESTORE
   (no afectan el comportamiento actual si no las llamas)
   ============================================================ */

/**
 * Sube a Firestore todos los registros locales del día indicado.
 * - dateKey: "YYYY-MM-DD" (por defecto, el día de hoy en zona local).
 * - Dedup básico por (name|email|timeMs) dentro del propio arreglo local.
 * - Si todos suben OK, borra la clave local de ese día. Si algunos fallan,
 *   mantiene solo los que fallaron.
 */
export async function flushLocalToFirestore(dateKey = todayKeyLocal()): Promise<{ uploaded: number; kept: number; failed: number; dateKey: string }> {
  const k = `${LOCAL_PREFIX}${dateKey}`;
  let arr: any[] = [];
  try {
    arr = JSON.parse(localStorage.getItem(k) || "[]");
  } catch {
    arr = [];
  }
  if (!Array.isArray(arr) || arr.length === 0) {
    return { uploaded: 0, kept: 0, failed: 0, dateKey };
  }

  // Dedup dentro del local por firma simple
  const seen = new Set<string>();
  const toUpload = arr.filter((e) => {
    const name = (e?.name ?? "Jugador").toString();
    const email = (e?.email ?? null) ? String(e.email) : null;
    const timeMs = Number(e?.timeMs ?? 0);
    // validaciones mínimas
    if (!name || Number.isNaN(timeMs) || timeMs < 0) return false;
    const sig = `${name}|${email ?? ""}|${timeMs}`;
    if (seen.has(sig)) return false;
    seen.add(sig);
    return true;
  });

  const failed: any[] = [];
  let uploaded = 0;

  for (const e of toUpload) {
    try {
      await saveDailyScore({
        name: e.name || "Jugador",
        email: e.email ?? null,
        timeMs: Number(e.timeMs || 0),
      });
      uploaded += 1;
    } catch {
      failed.push(e);
    }
  }

  // Si todo ok, borramos. Si falló algo, dejamos solo los fallidos.
  try {
    if (failed.length === 0) {
      localStorage.removeItem(k);
    } else {
      localStorage.setItem(k, JSON.stringify(failed));
    }
  } catch { /* ignore */ }

  return { uploaded, kept: failed.length, failed: failed.length, dateKey };
}

/**
 * Detecta todas las claves "dailyRankingLocal:*" y ejecuta flush por cada día.
 * Útil si tienes registros locales de varios días.
 */
export async function flushAllLocalToFirestore(): Promise<{ totalUploaded: number; totalFailed: number; days: Array<{ dateKey: string; uploaded: number; failed: number }> }> {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(LOCAL_PREFIX)) keys.push(key);
  }

  const results: Array<{ dateKey: string; uploaded: number; failed: number }> = [];
  let totalUploaded = 0;
  let totalFailed = 0;

  for (const k of keys) {
    const dateKey = k.slice(LOCAL_PREFIX.length);
    const r = await flushLocalToFirestore(dateKey);
    results.push({ dateKey, uploaded: r.uploaded, failed: r.failed });
    totalUploaded += r.uploaded;
    totalFailed += r.failed;
  }

  return { totalUploaded, totalFailed, days: results };
}
