// src/services/leaderboard.ts
export type LeaderboardEntry = {
  id: string;           // id único de la marca
  name: string;         // jugador
  timeMs: number;       // tiempo en ms (entre menos mejor)
  date: number;         // timestamp
};

const KEY = 'buk:leaderboard:v1';

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as LeaderboardEntry[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveEntry(e: LeaderboardEntry): void {
  const current = loadLeaderboard();
  current.push(e);
  // Orden: menor tiempo primero, y si empatan, el más antiguo primero
  current.sort((a, b) => a.timeMs - b.timeMs || a.date - b.date);
  // Mantén solo los mejores 100 (opcional)
  const trimmed = current.slice(0, 100);
  localStorage.setItem(KEY, JSON.stringify(trimmed));
}

export function clearLeaderboard() {
  localStorage.removeItem(KEY);
}

// Helper de formato mm:ss
export function mmss(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  const mPart = Math.floor(s / 60);
  const sPart = s % 60;
  return `${String(mPart).padStart(2, '0')}:${String(sPart).padStart(2, '0')}`;
}
