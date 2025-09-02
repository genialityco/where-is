// src/screens/Register.tsx
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Databe Firebase
import { db } from "../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

type Form = {
  firstName: string; // ← Nombres
  lastName: string; // ← Apellidos
  phone: string;
  email: string;
  company: string;
  city: string;
  role: string;
  headcount: string;
  consent: boolean;
};

export default function Register() {
  const nav = useNavigate();

  const [form, setForm] = useState<Form>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    company: "",
    city: "",
    role: "",
    headcount: "",
    consent: false,
  });

  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const emailOk = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()),
    [form.email]
  );

  // ✅ Todos los campos completos + email válido + teléfono de 10 dígitos
  const allFieldsOk = useMemo(() => {
    const phoneOk = form.phone.length === 10;
    return (
      form.firstName.trim() !== "" &&
      form.lastName.trim() !== "" &&
      phoneOk &&
      form.company.trim() !== "" &&
      form.city.trim() !== "" &&
      form.role.trim() !== "" &&
      form.headcount.trim() !== "" &&
      emailOk
    );
  }, [form, emailOk]);

  // Uppercase para campos de texto; numéricos se sanitizan donde corresponde
  function update<K extends keyof Form>(key: K, v: Form[K]) {
    setForm((f) => {
      const toUpper = (s: string) => s.toUpperCase();
      if (
        key === "firstName" ||
        key === "lastName" ||
        key === "company" ||
        key === "city" ||
        key === "role" ||
        key === "email"
      ) {
        return { ...f, [key]: toUpper(String(v)) } as Form;
      }
      return { ...f, [key]: v } as Form;
    });
  }

  function handleConsentClick() {
    // Construimos el siguiente estado sin usar el setter aún
    const next = { ...form, consent: !form.consent };

    const emailOkNext = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email.trim());
    const phoneOkNext = next.phone.length === 10;
    const allFieldsOkNext =
      next.firstName?.trim?.() !== "" &&
      next.lastName?.trim?.() !== "" &&
      phoneOkNext &&
      next.company.trim() !== "" &&
      next.city.trim() !== "" &&
      next.role.trim() !== "" &&
      next.headcount.trim() !== "" &&
      emailOkNext;

    // Actualizamos el estado (sin side-effects adentro)
    setForm(next);

    // Si ya está todo válido y aceptó, hacemos efectos fuera del setter
    if (allFieldsOkNext && next.consent) {
      const fullName = `${next.firstName} ${next.lastName}`
        .replace(/\s+/g, " ")
        .trim();

      // Guardar en Firestore (no bloquea la navegación)
      addDoc(collection(db, "leads"), {
        firstName: next.firstName,
        lastName: next.lastName,
        name: fullName,
        phone: next.phone,
        email: next.email,
        emailLower: next.email.trim().toLowerCase(),
        company: next.company,
        city: next.city,
        role: next.role,
        headcount: Number(next.headcount) || null,
        consent: true,
        createdAt: serverTimestamp(),
        source: "game",
      }).catch((e) => console.error("Error guardando lead:", e));

      // Fallback para el ranking
      try {
        localStorage.setItem("buk_last_player", fullName);
      } catch {/**/}

      // Ahora sí, navegamos
      nav("/play", { state: { name: fullName } });
    }
  }
  return (
    <div className="relative min-h-[100svh] min-h-[100dvh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
      <img
        src="/bg/FONDO_FORMULARIO_BUK.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute inset-0 -z-10" />

      <div className="min-h-[100svh] min-h-[100dvh] flex items-start sm:items-center justify-center p-4 sm:p-6">
        <div
          className={
            `relative w-full max-w-[460px] sm:max-w-[520px] md:max-w-[560px] lg:max-w-[760px]
             rounded-[28px] lg:rounded-[32px] border border-sky-100 bg-white/90 shadow-xl overflow-hidden
             transform transition-all duration-500 ease-out ` +
            (entered
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-[.98] translate-y-3")
          }
        >
          <div className="absolute inset-0 bg-gradient-to-r from-sky-50/90 via-white/80 to-white pointer-events-none" />

          <div className="relative p-6 sm:p-8 lg:p-12">
            <h1 className="mb-4 sm:mb-5 text-center text-2xl sm:text-[26px] lg:text-[44px] font-regular text-buk-700">
              ¡Bienvenido al{" "}
              <span className="text-buk-700 font-extrabold">mundo BUK</span>!
            </h1>

            <p className="mt-2 px-2 sm:px-5 text-center text-[13px] lg:text-[24px] text-buk-600 leading-snug">
              Completa tus datos para participar en nuestro juego y descubrir
              cómo{" "}
              <span className="font-extrabold text-buk-700">
                BUK transforma la gestión de personas
              </span>{" "}
              en un lugar feliz.
            </p>

            <p className="mt-5 mb-6 text-center text-sm lg:text-[22px] font-extrabold text-buk-700">
              Formulario de participación:
            </p>

            <div className="space-y-3 lg:space-y-4">
              <Field
                placeholder="Nombres"
                icon={<UserIcon />}
                value={form.firstName}
                onChange={(v) => update("firstName", v)}
              />
              <Field
                placeholder="Apellidos"
                icon={<UserIcon />}
                value={form.lastName}
                onChange={(v) => update("lastName", v)}
              />
              <Field
                placeholder="Celular"
                icon={<PhoneIcon />}
                inputMode="tel"
                value={form.phone}
                // Solo números, límite 10 dígitos
                onChange={(v) =>
                  update("phone", v.replace(/\D+/g, "").slice(0, 10))
                }
                maxLength={10}
                invalid={form.phone.length > 0 && form.phone.length !== 10}
              />
              <Field
                placeholder="Correo"
                icon={<MailIcon />}
                inputMode="email"
                value={form.email}
                onChange={(v) => update("email", v)}
                invalid={form.email.length > 0 && !emailOk}
              />
              <Field
                placeholder="Empresa"
                icon={<BuildingIcon />}
                value={form.company}
                onChange={(v) => update("company", v)}
              />
              <Field
                placeholder="Ciudad"
                icon={<PinIcon />}
                value={form.city}
                onChange={(v) => update("city", v)}
              />
              <Field
                placeholder="Rol"
                icon={<BriefcaseIcon />}
                value={form.role}
                onChange={(v) => update("role", v)}
              />
              <Field
                placeholder="Número de Colaboradores"
                icon={<UsersIcon />}
                inputMode="numeric"
                value={form.headcount}
                onChange={(v) => update("headcount", v.replace(/\D+/g, ""))}
              />
            </div>

            <div className="p-5 lg:p-8 text-[13px] lg:text-[22px] text-center text-buk-600 leading-snug">
              <p className="text-[13px] lg:text-[24px] mb-4 font-extrabold text-buk-700">
                Autorización de tratamiento de datos:
              </p>
              <p>
                Al enviar este formulario, autorizo a{" "}
                <span className="font-extrabold text-buk-700">BUK</span> y su
                equipo a tratar mis datos personales con el fin de participar en
                el juego, enviar información relacionada con la experiencia y
                notificaciones sobre premios y actividades de la marca, de
                acuerdo con{" "}
                <span className="font-extrabold text-buk-700">
                  la Política de Privacidad de BUK.
                </span>
              </p>
            </div>

            <ConsentButton
              checked={form.consent}
              disabled={!allFieldsOk && !form.consent}
              onClick={handleConsentClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI helpers ---------- */

function Field(props: {
  placeholder: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  invalid?: boolean;
  maxLength?: number;
}) {
  const { placeholder, icon, value, onChange, inputMode, invalid, maxLength } =
    props;
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-buk-500">
        {icon}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        autoComplete={inputMode === "tel" ? "tel" : undefined}
        className={`w-full pl-11 pr-4 py-3.5 lg:py-5 rounded-2xl
                    bg-[#ECEFF7] text-buk-500 lg:text-[22px] placeholder-buk-500 placeholder:normal-case
                    ring-1 ring-sky-100 shadow-inner outline-none
                    focus:bg-white focus:ring-2 focus:ring-buk-500
                    ${invalid ? "ring-2 ring-rose-400 bg-rose-50" : ""}`}
      />
    </div>
  );
}

/* ---------- Botón de consentimiento ---------- */
function ConsentButton({
  checked,
  disabled,
  onClick,
}: {
  checked: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={disabled ? undefined : onClick}
      className={`mx-auto flex items-center gap-6 rounded-[38px] px-2 py-1 lg:px-6 lg:py-3 transition
                  shadow-[inset_0_1px_0_rgba(255,255,255,.6),0_8px_20px_rgba(16,24,40,.06)]
                  ring-1 ${
                    checked
                      ? "ring-sky-300 bg-white"
                      : "ring-slate-200 bg-[#ECEFF7]"
                  }
                  hover:ring-sky-300`}
    >
      <span className="text-[12px] lg:text-[24px] font-extrabold tracking-wide pl-6 text-buk-500">
        Acepto
      </span>
      <span
        className={`grid place-content-center w-10 h-10 lg:w-14 lg:h-14 rounded-full border
                    ${
                      checked
                        ? "border-sky-200 bg-sky-50"
                        : "border-slate-300 bg-white"
                    }`}
      >
        <img
          src="/img/cara-buk.webp"
          alt=";)"
          className="w-3.5 h-5 lg:w-5 lg:h-7"
          draggable={false}
        />
      </span>
    </button>
  );
}

/* ---------- Inline icons ---------- */
function UserIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M20 21a8 8 0 1 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M22 16.92V19a2 2 0 0 1-2.18 2A19.78 19.78 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a1 1 0 0 1 1 .75l1 4a1 1 0 0 1-.27.95L7.91 10.1a16 16 0 0 0 6 6l1.4-1.87a1 1 0 0 1 .95-.27l4 1a1 1 0 0 1 .74 1z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M4 4h16v16H4z" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M3 21h18" />
      <path d="M6 21V8h12v13" />
      <path d="M9 21V4h6v17" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M12 21s-6-5.33-6-10a6 6 0 1 1 12 0c0 4.67-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}
function BriefcaseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path d="M3 7h18v13H3z" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <circle cx="9" cy="7" r="3" />
      <path d="M2 21a7 7 0 0 1 14 0" />
      <path d="M22 21a6 6 0 0 0-9-5" />
      <circle cx="17" cy="7" r="3" />
    </svg>
  );
}
