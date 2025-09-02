// src/lib/firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// 👇 Evita problemas de red con el canal de streaming (errores “WebChannel … transport error”)
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  //useFetchStreams: false,
});

// Útil para verificar que las envs se cargaron bien
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log("FB projectId =", firebaseConfig.projectId);
}
