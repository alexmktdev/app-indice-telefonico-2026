/**
 * Importación única (idempotente) del índice estático → Firestore `contactos_indice`.
 *
 * Uso (desde la raíz del proyecto Next):
 *   npm run import:contactos
 *
 * Requiere `.env.local` con las mismas variables que Firebase Admin (FIREBASE_PROJECT_ID,
 * FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).
 *
 * Opcional: SEED_CREATED_BY_UID — UID de un usuario Firebase (si no, se usa el literal
 * `static-import`, solo para trazabilidad en Firestore).
 */

import { config } from 'dotenv'
import { resolve } from 'node:path'
import { FieldValue } from 'firebase-admin/firestore'

config({ path: resolve(process.cwd(), '.env.local') })

const COLLECTION = 'contactos_indice'

async function main() {
  const [{ adminDb }, { CONTACTOS_SEED }] = await Promise.all([
    import('../src/lib/firebase/admin'),
    import('./seed/contactos-static'),
  ])

  const operadorUid = process.env.SEED_CREATED_BY_UID ?? 'static-import'
  const coll = adminDb.collection(COLLECTION)

  let insertados = 0
  let omitidos = 0

  for (const row of CONTACTOS_SEED) {
    const ext = row.extension.trim()
    const snap = await coll.where('extension', '==', ext).limit(1).get()
    if (!snap.empty) {
      console.log(`[omitir] anexo ${ext} ya existe en Firestore`)
      omitidos += 1
      continue
    }

    await coll.add({
      extension: ext,
      department: row.department.trim(),
      name: (row.name ?? '').trim(),
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: operadorUid,
      updatedBy: operadorUid,
    })
    insertados += 1
    console.log(`[ok] ${ext} — ${row.department}`)
  }

  console.log('\nListo.')
  console.log(`  Insertados: ${insertados}`)
  console.log(`  Omitidos (duplicado por anexo): ${omitidos}`)
  console.log(`  Total en seed: ${CONTACTOS_SEED.length}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
