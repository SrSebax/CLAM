// Script local (NO se despliega) para otorgar el Custom Claim "admin: true"
// a un usuario de Firebase Auth. Se ejecuta una sola vez por administrador.
//
// Uso:
//   1. Genera una clave de cuenta de servicio en:
//      Firebase Console > Configuración del proyecto > Cuentas de servicio > Generar nueva clave privada
//   2. Guarda el archivo como scripts/serviceAccountKey.json (ya está en .gitignore)
//   3. Ejecuta: npm run admin:grant -- correo@ejemplo.com
//
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const email = process.argv[2]

if (!email) {
  console.error('Uso: npm run admin:grant -- correo@ejemplo.com')
  process.exit(1)
}

const keyPath = path.join(__dirname, 'serviceAccountKey.json')
let serviceAccount
try {
  serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'))
} catch {
  console.error(
    `No se encontró ${keyPath}.\nDescarga la clave de cuenta de servicio desde Firebase Console ` +
      '(Configuración del proyecto > Cuentas de servicio) y guárdala en esa ruta.',
  )
  process.exit(1)
}

initializeApp({ credential: cert(serviceAccount) })

const user = await getAuth().getUserByEmail(email)
await getAuth().setCustomUserClaims(user.uid, { admin: true })

console.log(`✔ Claim "admin: true" asignado a ${email} (uid: ${user.uid}).`)
console.log('El usuario debe cerrar sesión y volver a iniciarla para que el claim tenga efecto.')
