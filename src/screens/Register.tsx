import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md bg-white/90 rounded-3xl p-6 shadow">
        <h1 className="text-2xl font-bold text-center mb-4">
          ¡Bienvenido al mundo BUK!
        </h1>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre completo"
          className="w-full rounded-xl px-4 py-3 bg-gray-100 mb-3"
        />

        <label className="flex items-start gap-2 text-sm mb-4">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>Autorizo el tratamiento de datos.</span>
        </label>

        <button
          disabled={!name || !consent}
          onClick={() => nav("/play", { state: { name } })}
          className="w-full rounded-xl bg-blue-600 text-white py-3 disabled:opacity-50"
        >
          Comenzar
        </button>
      </div>
    </div>
  );
}
