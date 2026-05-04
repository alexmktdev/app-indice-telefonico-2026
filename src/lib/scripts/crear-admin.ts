// ─────────────────────────────────────────────────────────────
// SCRIPT: Crear el primer usuario administrador
//
// Ejecutar con: npx ts-node --skip-project src/lib/scripts/crear-admin.ts
//
// INSTRUCCIONES:
// 1. Primero completa tu archivo .env.local con las credenciales de Firebase
// 2. Cambia las constantes EMAIL, PASSWORD y NOMBRE abajo
// 3. Ejecuta el script
// 4. Elimina este archivo después de usarlo por seguridad
// ─────────────────────────────────────────────────────────────

import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'

// Cargar variables de entorno desde .env.local
dotenv.config({ path: '.env.local' })

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  }),
})

const auth = getAuth(app)
const db = getFirestore(app)

async function crearAdmin() {
  // ═══════════════════════════════════════════════════════════
  // CAMBIA ESTOS VALORES por los tuyos:
  // ═══════════════════════════════════════════════════════════
  const EMAIL = 'aruiz@molina.cl'
  const PASSWORD = 'molina.2026'
  const NOMBRE = 'Alexander Ruiz'
  // ═══════════════════════════════════════════════════════════

  try {
    console.log('Creando usuario en Firebase Auth...')

    const user = await auth.createUser({
      email: EMAIL,
      password: PASSWORD,
      displayName: NOMBRE,
    })

    console.log(`Usuario creado con UID: ${user.uid}`)

    console.log('Asignando rol admin como Custom Claim...')
    await auth.setCustomUserClaims(user.uid, { role: 'admin' })

    console.log('Guardando en Firestore (colección "users")...')
    await db.collection('users').doc(user.uid).set({
      email: EMAIL,
      displayName: NOMBRE,
      role: 'admin',
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: user.uid,
      updatedBy: user.uid,
    })

    console.log('')
    console.log('=== ADMIN CREADO EXITOSAMENTE ===')
    console.log(`   Email: ${EMAIL}`)
    console.log(`   UID: ${user.uid}`)
    console.log(`   Rol: admin`)
    console.log('')
    console.log('IMPORTANTE: Elimina este script ahora (por seguridad).')
    console.log('')

    process.exit(0)
  } catch (error) {
    console.error('ERROR:', error)
    process.exit(1)
  }
}

crearAdmin()
