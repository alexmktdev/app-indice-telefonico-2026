// ─────────────────────────────────────────────────────────────
// FIREBASE ADMIN SDK
// Solo se ejecuta en el servidor (API Routes, Server Components)
// Tiene acceso total a Firestore y puede verificar tokens JWT
//
// Patrón Singleton: solo existe UNA instancia de la app.
// Next.js en desarrollo recarga módulos constantemente (hot reload).
// Sin este patrón, intentaría inicializar Firebase múltiples veces
// y lanzaría un error "app already exists".
// ─────────────────────────────────────────────────────────────

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getAuth, type Auth } from 'firebase-admin/auth'

function createFirebaseAdminApp(): App {
  // Si ya existe una app inicializada, retornarla
  const existingApps = getApps()
  if (existingApps.length > 0 && existingApps[0]) {
    return existingApps[0]
  }

  // Verificar que las variables de entorno existen
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Faltan variables de entorno de Firebase Admin. ' +
      'Verifica FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY en .env.local'
    )
  }

  // privateKey.replace(/\\n/g, '\n') es necesario porque las variables
  // de entorno escapan los saltos de línea del certificado
  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  })
}

// Crear (o reutilizar) la app
const adminApp: App = createFirebaseAdminApp()

// Exportar los servicios que usaremos en el backend
// Firestore: base de datos
// Auth: verificar tokens, crear usuarios, asignar custom claims
export const adminDb: Firestore = getFirestore(adminApp)
export const adminAuth: Auth = getAuth(adminApp)
