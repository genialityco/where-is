// src/lib/firebase.ts — versión final
import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  // getFirestore,  // (no lo uses si inicializas con initializeFirestore)
} from "firebase/firestore";

// Fallbacks: usa VITE_FB_* si existen; si no, usa los valores del proyecto
const cfg = {
  apiKey: import.meta.env.VITE_FB_API_KEY || "AIzaSyDqKGsraeoUUnABLj2epLkSu5AyhwA5sGI",
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN || "magnetic-be10a.firebaseapp.com",
  projectId: import.meta.env.VITE_FB_PROJECT_ID || "magnetic-be10a",
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET || "magnetic-be10a.appspot.com",
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID || "105743648552",
  appId: import.meta.env.VITE_FB_APP_ID || "1:105743648552:web:9c969bf7f35942161f321d",
  // databaseURL no es necesario para Firestore
};

const app = initializeApp(cfg);

// ✅ Fuerza long-polling (mejor compatibilidad con redes / proxys / adblock)
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  //useFetchStreams: false,
});

// (opcional) debug mínimo en consola para comprobar que tomó el proyecto correcto
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log("FB projectId =", cfg.projectId);
}
