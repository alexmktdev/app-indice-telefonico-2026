// ─────────────────────────────────────────────────────────────
// FIREBASE CLIENT SDK
// Solo se usa en el frontend y ÚNICAMENTE para autenticación.
// Para leer/escribir datos, el frontend siempre llama a nuestra
// API Route, nunca directamente a Firestore.
//
// NOTA CLAVE: NO exportamos Firestore del cliente.
// El frontend nunca debe acceder a Firestore directamente.
// ─────────────────────────────────────────────────────────────

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Mismo patrón Singleton para el cliente
function createFirebaseClientApp(): FirebaseApp {
  const existingApps = getApps()
  if (existingApps.length > 0 && existingApps[0]) {
    return existingApps[0]
  }
  return initializeApp(firebaseConfig)
}

const clientApp: FirebaseApp = createFirebaseClientApp()

// Solo exportamos Auth. NO exportamos Firestore del cliente.
export const clientAuth: Auth = getAuth(clientApp)
