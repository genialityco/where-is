// src/screens/Ranking.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearLeaderboard, loadLeaderboard, mmss, type LeaderboardEntry } from '../services/leaderboard';

export default function Ranking() {
  const nav = useNavigate();
  const { state } = useLocation() as any;
  const lastId: string | undefined = state?.lastId;

  const [items, setItems] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setItems(loadLeaderboard());
  }, []);

  const top = useMemo(() => items.slice(0, 20), [items]); // muestra top 20

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-center text-3xl font-extrabold text-slate-800">
          Ranking de Jugadores
        </h1>

        <p className="mt-2 text-center text-sm text-slate-500">
          Clasificación por mejor tiempo (menor es mejor).
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <Th>#</Th>
                <Th>Jugador</Th>
                <Th>Tiempo</Th>
                <Th>Fecha</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {top.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    Aún no hay marcas registradas.
                  </td>
                </tr>
              )}

              {top.map((row, i) => {
                const isYou = row.id === lastId;
                return (
                  <tr
                    key={row.id}
                    className={
                      'transition-colors ' +
                      (isYou ? 'bg-blue-50/70' : 'hover:bg-slate-50')
                    }
                  >
                    <Td className="text-slate-700 font-semibold">{i + 1}</Td>
                    <Td className="text-slate-800">{row.name}</Td>
                    <Td className="font-mono text-slate-900">{mmss(row.timeMs)}</Td>
                    <Td className="text-slate-600">
                      {new Date(row.date).toLocaleString()}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700"
            onClick={() => nav('/')}
          >
            Volver al inicio
          </button>
          <button
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700"
            onClick={() => nav('/play')}
          >
            Jugar de nuevo
          </button>
          <button
            className="rounded-xl bg-slate-200 px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-300"
            onClick={() => {
              if (confirm('¿Borrar todo el ranking?')) {
                clearLeaderboard();
                setItems([]);
              }
            }}
          >
            Limpiar ranking
          </button>
        </div>

        {lastId && (
          <p className="mt-3 text-center text-xs text-slate-500">
            Tu última marca está resaltada en azul.
          </p>
        )}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
      {children}
    </th>
  );
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm ${className}`}>{children}</td>;
}
